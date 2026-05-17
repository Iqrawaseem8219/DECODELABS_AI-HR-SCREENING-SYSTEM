let candidates = [];
let currentView = "dashboard";
let lastResult = null;
let filter = "all";
let search = "";

const state = {
  form: { name: "", experience: "", resume: "" },
  errors: {},
  analyzing: false,
};

function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  toast.className = `toast toast-${type} show`;
  toast.innerHTML = `${type === "danger" ? "✕" : "✓"} ${msg}`;
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function computeStats(list) {
  const freq = {};
  list.forEach((c) => {
    c.matched_skills.forEach((sk) => {
      freq[sk] = (freq[sk] || 0) + 1;
    });
  });
  const topSkill =
    Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
  return {
    total: list.length,
    recommended: list.filter((c) => ["success", "info"].includes(c.badge)).length,
    avgScore: list.length
      ? Math.round(list.reduce((s, c) => s + c.score, 0) / list.length)
      : 0,
    topSkill,
  };
}

function setView(view) {
  currentView = view;
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
  document.getElementById("nav-result").classList.toggle("hidden", !lastResult);
  document.getElementById("main-nav")?.classList.remove("open");
  document.getElementById("nav-toggle")?.classList.remove("open");
  render();
}

function validateForm() {
  const e = {};
  if (!state.form.name.trim()) e.name = "Name is required";
  if (
    !state.form.experience.trim() ||
    isNaN(state.form.experience) ||
    Number(state.form.experience) < 0
  ) {
    e.experience = "Valid experience (years) required";
  }
  if (state.form.resume.trim().length < 10) {
    e.resume = "Resume text must be at least 10 characters";
  }
  state.errors = e;
  return Object.keys(e).length === 0;
}

async function loadCandidates() {
  candidates = await fetchCandidates();
  render();
}

function renderDashboard() {
  const filtered = candidates.filter((c) => {
    const matchFilter = filter === "all" || c.badge === filter;
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.resume.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });
  const stats = computeStats(candidates);

  return `
    <div class="page-header animate-in">
      <div class="section-tag">Overview</div>
      <h2 class="view-title">Candidate Dashboard</h2>
    </div>
    <div class="stats-grid">${statsCards(stats)}</div>
    <div class="toolbar animate-in animate-in-delay-1">
      <input type="text" id="search-input" class="search-input" placeholder="Search candidates or skills..." value="${escapeHtml(search)}"/>
      <div class="filter-btns">
        ${["all", "success", "info", "warning", "danger"]
          .map(
            (f) => `
          <button type="button" class="filter-btn ${filter === f ? "active" : ""}" data-filter="${f}">
            ${f === "all" ? "ALL" : f === "success" ? "HIGH" : f === "info" ? "MED" : f === "warning" ? "LOW" : "REJECT"}
          </button>`
          )
          .join("")}
      </div>
    </div>
    <div class="list-meta"> SHOWING ${filtered.length} OF ${candidates.length} CANDIDATES</div>
    ${
      filtered.length === 0
        ? `<div class="empty-state">No candidates match your filter. <button type="button" class="link-btn" id="empty-add">Add one?</button></div>`
        : filtered.map(candidateCard).join("")
    }`;
}

function renderAddForm() {
  return `
    <div class="view-panel narrow">
      <div class="page-header">
        <div class="section-tag">New Candidate</div>
        <h2 class="view-title">Resume Submission</h2>
      </div>
      <div class="form-group">
        <label>FULL NAME</label>
        <input type="text" id="input-name" value="${escapeHtml(state.form.name)}" placeholder="e.g. Ayesha Khan" class="${state.errors.name ? "error" : ""}"/>
        ${state.errors.name ? `<div class="error-msg">⚠ ${state.errors.name}</div>` : ""}
      </div>
      <div class="form-group">
        <label>YEARS OF EXPERIENCE</label>
        <input type="number" id="input-experience" value="${escapeHtml(state.form.experience)}" placeholder="e.g. 3" class="${state.errors.experience ? "error" : ""}"/>
        ${state.errors.experience ? `<div class="error-msg">⚠ ${state.errors.experience}</div>` : ""}
      </div>
      <div class="form-group">
        <label>RESUME TEXT</label>
        <textarea id="input-resume" rows="7" placeholder="Paste resume skills and experience here..." class="${state.errors.resume ? "error" : ""}">${escapeHtml(state.form.resume)}</textarea>
        ${state.errors.resume ? `<div class="error-msg">⚠ ${state.errors.resume}</div>` : ""}
      </div>
      <div class="preview-box">
        <div class="detail-key"> DETECTED SKILLS PREVIEW</div>
        <div class="skill-tags" id="skills-preview">${previewSkills(state.form.resume)}</div>
      </div>
      <button type="button" id="btn-analyze" class="btn-analyze" ${state.analyzing ? "disabled" : ""}>
        ${state.analyzing ? "Analyzing…" : "Run AI Analysis"}
      </button>
    </div>`;
}

function render() {
  const main = document.getElementById("main-content");
  let html = "";

  if (currentView === "dashboard") html = renderDashboard();
  else if (currentView === "add") html = renderAddForm();
  else if (currentView === "result" && lastResult) html = resultView(lastResult);
  else if (currentView === "api") html = apiDocsView();
  else html = renderDashboard();

  main.innerHTML = html;
  bindEvents();
  document.getElementById("footer-count").textContent = `${candidates.length} candidates`;
}

function bindEvents() {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.onclick = () => setView(btn.dataset.view);
  });

  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.onclick = () => setView(btn.dataset.view);
  });

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.oninput = (e) => {
      search = e.target.value;
      render();
    };
  }

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.onclick = () => {
      filter = btn.dataset.filter;
      render();
    };
  });

  const emptyAdd = document.getElementById("empty-add");
  if (emptyAdd) {
    emptyAdd.onclick = () => {
      filter = "all";
      search = "";
      setView("add");
    };
  }

  document.querySelectorAll(".btn-toggle").forEach((btn) => {
    btn.onclick = () => {
      const detail = document.getElementById(`detail-${btn.dataset.id}`);
      const isHidden = detail.classList.contains("hidden");
      if (isHidden) {
        detail.classList.remove("hidden");
        btn.textContent = "▲ Less";
      } else {
        detail.classList.add("hidden");
        btn.textContent = "▼ More";
      }
    };
  });

  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.onclick = async () => {
      await deleteCandidate(Number(btn.dataset.id));
      candidates = candidates.filter((c) => c.id !== Number(btn.dataset.id));
      showToast("Candidate removed", "danger");
      render();
    };
  });

  const nameInput = document.getElementById("input-name");
  const expInput = document.getElementById("input-experience");
  const resumeInput = document.getElementById("input-resume");
  const analyzeBtn = document.getElementById("btn-analyze");

  if (nameInput) {
    nameInput.oninput = (e) => {
      state.form.name = e.target.value;
    };
  }
  if (expInput) {
    expInput.oninput = (e) => {
      state.form.experience = e.target.value;
    };
  }
  if (resumeInput) {
    resumeInput.oninput = (e) => {
      state.form.resume = e.target.value;
      const preview = document.getElementById("skills-preview");
      if (preview) preview.innerHTML = previewSkills(state.form.resume);
    };
  }
  if (analyzeBtn) {
    analyzeBtn.onclick = async () => {
      state.form.name = nameInput.value;
      state.form.experience = expInput.value;
      state.form.resume = resumeInput.value;
      if (!validateForm()) {
        render();
        return;
      }
      state.analyzing = true;
      render();
      await new Promise((r) => setTimeout(r, 1400));
      try {
        const result = await analyzeCandidate({
          name: state.form.name.trim(),
          experience: state.form.experience.trim(),
          resume: state.form.resume.trim(),
        });
        lastResult = result;
        candidates.unshift(result);
        state.form = { name: "", experience: "", resume: "" };
        state.errors = {};
        state.analyzing = false;
        setView("result");
        showToast("Candidate analyzed successfully");
      } catch (err) {
        state.analyzing = false;
        showToast(err.message || "Analysis failed", "danger");
        render();
      }
    };
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("open");
      mainNav.classList.toggle("open");
    });
  }

  try {
    await loadCandidates();
    setView("dashboard");
  } catch {
    showToast("Could not connect to API. Is the server running?", "danger");
    render();
  }
});
