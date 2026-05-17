const SKILL_WEIGHTS = {
  python: { points: 20, label: "Python" },
  fastapi: { points: 20, label: "FastAPI" },
  javascript: { points: 10, label: "JavaScript" },
  react: { points: 10, label: "React" },
  html: { points: 5, label: "HTML" },
  css: { points: 5, label: "CSS" },
  sql: { points: 15, label: "SQL" },
  api: { points: 15, label: "REST API" },
  docker: { points: 15, label: "Docker" },
  git: { points: 10, label: "Git" },
  machine: { points: 20, label: "Machine Learning" },
  tensorflow: { points: 15, label: "TensorFlow" },
  django: { points: 15, label: "Django" },
  nodejs: { points: 10, label: "Node.js" },
  typescript: { points: 10, label: "TypeScript" },
};

const BADGES = {
  success: { bg: "#0d4a2e", color: "#4ade80", border: "#166534" },
  info: { bg: "#0c2d5e", color: "#60a5fa", border: "#1e3a5f" },
  warning: { bg: "#4a2e00", color: "#fbbf24", border: "#92400e" },
  danger: { bg: "#4a0d0d", color: "#f87171", border: "#7f1d1d" },
};

const MAX_SCORE = Object.values(SKILL_WEIGHTS).reduce((a, b) => a + b.points, 0);
