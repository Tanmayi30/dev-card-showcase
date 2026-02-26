const STORAGE_KEY = "personal_data_vault_dashboard_v1";

const state = {
  apps: [],
  selectedAppId: null
};

const ui = {
  appForm: document.getElementById("appForm"),
  appName: document.getElementById("appName"),
  sensitivity: document.getElementById("sensitivity"),
  categories: document.getElementById("categories"),
  permissions: document.getElementById("permissions"),
  lastUpdated: document.getElementById("lastUpdated"),
  status: document.getElementById("status"),
  notes: document.getElementById("notes"),
  hint: document.getElementById("hint"),
  appCount: document.getElementById("appCount"),
  permCount: document.getElementById("permCount"),
  highRiskCount: document.getElementById("highRiskCount"),
  vaultRisk: document.getElementById("vaultRisk"),
  categoryBars: document.getElementById("categoryBars"),
  exportTemplateBtn: document.getElementById("exportTemplateBtn"),
  deleteTemplateBtn: document.getElementById("deleteTemplateBtn"),
  templateHint: document.getElementById("templateHint"),
  historyRows: document.getElementById("historyRows"),
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
  ui.appForm.addEventListener("submit", onSave);
  ui.exportTemplateBtn.addEventListener("click", copyExportTemplate);
  ui.deleteTemplateBtn.addEventListener("click", copyDeleteTemplate);
  ui.demoBtn.addEventListener("click", loadDemo);
  ui.clearBtn.addEventListener("click", clearAll);
}

function setDefaultDate() {
  if (!ui.lastUpdated.value) ui.lastUpdated.value = new Date().toISOString().slice(0, 10);
}

function onSave(event) {
  event.preventDefault();

  const app = {
    id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: ui.appName.value.trim(),
    sensitivity: ui.sensitivity.value,
    categories: parseCategories(ui.categories.value),
    permissions: clamp(Number(ui.permissions.value) || 0, 0, 100),
    lastUpdated: ui.lastUpdated.value,
    status: ui.status.value,
    notes: ui.notes.value.trim()
  };

  if (!app.name || !app.categories.length || !app.lastUpdated) {
    setHint("App name, categories, and last updated date are required.", true);
    return;
  }

  app.riskScore = computeAppRisk(app);

  state.apps.unshift(app);
  state.selectedAppId = app.id;
  persist();
  render();
  ui.appForm.reset();
  setDefaultDate();
  setHint("App entry saved.", false);
}

function parseCategories(value) {
  return Array.from(new Set(value.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean)));
}

function computeAppRisk(app) {
  const sensitivityWeight = app.sensitivity === "high" ? 32 : app.sensitivity === "medium" ? 20 : 10;
  const permissionWeight = Math.min(36, app.permissions * 1.4);
  const sensitiveCategoryHits = app.categories.filter((c) => /location|contacts|financial|biometric|health|messages|photos|camera|microphone/.test(c)).length;
  const categoryWeight = Math.min(24, sensitiveCategoryHits * 6 + app.categories.length * 1.3);
  const statusWeight = app.status === "unused" ? 8 : app.status === "deleted" ? -10 : 0;

  return clamp(Math.round(sensitivityWeight + permissionWeight + categoryWeight + statusWeight), 0, 100);
}

function computeVaultRisk(apps) {
  if (!apps.length) return 0;
  const avgRisk = apps.reduce((s, a) => s + a.riskScore, 0) / apps.length;
  const highRiskPenalty = apps.filter((a) => a.riskScore >= 70).length * 3;
  return clamp(Math.round(avgRisk + highRiskPenalty), 0, 100);
}

function render() {
  renderStats();
  renderCategoryBars();
  renderRows();
}

function renderStats() {
  ui.appCount.textContent = String(state.apps.length);
  ui.permCount.textContent = String(state.apps.reduce((s, a) => s + a.permissions, 0));

  const highRisk = state.apps.filter((a) => a.riskScore >= 70).length;
  ui.highRiskCount.textContent = String(highRisk);

  const vaultRisk = computeVaultRisk(state.apps);
  ui.vaultRisk.textContent = `${vaultRisk}/100`;
  ui.vaultRisk.style.color = vaultRisk >= 70 ? "var(--danger)" : vaultRisk >= 45 ? "var(--warn)" : "var(--ok)";
}

function renderCategoryBars() {
  ui.categoryBars.innerHTML = "";

  if (!state.apps.length) {
    ui.categoryBars.innerHTML = '<p class="hint">No category data yet.</p>';
    return;
  }

  const counts = {};
  state.apps.forEach((a) => a.categories.forEach((c) => { counts[c] = (counts[c] || 0) + 1; }));

  const rows = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const max = Math.max(1, ...rows.map((r) => r[1]));

  rows.forEach(([category, count]) => {
    const pct = Math.round((count / max) * 100);
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <span>${escapeHtml(category)}</span>
      <div class="bar"><span style="width:${pct}%"></span></div>
      <strong>${count}</strong>
    `;
    ui.categoryBars.appendChild(row);
  });
}

function renderRows() {
  ui.historyRows.innerHTML = "";

  if (!state.apps.length) {
    ui.historyRows.innerHTML = '<tr><td colspan="8">No app entries yet.</td></tr>';
    return;
  }

  state.apps.forEach((app) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(app.name)}</td>
      <td>${escapeHtml(app.categories.join(", "))}</td>
      <td>${app.permissions}</td>
      <td>${escapeHtml(app.sensitivity)}</td>
      <td>${riskPill(app.riskScore)}</td>
      <td>${escapeHtml(app.lastUpdated)}</td>
      <td>${escapeHtml(app.status)}</td>
      <td><button class="btn btn-soft" data-select="${app.id}" type="button">${state.selectedAppId === app.id ? "Selected" : "Select"}</button></td>
    `;
    ui.historyRows.appendChild(tr);
  });

  ui.historyRows.querySelectorAll("[data-select]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedAppId = btn.getAttribute("data-select");
      persist();
      renderRows();
      ui.templateHint.textContent = `Template target: ${selectedApp()?.name || "none"}`;
    });
  });
}

function selectedApp() {
  return state.apps.find((a) => a.id === state.selectedAppId) || null;
}

function copyExportTemplate() {
  const app = selectedApp();
  if (!app) {
    ui.templateHint.textContent = "Select an app first.";
    return;
  }

  const text = [
    `Subject: Data Export Request - ${app.name}`,
    "",
    `Hello ${app.name} Privacy Team,`,
    "",
    "I am requesting a full export of all personal data associated with my account, including:",
    `- Data categories: ${app.categories.join(", ")}`,
    "- Account profile information",
    "- Processing history and sharing logs",
    "- Permission history",
    "",
    "Please provide the export in a commonly used machine-readable format.",
    "",
    "Regards,",
    "[Your Name]"
  ].join("\n");

  copyText(text, "Data export request template copied.");
}

function copyDeleteTemplate() {
  const app = selectedApp();
  if (!app) {
    ui.templateHint.textContent = "Select an app first.";
    return;
  }

  const text = [
    `Subject: Data Deletion Request - ${app.name}`,
    "",
    `Hello ${app.name} Privacy Team,`,
    "",
    "I request deletion of my personal data and closure of my account, including backup and third-party shared records where applicable.",
    `Known categories in your records: ${app.categories.join(", ")}`,
    "",
    "Please confirm completion and expected deletion timeline.",
    "",
    "Regards,",
    "[Your Name]"
  ].join("\n");

  copyText(text, "Deletion request template copied.");
}

function copyText(text, successMessage) {
  navigator.clipboard.writeText(text)
    .then(() => { ui.templateHint.textContent = successMessage; })
    .catch(() => { ui.templateHint.textContent = "Clipboard unavailable in this context."; });
}

function riskPill(score) {
  if (score >= 70) return `<span class="pill pill-high">${score}</span>`;
  if (score >= 45) return `<span class="pill pill-medium">${score}</span>`;
  return `<span class="pill pill-low">${score}</span>`;
}

function loadDemo() {
  state.apps = [
    sample("SocialWave", "high", ["email", "contacts", "location", "photos"], 16, "2026-02-20", "active", "Social networking app"),
    sample("FitPulse", "medium", ["health", "email", "location"], 9, "2026-02-18", "active", "Workout and health data"),
    sample("ShopKart", "medium", ["financial", "address", "email", "purchase history"], 13, "2026-02-12", "unused", "Old ecommerce account"),
    sample("DocCloud", "high", ["documents", "camera", "microphone", "email"], 11, "2026-02-22", "active", "Cloud docs collaboration"),
    sample("GameArc", "low", ["email", "device id"], 4, "2026-01-08", "unused", "Rarely used")
  ];
  state.selectedAppId = state.apps[0].id;
  persist();
  render();
  ui.templateHint.textContent = `Template target: ${state.apps[0].name}`;
  setHint("Demo data loaded.", false);
}

function sample(name, sensitivity, categories, permissions, lastUpdated, status, notes) {
  const app = {
    id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    sensitivity,
    categories,
    permissions,
    lastUpdated,
    status,
    notes
  };
  app.riskScore = computeAppRisk(app);
  return app;
}

function clearAll() {
  state.apps = [];
  state.selectedAppId = null;
  localStorage.removeItem(STORAGE_KEY);
  render();
  ui.templateHint.textContent = "Pick an app from the table first for personalized template text.";
  setHint("Vault cleared.", false);
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.apps)) state.apps = parsed.apps;
    if (typeof parsed.selectedAppId === "string") state.selectedAppId = parsed.selectedAppId;
  } catch (err) {
    console.error("hydrate failed", err);
  }
}

function setHint(message, isErr) {
  ui.hint.textContent = message;
  ui.hint.style.color = isErr ? "var(--danger)" : "var(--muted)";
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
