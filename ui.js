
function scoreColor(score) {
  if (score >= 75) return "#17c356";
  if (score >= 50) return "#60a5fa";
  if (score >= 30) return "#fbbf24";
  return "#f87171";
}

function scoreRingHtml(score) {
  const r = 36;
  const cx = 44;
  const cy = 44;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);
  return `
    <div class="score-ring-wrap">
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(148,163,184,0.15)" stroke-width="6"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="6"
        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
        stroke-linecap="round" class="score-ring-progress"/>
      <text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="${color}" font-size="16" font-weight="700" font-family="Inter, sans-serif">${score}</text>
    </svg>
    </div>`;
}

function skillTags(skills) {
  if (!skills.length) return '<span class="no-skills">No matched skills</span>';
  return skills.map((s) => `<span class="skill-tag">${s}</span>`).join("");
}

function candidateCard(c) {
  const b = BADGES[c.badge];
  const expLabel = c.experience === "1" ? "yr" : "yrs";
  return `
    <div class="candidate-card" data-id="${c.id}">
      <div class="card-row">
        ${scoreRingHtml(c.score)}
        <div class="card-body">
          <div class="card-title-row">
            <span class="candidate-name">${escapeHtml(c.name)}</span>
            <span class="badge badge-${c.badge}">${c.recommendation.toUpperCase()}</span>
          </div>
          <div class="card-meta">
            <span>${escapeHtml(c.experience)} ${expLabel} experience</span>
            <span class="sep">|</span>
            <span>Added ${escapeHtml(c.added)}</span>
          </div>
          <div class="skill-tags">${skillTags(c.matched_skills)}</div>
        </div>
        <div class="card-actions">
          <button type="button" class="btn-toggle" data-id="${c.id}">▼ More</button>
          <button type="button" class="btn-delete" data-id="${c.id}">✕</button>
        </div>
      </div>
      <div class="card-detail hidden" id="detail-${c.id}">
        <div class="detail-inner">
          <div class="detail-label"> ANALYSIS DETAIL</div>
          <div class="detail-grid">
            <div class="detail-key">Score</div><div class="detail-val">${c.score}/100</div>
            <div class="detail-key">Skills matched</div><div class="detail-val">${c.matched_skills.length}</div>
            <div class="detail-key">Experience bonus</div><div class="detail-val">+${c.exp_bonus} pts</div>
            <div class="detail-key">Decision</div><div class="detail-val" style="color:${b.color};font-weight:700">${escapeHtml(c.recommendation)}</div>
          </div>
          <div class="resume-box">
            <div class="detail-key">RESUME TEXT</div>
            <div class="resume-text">${escapeHtml(c.resume)}</div>
          </div>
        </div>
      </div>
    </div>`;
}

function escapeHtml(text) {
  const el = document.createElement("div");
  el.textContent = text;
  return el.innerHTML;
}

function statsCards(stats) {
  const items = [
    { label: "Total Candidates", value: stats.total, icon: "👥", color: "#535851" },
    { label: "Recommended", value: stats.recommended, icon: "🏅", color: "#2c88dd" },
    { label: "Avg Score", value: stats.avgScore + "%", icon: "📊", color: "#d03207" },
    { label: "Top Skill", value: stats.topSkill, icon: "💻", color: "#110f17" },
  ];
  const delays = ["", " animate-in-delay-1", " animate-in-delay-2", " animate-in-delay-3"];
  return items
    .map(
      (s, i) => `
    <div class="stat-card animate-in${delays[i] || ""}">
      <div class="stat-icon">${s.icon}</div>
      <div class="stat-value" style="color:${s.color}">${escapeHtml(String(s.value))}</div>
      <div class="stat-label">${s.label}</div>
    </div>`
    )
    .join("");
}

function previewSkills(resumeText) {
  if (!resumeText) return '<span class="muted">Waiting for resume input...</span>';
  const lower = resumeText.toLowerCase();
  const found = Object.entries(SKILL_WEIGHTS).filter(([k]) => lower.includes(k));
  if (!found.length) return '<span class="muted">Type resume text above to preview matched skills...</span>';
  return found.map(([, v]) => `<span class="skill-tag">${v.label}</span>`).join("");
}

function resultView(c) {
  const b = BADGES[c.badge];
  const skillPts =
    c.score -
    (c.exp_bonus > 0 ? Math.round((c.exp_bonus / (MAX_SCORE + 15)) * 100) : 0);
  const recText = {
    success: "✅ Strong candidate. Proceed to interview.",
    info: "📋 Good candidate. Review further before deciding.",
    warning: "⚠ Borderline candidate. Consider additional screening.",
    danger: "✕ Insufficient skills match. Not recommended at this time.",
  }[c.badge];

  return `
    <div class="view-panel narrow">
      <div class="page-header">
        <div class="section-tag">Analysis Complete</div>
        <h2 class="view-title">Result: ${escapeHtml(c.name)}</h2>
      </div>
      <div class="result-card result-card-${c.badge}">
        <div class="result-header">
          ${scoreRingHtml(c.score)}
          <div>
            <div class="result-score" style="color:${b.color}">${c.score}<span class="score-max">/100</span></div>
            <span class="badge badge-${c.badge}">${c.recommendation.toUpperCase()}</span>
          </div>
        </div>
        <div class="result-grid">
          <div class="result-item"><div class="detail-key">Candidate</div><div class="detail-val">${escapeHtml(c.name)}</div></div>
          <div class="result-item"><div class="detail-key">Experience</div><div class="detail-val">${escapeHtml(c.experience)} years</div></div>
          <div class="result-item"><div class="detail-key">Skills Matched</div><div class="detail-val">${c.matched_skills.length} / ${Object.keys(SKILL_WEIGHTS).length}</div></div>
          <div class="result-item"><div class="detail-key">Exp Bonus</div><div class="detail-val">+${c.exp_bonus} pts</div></div>
        </div>
        <div class="section-block">
          <div class="detail-key">MATCHED SKILLS</div>
          <div class="skill-tags">${c.matched_skills.length ? skillTags(c.matched_skills) : '<span class="no-skills">No recognized skills found</span>'}</div>
        </div>
        <div class="section-block">
          <div class="detail-key">SCORE BREAKDOWN</div>
          <div class="breakdown-box">
            <div class="breakdown-row"><span>Skill points</span><span>${skillPts}</span></div>
            <div class="breakdown-row"><span>Experience bonus</span><span class="green">+${c.exp_bonus}</span></div>
            <div class="breakdown-row total"><span>Final Score</span><span style="color:${b.color}">${c.score}/100</span></div>
          </div>
        </div>
        <div class="rec-box" style="border-color:${b.border}">
          <div class="detail-key">AI RECOMMENDATION</div>
          <div class="rec-text" style="color:${b.color}">${recText}</div>
        </div>
      </div>
      <div class="btn-row">
        <button type="button" class="btn-primary" data-view="add">+ Add Another</button>
        <button type="button" class="btn-secondary" data-view="dashboard">View Dashboard</button>
      </div>
    </div>`;
}

function apiDocsView() {
  const endpoints = [
    {
      method: "GET",
      endpoint: "/candidates",
      color: "#60a5fa",
      bg: "#0c2d5e",
      desc: "Retrieve all candidates with their AI scores and recommendations.",
      response: `[\n  {\n    "id": 1,\n    "name": "Ayesha Khan",\n    "score": 85,\n    "recommendation": "Highly Recommended",\n    "matched_skills": ["Python", "FastAPI", "SQL"]\n  }\n]`,
    },
    {
      method: "POST",
      endpoint: "/analyze",
      color: "#4ade80",
      bg: "#0d2a0d",
      desc: "Submit a candidate's resume for AI analysis.",
      body: `{\n  "name": "Bilal Raza",\n  "experience": "3",\n  "resume": "Python FastAPI REST API SQL Docker"\n}`,
      response: `{\n  "id": 11,\n  "score": 78,\n  "recommendation": "Highly Recommended",\n  "matched_skills": ["Python", "FastAPI", "REST API", "SQL", "Docker"],\n  "exp_bonus": 10\n}`,
    },
    {
      method: "DELETE",
      endpoint: "/candidate/{id}",
      color: "#f87171",
      bg: "#2a0d0d",
      desc: "Remove a candidate from the system by ID.",
      response: `{\n  "message": "Candidate 11 deleted successfully",\n  "remaining": 3\n}`,
    },
  ];

  const cards = endpoints
    .map(
      (ep) => `
    <div class="api-card">
      <div class="api-header">
        <span class="api-method" style="background:${ep.bg};color:${ep.color}">${ep.method}</span>
        <span class="api-path">${ep.endpoint}</span>
      </div>
      <p class="api-desc">${ep.desc}</p>
      ${ep.body ? `<div class="detail-key">REQUEST BODY</div><pre class="code-block green">${ep.body}</pre>` : ""}
      <div class="detail-key">RESPONSE 200 OK</div>
      <pre class="code-block yellow">${ep.response}</pre>
    </div>`
    )
    .join("");

  return `
    <div class="view-panel medium">
      <div class="page-header">
        <div class="section-tag">REST API</div>
        <h2 class="view-title">Developer API Reference</h2>
      </div>
      <p class="api-intro">The AI HR Screening API enables resume analysis, candidate scoring, and recommendation management through RESTful endpoints.</p>
      ${cards}
    </div>`;
}
