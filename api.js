const API_BASE = "";

async function fetchCandidates() {
  const res = await fetch(`${API_BASE}/candidates`);
  if (!res.ok) throw new Error("Failed to load candidates");
  return res.json();
}

async function analyzeCandidate(data) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail?.[0]?.msg || "Analysis failed");
  }
  return res.json();
}

async function deleteCandidate(id) {
  const res = await fetch(`${API_BASE}/candidate/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete candidate");
  return res.json();
}
