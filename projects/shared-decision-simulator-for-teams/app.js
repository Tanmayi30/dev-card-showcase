const STORAGE_KEY = "shared_decision_simulator_for_teams_v1";

const state = {
  scenarios: []
};

const ui = {
  scenarioForm: document.getElementById("scenarioForm"),
  decisionType: document.getElementById("decisionType"),
  scenarioName: document.getElementById("scenarioName"),
  assumptions: document.getElementById("assumptions"),
  revenueImpact: document.getElementById("revenueImpact"),
  customerImpact: document.getElementById("customerImpact"),
  complexity: document.getElementById("complexity"),
  riskProbability: document.getElementById("riskProbability"),
  timeToValue: document.getElementById("timeToValue"),
  confidence: document.getElementById("confidence"),
  outcomeNotes: document.getElementById("outcomeNotes"),
  hint: document.getElementById("hint"),
  scenarioCount: document.getElementById("scenarioCount"),
  bestScore: document.getElementById("bestScore"),
  avgRisk: document.getElementById("avgRisk"),
  avgConfidence: document.getElementById("avgConfidence"),
  topRecommendation: document.getElementById("topRecommendation"),
  tradeoffBars: document.getElementById("tradeoffBars"),
  scenarioRows: document.getElementById("scenarioRows"),
  demoBtn: document.getElementById("demoBtn"),
  clearBtn: document.getElementById("clearBtn")
};

init();

function init() {
  hydrate();
  bind();
  render();
}

function bind() {
  ui.scenarioForm.addEventListener("submit", onAddScenario);
  ui.demoBtn.addEventListener("click", loadDemo);
  ui.clearBtn.addEventListener("click", clearAll);
}

function onAddScenario(event) {
  event.preventDefault();

  const scenario = {
    id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    decisionType: ui.decisionType.value,
    scenarioName: ui.scenarioName.value.trim(),
    assumptions: parseList(ui.assumptions.value),
    revenueImpact: clamp(Number(ui.revenueImpact.value) || 0, -100, 100),
    customerImpact: clamp(Number(ui.customerImpact.value) || 0, -100, 100),
    complexity: clamp(Number(ui.complexity.value) || 5, 1, 10),
    riskProbability: clamp(Number(ui.riskProbability.value) || 0, 0, 100),
    timeToValue: clamp(Number(ui.timeToValue.value) || 1, 1, 52),
    confidence: clamp(Number(ui.confidence.value) || 0, 0, 100),
    outcomeNotes: ui.outcomeNotes.value.trim()
  };

  if (!scenario.scenarioName || !scenario.assumptions.length) {
    setHint("Scenario name and assumptions are required.", true);
    return;
  }

  scenario.decisionScore = computeDecisionScore(scenario);
  state.scenarios.push(scenario);
  persist();
  render();

  ui.scenarioForm.reset();
  setHint("Scenario added to comparison board.", false);
}

function parseList(text) {
  return Array.from(new Set(text.split(",").map((x) => x.trim()).filter(Boolean)));
}

function computeDecisionScore(s) {
  const upside = (s.revenueImpact * 0.35) + (s.customerImpact * 0.35);
  const confidenceBoost = s.confidence * 0.2;
  const penalty = (s.riskProbability * 0.22) + (s.complexity * 4) + (s.timeToValue * 0.8);
  const base = upside + confidenceBoost - penalty + 50;
  return clamp(Math.round(base), 0, 100);
}

function render() {
  renderStats();
  renderRecommendation();
  renderTradeoffBars();
  renderRows();
}

function renderStats() {
  ui.scenarioCount.textContent = String(state.scenarios.length);

  if (!state.scenarios.length) {
    ui.bestScore.textContent = "0";
    ui.avgRisk.textContent = "0%";
    ui.avgConfidence.textContent = "0%";
    return;
  }

  const best = Math.max(...state.scenarios.map((s) => s.decisionScore));
  const avgRisk = avg(state.scenarios.map((s) => s.riskProbability));
  const avgConf = avg(state.scenarios.map((s) => s.confidence));

  ui.bestScore.textContent = String(best);
  ui.avgRisk.textContent = `${Math.round(avgRisk)}%`;
  ui.avgConfidence.textContent = `${Math.round(avgConf)}%`;
}

function renderRecommendation() {
  if (!state.scenarios.length) {
    ui.topRecommendation.textContent = "Add scenarios to see recommended option.";
    return;
  }

  const ranked = state.scenarios.slice().sort((a, b) => b.decisionScore - a.decisionScore);
  const top = ranked[0];
  const second = ranked[1];
  const margin = second ? top.decisionScore - second.decisionScore : top.decisionScore;

  ui.topRecommendation.textContent =
    `${top.scenarioName} is currently best (score ${top.decisionScore}/100). Confidence ${top.confidence}% with risk ${top.riskProbability}%. Margin vs next option: ${margin} points.`;
}

function renderTradeoffBars() {
  ui.tradeoffBars.innerHTML = "";

  if (!state.scenarios.length) {
    ui.tradeoffBars.innerHTML = '<p class="hint">No tradeoff data yet.</p>';
    return;
  }

  const metrics = {
    revenue_upside: normalize(avg(state.scenarios.map((s) => s.revenueImpact)), -100, 100),
    customer_impact: normalize(avg(state.scenarios.map((s) => s.customerImpact)), -100, 100),
    complexity_load: normalize(avg(state.scenarios.map((s) => s.complexity)), 1, 10),
    risk_exposure: normalize(avg(state.scenarios.map((s) => s.riskProbability)), 0, 100),
    confidence_strength: normalize(avg(state.scenarios.map((s) => s.confidence)), 0, 100)
  };

  Object.entries(metrics).forEach(([name, v]) => {
    const pct = Math.round(v * 100);
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <span>${escapeHtml(name.replace("_", " "))}</span>
      <div class="bar"><span style="width:${pct}%"></span></div>
      <strong>${pct}</strong>
    `;
    ui.tradeoffBars.appendChild(row);
  });
}

function renderRows() {
  ui.scenarioRows.innerHTML = "";

  if (!state.scenarios.length) {
    ui.scenarioRows.innerHTML = '<tr><td colspan="9">No scenarios yet.</td></tr>';
    return;
  }

  state.scenarios
    .slice()
    .sort((a, b) => b.decisionScore - a.decisionScore)
    .forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(s.scenarioName)}</td>
        <td>${escapeHtml(s.decisionType)}</td>
        <td>${escapeHtml(s.assumptions.join("; "))}</td>
        <td>${s.revenueImpact}</td>
        <td>${s.customerImpact}</td>
        <td>${s.complexity}</td>
        <td>${s.riskProbability}%</td>
        <td>${s.confidence}%</td>
        <td>${scorePill(s.decisionScore)}</td>
      `;
      ui.scenarioRows.appendChild(tr);
    });
}

function scorePill(score) {
  if (score >= 70) return `<span class="pill pill-good">${score}</span>`;
  if (score >= 45) return `<span class="pill pill-mid">${score}</span>`;
  return `<span class="pill pill-low">${score}</span>`;
}

function loadDemo() {
  state.scenarios = [
    sample("Pricing Change", "Raise Pro Plan 15%", ["Low churn", "Strong value perception", "Sales enablement ready"], 38, -8, 4, 42, 6, 72, "Revenue gains likely, watch SME churn."),
    sample("Roadmap Shift", "Delay AI feature, fix onboarding", ["Activation is bottleneck", "Retention tied to first-week success"], 18, 46, 5, 30, 5, 78, "Short-term growth slower, long-term retention stronger."),
    sample("Hiring Plan", "Hire 2 support specialists", ["Ticket load rising", "Quality issues from response delay"], 10, 35, 6, 25, 10, 66, "Improves CX but slower time-to-value for revenue."),
    sample("Go-to-Market", "Expand into mid-market segment", ["Sales cycle manageable", "Product fit adequate"], 52, 12, 8, 58, 14, 61, "High upside with high execution risk.")
  ];
  persist();
  render();
  setHint("Demo scenarios loaded.", false);
}

function sample(decisionType, scenarioName, assumptions, revenueImpact, customerImpact, complexity, riskProbability, timeToValue, confidence, outcomeNotes) {
  const s = {
    id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    decisionType,
    scenarioName,
    assumptions,
    revenueImpact,
    customerImpact,
    complexity,
    riskProbability,
    timeToValue,
    confidence,
    outcomeNotes
  };
  s.decisionScore = computeDecisionScore(s);
  return s;
}

function clearAll() {
  state.scenarios = [];
  localStorage.removeItem(STORAGE_KEY);
  render();
  setHint("Workspace cleared.", false);
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.scenarios)) {
      state.scenarios = parsed.scenarios.map((s) => ({ ...s, decisionScore: computeDecisionScore(s) }));
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

function normalize(v, min, max) {
  if (max <= min) return 0;
  return clamp((v - min) / (max - min), 0, 1);
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
