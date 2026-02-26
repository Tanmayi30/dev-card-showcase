const STORAGE_KEY = "burnout_dashboard_state_v1";

const state = {
  entries: []
};

const nodes = {
  form: document.getElementById("checkinForm"),
  checkinDate: document.getElementById("checkinDate"),
  workload: document.getElementById("workload"),
  sleep: document.getElementById("sleep"),
  mood: document.getElementById("mood"),
  focus: document.getElementById("focus"),
  stress: document.getElementById("stress"),
  notes: document.getElementById("notes"),
  workloadOut: document.getElementById("workloadOut"),
  sleepOut: document.getElementById("sleepOut"),
  moodOut: document.getElementById("moodOut"),
  focusOut: document.getElementById("focusOut"),
  stressOut: document.getElementById("stressOut"),
  formHint: document.getElementById("formHint"),
  riskScore: document.getElementById("riskScore"),
  riskLevel: document.getElementById("riskLevel"),
  avgSleep: document.getElementById("avgSleep"),
  avgWorkload: document.getElementById("avgWorkload"),
  warningText: document.getElementById("warningText"),
  recoveryPlan: document.getElementById("recoveryPlan"),
  historyRows: document.getElementById("historyRows"),
  trendChart: document.getElementById("trendChart"),
  loadDemoBtn: document.getElementById("loadDemoBtn"),
  clearBtn: document.getElementById("clearBtn")
};

init();

function init() {
  hydrate();
  bindEvents();
  setDefaultDate();
  syncRangeOutputs();
  render();
}

function bindEvents() {
  nodes.form.addEventListener("submit", onSubmit);
  nodes.loadDemoBtn.addEventListener("click", loadDemo);
  nodes.clearBtn.addEventListener("click", clearAll);

  [nodes.workload, nodes.sleep, nodes.mood, nodes.focus, nodes.stress].forEach((input) => {
    input.addEventListener("input", syncRangeOutputs);
  });
}

function setDefaultDate() {
  if (!nodes.checkinDate.value) {
    nodes.checkinDate.value = new Date().toISOString().slice(0, 10);
  }
}

function syncRangeOutputs() {
  nodes.workloadOut.textContent = nodes.workload.value;
  nodes.sleepOut.textContent = nodes.sleep.value;
  nodes.moodOut.textContent = nodes.mood.value;
  nodes.focusOut.textContent = nodes.focus.value;
  nodes.stressOut.textContent = nodes.stress.value;
}

function onSubmit(event) {
  event.preventDefault();

  const entry = {
    date: nodes.checkinDate.value,
    workload: Number(nodes.workload.value),
    sleep: Number(nodes.sleep.value),
    mood: Number(nodes.mood.value),
    focus: Number(nodes.focus.value),
    stress: Number(nodes.stress.value),
    notes: nodes.notes.value.trim().slice(0, 240)
  };

  if (!entry.date) {
    setHint("Please choose a valid date.", true);
    return;
  }

  const existingIndex = state.entries.findIndex((item) => item.date === entry.date);
  if (existingIndex >= 0) {
    state.entries[existingIndex] = entry;
    setHint("Updated existing check-in for this date.", false);
  } else {
    state.entries.push(entry);
    setHint("Check-in saved.", false);
  }

  state.entries.sort((a, b) => a.date.localeCompare(b.date));
  persist();
  render();
}

function render() {
  const recent = state.entries.slice(-14);
  paintScoreCards(recent);
  paintWarning(recent);
  paintRecoveryPlan(recent);
  paintHistory();
  paintChart(recent);
}

function paintScoreCards(entries) {
  if (!entries.length) {
    nodes.riskScore.textContent = "--";
    nodes.riskLevel.textContent = "--";
    nodes.avgSleep.textContent = "--";
    nodes.avgWorkload.textContent = "--";
    nodes.riskScore.style.color = "";
    nodes.riskLevel.style.color = "";
    return;
  }

  const risk = computeRisk(entries);
  const avgSleep = average(entries.map((e) => e.sleep));
  const avgWorkload = average(entries.map((e) => e.workload));
  const level = riskLevel(risk);

  nodes.riskScore.textContent = `${risk}/100`;
  nodes.riskLevel.textContent = level;
  nodes.avgSleep.textContent = `${avgSleep.toFixed(1)} hrs`;
  nodes.avgWorkload.textContent = `${avgWorkload.toFixed(1)}/10`;

  nodes.riskScore.style.color = risk >= 70 ? "var(--danger)" : risk >= 45 ? "var(--warn)" : "var(--ok)";
  nodes.riskLevel.style.color = nodes.riskScore.style.color;
}

function paintWarning(entries) {
  if (entries.length < 4) {
    nodes.warningText.textContent = "Need at least 4 days of data to detect early warning patterns.";
    return;
  }

  const last3 = entries.slice(-3);
  const prev3 = entries.slice(-6, -3);

  const workloadJump = average(last3.map((e) => e.workload)) - average(prev3.map((e) => e.workload));
  const sleepDrop = average(prev3.map((e) => e.sleep)) - average(last3.map((e) => e.sleep));
  const moodDrop = average(prev3.map((e) => e.mood)) - average(last3.map((e) => e.mood));

  const warnings = [];
  if (workloadJump >= 1) warnings.push("workload has increased in the last 3 days");
  if (sleepDrop >= 0.8) warnings.push("sleep trend is declining");
  if (moodDrop >= 0.8) warnings.push("mood trend is declining");

  if (!warnings.length) {
    nodes.warningText.textContent = "No acute warning trend right now. Maintain routines and monitor stress spikes.";
    return;
  }

  nodes.warningText.textContent = `Early warning: ${warnings.join("; ")}. Consider lighter task planning for the next 48 hours.`;
}

function paintRecoveryPlan(entries) {
  nodes.recoveryPlan.innerHTML = "";

  if (!entries.length) {
    appendPlan(["Add your first check-in to generate a personalized recovery plan."]);
    return;
  }

  const slice = entries.slice(-7);
  const avgSleep = average(slice.map((e) => e.sleep));
  const avgMood = average(slice.map((e) => e.mood));
  const avgFocus = average(slice.map((e) => e.focus));
  const avgWorkload = average(slice.map((e) => e.workload));
  const avgStress = average(slice.map((e) => e.stress));

  const plan = [];

  if (avgSleep < 6.8) plan.push("Sleep reset: fixed wind-down alarm, no screens 45 mins before bed, target +45 mins/night.");
  if (avgWorkload > 7) plan.push("Workload cap: reduce non-critical tasks by 20% and block one no-meeting focus window daily.");
  if (avgStress > 6.5) plan.push("Stress decompression: 2 short breathing breaks and one 20-minute walk after peak workload.");
  if (avgFocus < 5.5) plan.push("Focus repair: work in 45/10 deep-work cycles and mute non-urgent notifications.");
  if (avgMood < 5.5) plan.push("Mood protection: schedule one recovery activity daily (social, exercise, or hobby).\n");

  plan.push("Friday review: check score trend and adjust next week before overload compounds.");

  appendPlan(plan.slice(0, 5));
}

function appendPlan(items) {
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    nodes.recoveryPlan.appendChild(li);
  });
}

function paintHistory() {
  nodes.historyRows.innerHTML = "";

  if (!state.entries.length) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="7" class="muted">No check-ins yet.</td>';
    nodes.historyRows.appendChild(row);
    return;
  }

  state.entries.slice().reverse().forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(entry.date)}</td>
      <td>${entry.workload}</td>
      <td>${entry.sleep}</td>
      <td>${entry.mood}</td>
      <td>${entry.focus}</td>
      <td>${entry.stress}</td>
      <td>${escapeHtml(entry.notes || "-")}</td>
    `;
    nodes.historyRows.appendChild(row);
  });
}

function paintChart(entries) {
  const canvas = nodes.trendChart;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(620, Math.floor(rect.width));
  const height = 320;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fafdff";
  ctx.fillRect(0, 0, width, height);

  if (!entries.length) {
    ctx.fillStyle = "#5c7088";
    ctx.font = '500 14px "Sora", sans-serif';
    ctx.fillText("No trend data yet.", 20, 30);
    return;
  }

  const margin = { top: 20, right: 20, bottom: 30, left: 36 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  drawGrid(ctx, margin, innerW, innerH);

  const metrics = [
    { key: "workload", color: "#e0701e", max: 10 },
    { key: "focus", color: "#1f80e0", max: 10 },
    { key: "mood", color: "#0ea26a", max: 10 },
    { key: "sleep", color: "#7b68d9", max: 12 }
  ];

  metrics.forEach((metric) => drawLine(ctx, entries, metric, margin, innerW, innerH));
  drawLegend(ctx, metrics, width);
}

function drawGrid(ctx, margin, innerW, innerH) {
  ctx.strokeStyle = "#e4edf6";
  ctx.lineWidth = 1;

  for (let i = 0; i <= 4; i += 1) {
    const y = margin.top + (innerH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(margin.left + innerW, y);
    ctx.stroke();
  }
}

function drawLine(ctx, entries, metric, margin, innerW, innerH) {
  const total = entries.length;
  ctx.strokeStyle = metric.color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  entries.forEach((entry, index) => {
    const x = margin.left + (total === 1 ? innerW / 2 : (innerW * index) / (total - 1));
    const scaled = Number(entry[metric.key]) / metric.max;
    const y = margin.top + innerH - scaled * innerH;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

function drawLegend(ctx, metrics, width) {
  let x = 14;
  const y = 14;

  ctx.font = '500 11px "JetBrains Mono", monospace';
  metrics.forEach((metric) => {
    ctx.fillStyle = metric.color;
    ctx.fillRect(x, y - 8, 10, 10);
    ctx.fillStyle = "#31455b";
    ctx.fillText(metric.key, x + 14, y);
    x += ctx.measureText(metric.key).width + 42;
    if (x > width - 120) x = 14;
  });
}

function computeRisk(entries) {
  const recent = entries.slice(-14);
  const workloadRisk = normalize(average(recent.map((e) => e.workload)), 1, 10);
  const stressRisk = normalize(average(recent.map((e) => e.stress)), 1, 10);
  const sleepRisk = 1 - normalize(average(recent.map((e) => e.sleep)), 4, 9);
  const moodRisk = 1 - normalize(average(recent.map((e) => e.mood)), 1, 10);
  const focusRisk = 1 - normalize(average(recent.map((e) => e.focus)), 1, 10);

  let trendPenalty = 0;
  if (recent.length >= 8) {
    const older = recent.slice(0, Math.floor(recent.length / 2));
    const newer = recent.slice(Math.floor(recent.length / 2));
    const olderRisk = average(older.map((e) => e.workload + e.stress - e.mood));
    const newerRisk = average(newer.map((e) => e.workload + e.stress - e.mood));
    trendPenalty = clamp((newerRisk - olderRisk) * 5, 0, 15);
  }

  const weighted =
    workloadRisk * 24 +
    stressRisk * 24 +
    sleepRisk * 20 +
    moodRisk * 16 +
    focusRisk * 16;

  return clamp(Math.round(weighted + trendPenalty), 0, 100);
}

function riskLevel(score) {
  if (score >= 70) return "High";
  if (score >= 45) return "Moderate";
  return "Low";
}

function loadDemo() {
  const today = new Date();
  const demo = [
    { d: 6, workload: 6, sleep: 7.4, mood: 7, focus: 7, stress: 4, notes: "Normal day" },
    { d: 5, workload: 7, sleep: 7.0, mood: 6, focus: 6, stress: 5, notes: "Two meetings" },
    { d: 4, workload: 8, sleep: 6.4, mood: 6, focus: 6, stress: 6, notes: "Deadline pressure" },
    { d: 3, workload: 9, sleep: 5.9, mood: 5, focus: 5, stress: 7, notes: "Late work" },
    { d: 2, workload: 8, sleep: 5.8, mood: 5, focus: 4, stress: 8, notes: "Context switching" },
    { d: 1, workload: 8, sleep: 6.1, mood: 5, focus: 5, stress: 7, notes: "Fatigue signs" },
    { d: 0, workload: 7, sleep: 6.3, mood: 6, focus: 5, stress: 6, notes: "Recovery started" }
  ];

  state.entries = demo.map((item) => {
    const dt = new Date(today);
    dt.setDate(today.getDate() - item.d);
    return {
      date: dt.toISOString().slice(0, 10),
      workload: item.workload,
      sleep: item.sleep,
      mood: item.mood,
      focus: item.focus,
      stress: item.stress,
      notes: item.notes
    };
  }).sort((a, b) => a.date.localeCompare(b.date));

  persist();
  render();
  setHint("Demo week loaded.", false);
}

function clearAll() {
  state.entries = [];
  persist();
  render();
  setHint("All dashboard data cleared.", false);
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.entries)) state.entries = parsed.entries;
  } catch (error) {
    console.error("hydrate failed", error);
  }
}

function setHint(message, isError) {
  nodes.formHint.textContent = message;
  nodes.formHint.style.color = isError ? "var(--danger)" : "var(--muted)";
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, val) => sum + Number(val), 0) / values.length;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalize(value, min, max) {
  if (max <= min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
