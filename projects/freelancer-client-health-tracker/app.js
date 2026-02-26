const STORAGE_KEY = "freelancer_client_health_tracker_v1";

const state = {
  clients: []
};

const ui = {
  clientForm: document.getElementById("clientForm"),
  clientName: document.getElementById("clientName"),
  projectName: document.getElementById("projectName"),
  lastReply: document.getElementById("lastReply"),
  overdueDays: document.getElementById("overdueDays"),
  scopeChanges: document.getElementById("scopeChanges"),
  commQuality: document.getElementById("commQuality"),
  paymentReliability: document.getElementById("paymentReliability"),
  projectValue: document.getElementById("projectValue"),
  notes: document.getElementById("notes"),
  hint: document.getElementById("hint"),
  clientCount: document.getElementById("clientCount"),
  highRiskCount: document.getElementById("highRiskCount"),
  overdueCount: document.getElementById("overdueCount"),
  portfolioRisk: document.getElementById("portfolioRisk"),
  priorityList: document.getElementById("priorityList"),
  riskBars: document.getElementById("riskBars"),
  ledgerRows: document.getElementById("ledgerRows"),
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
  ui.clientForm.addEventListener("submit", onSave);
  ui.demoBtn.addEventListener("click", loadDemo);
  ui.clearBtn.addEventListener("click", clearAll);
}

function setDefaultDate() {
  if (!ui.lastReply.value) ui.lastReply.value = new Date().toISOString().slice(0, 10);
}

function onSave(event) {
  event.preventDefault();

  const client = {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    clientName: ui.clientName.value.trim(),
    projectName: ui.projectName.value.trim(),
    lastReply: ui.lastReply.value,
    overdueDays: clamp(Number(ui.overdueDays.value) || 0, 0, 180),
    scopeChanges: clamp(Number(ui.scopeChanges.value) || 0, 0, 50),
    commQuality: ui.commQuality.value,
    paymentReliability: ui.paymentReliability.value,
    projectValue: Math.max(0, Number(ui.projectValue.value) || 0),
    notes: ui.notes.value.trim(),
    status: "Active"
  };

  if (!client.clientName || !client.projectName || !client.lastReply) {
    setHint("Client name, project name, and last reply date are required.", true);
    return;
  }

  const daysSilent = daysSince(client.lastReply);
  client.daysSilent = daysSilent;
  client.riskScore = computeRisk(client);
  client.nextAction = suggestAction(client);

  state.clients.unshift(client);
  persist();
  render();

  ui.clientForm.reset();
  setDefaultDate();
  setHint("Client entry saved.", false);
}

function computeRisk(client) {
  const commWeight = client.commQuality === "poor" ? 24 : client.commQuality === "average" ? 12 : 4;
  const payWeight = client.paymentReliability === "low" ? 28 : client.paymentReliability === "medium" ? 16 : 5;
  const overdueWeight = Math.min(30, client.overdueDays * 1.2);
  const scopeWeight = Math.min(18, client.scopeChanges * 2.2);
  const silentWeight = Math.min(20, client.daysSilent * 1.1);
  const valueWeight = client.projectValue >= 10000 ? 6 : client.projectValue >= 4000 ? 3 : 0;

  return clamp(Math.round(commWeight + payWeight + overdueWeight + scopeWeight + silentWeight + valueWeight), 0, 100);
}

function suggestAction(client) {
  if (client.overdueDays >= 14) return "Send formal payment reminder and pause new scope work.";
  if (client.scopeChanges >= 4) return "Issue scope-change addendum and revised quote.";
  if (client.daysSilent >= 7) return "Schedule follow-up call and request written approval on pending items.";
  if (client.paymentReliability === "low") return "Request upfront milestone payment before next deliverable.";
  return "Maintain weekly update cadence and document decisions.";
}

function render() {
  renderStats();
  renderPriority();
  renderRiskDrivers();
  renderLedger();
}

function renderStats() {
  ui.clientCount.textContent = String(state.clients.length);
  const highRisk = state.clients.filter((c) => c.riskScore >= 70).length;
  const overdue = state.clients.filter((c) => c.overdueDays > 0).length;
  const portfolio = state.clients.length
    ? clamp(Math.round(avg(state.clients.map((c) => c.riskScore)) + highRisk * 2), 0, 100)
    : 0;

  ui.highRiskCount.textContent = String(highRisk);
  ui.overdueCount.textContent = String(overdue);
  ui.portfolioRisk.textContent = `${portfolio}/100`;
  ui.portfolioRisk.style.color = portfolio >= 70 ? "var(--danger)" : portfolio >= 45 ? "var(--warn)" : "var(--ok)";
}

function renderPriority() {
  ui.priorityList.innerHTML = "";

  if (!state.clients.length) {
    appendPriority("No clients added yet.");
    return;
  }

  const sorted = state.clients.slice().sort((a, b) => b.riskScore - a.riskScore || b.overdueDays - a.overdueDays);
  sorted.slice(0, 6).forEach((c) => {
    appendPriority(`${c.clientName} - ${c.projectName}: Risk ${c.riskScore}/100. ${c.nextAction}`);
  });
}

function appendPriority(text) {
  const li = document.createElement("li");
  li.textContent = text;
  ui.priorityList.appendChild(li);
}

function renderRiskDrivers() {
  ui.riskBars.innerHTML = "";

  if (!state.clients.length) {
    ui.riskBars.innerHTML = '<p class="hint">No risk data yet.</p>';
    return;
  }

  const drivers = {
    communication: avg(state.clients.map((c) => (c.commQuality === "poor" ? 1 : c.commQuality === "average" ? 0.5 : 0.2))),
    payment: avg(state.clients.map((c) => (c.paymentReliability === "low" ? 1 : c.paymentReliability === "medium" ? 0.55 : 0.2))),
    overdue: avg(state.clients.map((c) => Math.min(1, c.overdueDays / 30))),
    scope_drift: avg(state.clients.map((c) => Math.min(1, c.scopeChanges / 8))),
    silence: avg(state.clients.map((c) => Math.min(1, c.daysSilent / 14)))
  };

  Object.entries(drivers).forEach(([name, val]) => {
    const pct = Math.round(val * 100);
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <span>${escapeHtml(name.replace("_", " "))}</span>
      <div class="bar"><span style="width:${pct}%"></span></div>
      <strong>${pct}</strong>
    `;
    ui.riskBars.appendChild(row);
  });
}

function renderLedger() {
  ui.ledgerRows.innerHTML = "";

  if (!state.clients.length) {
    ui.ledgerRows.innerHTML = '<tr><td colspan="9">No client projects tracked yet.</td></tr>';
    return;
  }

  state.clients.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(c.clientName)}</td>
      <td>${escapeHtml(c.projectName)}</td>
      <td>${escapeHtml(c.commQuality)}</td>
      <td>${escapeHtml(c.paymentReliability)}</td>
      <td>${c.overdueDays}d</td>
      <td>${c.scopeChanges}</td>
      <td>${riskPill(c.riskScore)}</td>
      <td>${escapeHtml(c.nextAction)}</td>
      <td>
        <select class="status-select" data-status="${c.id}">
          <option value="Active" ${c.status === "Active" ? "selected" : ""}>Active</option>
          <option value="Watchlist" ${c.status === "Watchlist" ? "selected" : ""}>Watchlist</option>
          <option value="Paused" ${c.status === "Paused" ? "selected" : ""}>Paused</option>
          <option value="Closed" ${c.status === "Closed" ? "selected" : ""}>Closed</option>
        </select>
      </td>
    `;
    ui.ledgerRows.appendChild(tr);
  });

  ui.ledgerRows.querySelectorAll("[data-status]").forEach((sel) => {
    sel.addEventListener("change", (e) => {
      const id = sel.getAttribute("data-status");
      const client = state.clients.find((x) => x.id === id);
      if (!client) return;
      client.status = e.target.value;
      persist();
    });
  });
}

function riskPill(score) {
  if (score >= 70) return `<span class="pill pill-high">${score}</span>`;
  if (score >= 45) return `<span class="pill pill-medium">${score}</span>`;
  return `<span class="pill pill-low">${score}</span>`;
}

function daysSince(isoDate) {
  const t = new Date(`${isoDate}T00:00:00`).getTime();
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - t) / (1000 * 60 * 60 * 24)));
}

function loadDemo() {
  state.clients = [
    makeDemo("Nova Labs", "SaaS Dashboard", "2026-02-23", 0, 1, "good", "high", 5500, "Fast approvals"),
    makeDemo("Bright Retail", "E-commerce Revamp", "2026-02-14", 18, 4, "average", "low", 12000, "Invoice pending"),
    makeDemo("Orbit Edu", "Course Platform", "2026-02-18", 5, 3, "average", "medium", 6800, "Frequent changes"),
    makeDemo("ZenFit", "Mobile App UI", "2026-02-10", 0, 6, "poor", "medium", 4300, "Scope creep risk"),
    makeDemo("Quanta AI", "Brand Website", "2026-02-25", 0, 0, "good", "high", 3000, "Healthy communication")
  ];
  persist();
  render();
  setHint("Demo clients loaded.", false);
}

function makeDemo(clientName, projectName, lastReply, overdueDays, scopeChanges, commQuality, paymentReliability, projectValue, notes) {
  const c = {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    clientName,
    projectName,
    lastReply,
    overdueDays,
    scopeChanges,
    commQuality,
    paymentReliability,
    projectValue,
    notes,
    status: "Active"
  };
  c.daysSilent = daysSince(c.lastReply);
  c.riskScore = computeRisk(c);
  c.nextAction = suggestAction(c);
  return c;
}

function clearAll() {
  state.clients = [];
  localStorage.removeItem(STORAGE_KEY);
  render();
  setHint("Tracker cleared.", false);
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.clients)) {
      state.clients = parsed.clients.map((c) => {
        c.daysSilent = daysSince(c.lastReply);
        c.riskScore = computeRisk(c);
        c.nextAction = suggestAction(c);
        return c;
      });
    }
  } catch (err) {
    console.error("hydrate failed", err);
  }
}

function setHint(text, isErr) {
  ui.hint.textContent = text;
  ui.hint.style.color = isErr ? "var(--danger)" : "var(--muted)";
}

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((s, n) => s + n, 0) / values.length;
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
