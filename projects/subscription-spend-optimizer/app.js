const STORAGE_KEY = "subscription_spend_optimizer_v1";

const state = {
  subscriptions: [],
  savingsGoal: 50
};

const ui = {
  subscriptionForm: document.getElementById("subscriptionForm"),
  serviceName: document.getElementById("serviceName"),
  category: document.getElementById("category"),
  billingCycle: document.getElementById("billingCycle"),
  cost: document.getElementById("cost"),
  usage: document.getElementById("usage"),
  renewalDate: document.getElementById("renewalDate"),
  cancelLink: document.getElementById("cancelLink"),
  hint: document.getElementById("hint"),
  monthlySpend: document.getElementById("monthlySpend"),
  yearlySpend: document.getElementById("yearlySpend"),
  lowUsageCount: document.getElementById("lowUsageCount"),
  renewalsSoon: document.getElementById("renewalsSoon"),
  savingsGoal: document.getElementById("savingsGoal"),
  updateGoalBtn: document.getElementById("updateGoalBtn"),
  goalProgress: document.getElementById("goalProgress"),
  priorityList: document.getElementById("priorityList"),
  subscriptionRows: document.getElementById("subscriptionRows"),
  demoBtn: document.getElementById("demoBtn"),
  clearBtn: document.getElementById("clearBtn")
};

init();

function init() {
  hydrate();
  setDefaultDate();
  bind();
  render();
}

function bind() {
  ui.subscriptionForm.addEventListener("submit", onSaveSubscription);
  ui.updateGoalBtn.addEventListener("click", onUpdateGoal);
  ui.demoBtn.addEventListener("click", loadDemo);
  ui.clearBtn.addEventListener("click", clearAll);
}

function setDefaultDate() {
  if (!ui.renewalDate.value) {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    ui.renewalDate.value = d.toISOString().slice(0, 10);
  }
  ui.savingsGoal.value = String(state.savingsGoal || 50);
}

function onSaveSubscription(event) {
  event.preventDefault();

  const item = {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    serviceName: ui.serviceName.value.trim(),
    category: ui.category.value,
    billingCycle: ui.billingCycle.value,
    cost: Math.max(0, Number(ui.cost.value) || 0),
    usage: clamp(Number(ui.usage.value) || 0, 0, 200),
    renewalDate: ui.renewalDate.value,
    cancelLink: ui.cancelLink.value.trim(),
    status: "active"
  };

  if (!item.serviceName || !item.renewalDate) {
    setHint("Service name and renewal date are required.", true);
    return;
  }

  item.monthlyCost = toMonthly(item.cost, item.billingCycle);
  item.yearlyCost = item.monthlyCost * 12;
  item.flag = classifyUsage(item);

  state.subscriptions.unshift(item);
  persist();
  render();

  ui.subscriptionForm.reset();
  setDefaultDate();
  setHint("Subscription added.", false);
}

function onUpdateGoal() {
  state.savingsGoal = Math.max(0, Number(ui.savingsGoal.value) || 0);
  persist();
  renderGoalProgress();
}

function toMonthly(cost, cycle) {
  return cycle === "yearly" ? cost / 12 : cost;
}

function classifyUsage(item) {
  const valuePerUse = item.usage > 0 ? item.monthlyCost / item.usage : item.monthlyCost;
  if (item.usage <= 1 || valuePerUse > 15) return "low";
  if (item.usage <= 4 || valuePerUse > 8) return "medium";
  return "good";
}

function render() {
  renderStats();
  renderGoalProgress();
  renderPriorityList();
  renderRows();
}

function renderStats() {
  const active = state.subscriptions.filter((s) => s.status === "active");

  const monthly = sum(active.map((s) => s.monthlyCost));
  const yearly = monthly * 12;
  const low = active.filter((s) => s.flag === "low").length;
  const soon = active.filter((s) => daysUntil(s.renewalDate) >= 0 && daysUntil(s.renewalDate) <= 7).length;

  ui.monthlySpend.textContent = `$${monthly.toFixed(2)}`;
  ui.yearlySpend.textContent = `$${yearly.toFixed(2)}`;
  ui.lowUsageCount.textContent = String(low);
  ui.renewalsSoon.textContent = String(soon);
}

function renderGoalProgress() {
  const active = state.subscriptions.filter((s) => s.status === "active");
  const potentialSavings = sum(active.filter((s) => s.flag === "low").map((s) => s.monthlyCost));
  const goal = state.savingsGoal || 0;
  const pct = goal > 0 ? Math.min(100, Math.round((potentialSavings / goal) * 100)) : 0;

  ui.goalProgress.textContent = `Potential monthly savings from low-usage cuts: $${potentialSavings.toFixed(2)} / $${goal.toFixed(2)} goal (${pct}%).`;
  ui.goalProgress.style.color = pct >= 100 ? "var(--ok)" : pct >= 60 ? "var(--warn)" : "var(--muted)";
}

function renderPriorityList() {
  ui.priorityList.innerHTML = "";
  const active = state.subscriptions.filter((s) => s.status === "active");

  if (!active.length) {
    appendPriority("No subscriptions tracked yet.");
    return;
  }

  active
    .map((s) => ({ ...s, urgency: computeUrgency(s) }))
    .sort((a, b) => b.urgency - a.urgency)
    .slice(0, 6)
    .forEach((s) => {
      const d = daysUntil(s.renewalDate);
      const renew = d < 0 ? "overdue renewal check" : `${d} day(s) to renewal`;
      appendPriority(`${s.serviceName}: ${s.flag} usage, $${s.monthlyCost.toFixed(2)}/mo, ${renew}.`);
    });
}

function appendPriority(text) {
  const li = document.createElement("li");
  li.textContent = text;
  ui.priorityList.appendChild(li);
}

function computeUrgency(s) {
  const usagePenalty = s.flag === "low" ? 35 : s.flag === "medium" ? 15 : 3;
  const costWeight = Math.min(25, s.monthlyCost * 1.2);
  const days = daysUntil(s.renewalDate);
  const renewalUrgency = days <= 0 ? 30 : days <= 7 ? 22 : days <= 14 ? 12 : 4;
  return usagePenalty + costWeight + renewalUrgency;
}

function renderRows() {
  ui.subscriptionRows.innerHTML = "";

  if (!state.subscriptions.length) {
    ui.subscriptionRows.innerHTML = '<tr><td colspan="8">No subscriptions yet.</td></tr>';
    return;
  }

  state.subscriptions
    .slice()
    .sort((a, b) => computeUrgency(b) - computeUrgency(a))
    .forEach((s) => {
      const tr = document.createElement("tr");
      const days = daysUntil(s.renewalDate);
      const renewText = days < 0 ? `${Math.abs(days)} day(s) ago` : `${days} day(s)`;
      tr.innerHTML = `
        <td>${escapeHtml(s.serviceName)}</td>
        <td>${escapeHtml(s.billingCycle)}</td>
        <td>$${s.cost.toFixed(2)}</td>
        <td>${s.usage}</td>
        <td>${escapeHtml(s.renewalDate)} (${renewText})</td>
        <td>${flagPill(s.flag)}</td>
        <td>
          <select data-status="${s.id}">
            <option value="active" ${s.status === "active" ? "selected" : ""}>Active</option>
            <option value="paused" ${s.status === "paused" ? "selected" : ""}>Paused</option>
            <option value="cancelled" ${s.status === "cancelled" ? "selected" : ""}>Cancelled</option>
          </select>
        </td>
        <td>
          ${s.cancelLink ? `<a class="btn btn-soft" href="${escapeAttr(s.cancelLink)}" target="_blank" rel="noopener noreferrer">Cancel Flow</a>` : ""}
        </td>
      `;
      ui.subscriptionRows.appendChild(tr);
    });

  ui.subscriptionRows.querySelectorAll("[data-status]").forEach((sel) => {
    sel.addEventListener("change", (e) => {
      const id = sel.getAttribute("data-status");
      const item = state.subscriptions.find((x) => x.id === id);
      if (!item) return;
      item.status = e.target.value;
      persist();
      render();
    });
  });
}

function flagPill(flag) {
  if (flag === "good") return '<span class="pill pill-good">good</span>';
  if (flag === "medium") return '<span class="pill pill-mid">watch</span>';
  return '<span class="pill pill-low">cut</span>';
}

function daysUntil(isoDate) {
  const t = new Date(`${isoDate}T00:00:00`).getTime();
  const now = Date.now();
  return Math.floor((t - now) / (1000 * 60 * 60 * 24));
}

function loadDemo() {
  state.subscriptions = [
    makeDemo("Netflix", "Entertainment", "monthly", 15.49, 2, 3, "https://www.netflix.com/cancelplan"),
    makeDemo("Figma", "Productivity", "monthly", 12, 20, 12, "https://www.figma.com/settings/billing"),
    makeDemo("Gym Membership", "Fitness", "monthly", 45, 3, 6, ""),
    makeDemo("Cloud Backup", "Utilities", "yearly", 99, 1, 20, "https://example.com/cancel"),
    makeDemo("Learning Platform", "Education", "yearly", 180, 2, 9, "https://example.com/account/cancel")
  ];

  state.savingsGoal = 60;
  persist();
  setDefaultDate();
  render();
  setHint("Demo subscriptions loaded.", false);
}

function makeDemo(serviceName, category, billingCycle, cost, usage, renewInDays, cancelLink) {
  const d = new Date();
  d.setDate(d.getDate() + renewInDays);
  const item = {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    serviceName,
    category,
    billingCycle,
    cost,
    usage,
    renewalDate: d.toISOString().slice(0, 10),
    cancelLink,
    status: "active"
  };
  item.monthlyCost = toMonthly(item.cost, item.billingCycle);
  item.yearlyCost = item.monthlyCost * 12;
  item.flag = classifyUsage(item);
  return item;
}

function clearAll() {
  state.subscriptions = [];
  state.savingsGoal = 50;
  localStorage.removeItem(STORAGE_KEY);
  render();
  setDefaultDate();
  setHint("All data cleared.", false);
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.subscriptions)) {
      state.subscriptions = parsed.subscriptions.map((s) => {
        s.monthlyCost = toMonthly(s.cost, s.billingCycle);
        s.yearlyCost = s.monthlyCost * 12;
        s.flag = classifyUsage(s);
        return s;
      });
    }
    if (typeof parsed.savingsGoal === "number") state.savingsGoal = parsed.savingsGoal;
  } catch (err) {
    console.error("hydrate failed", err);
  }
}

function setHint(text, isErr) {
  ui.hint.textContent = text;
  ui.hint.style.color = isErr ? "var(--danger)" : "var(--muted)";
}

function sum(values) {
  return values.reduce((a, b) => a + b, 0);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(input) {
  return escapeHtml(input).replace(/`/g, "&#96;");
}
