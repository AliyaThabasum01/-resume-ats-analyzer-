// =====================================================================
// ResumeRadar — ATS Resume Analyzer
// All analysis runs locally in the browser. No data leaves the device.
// =====================================================================

// ---------------------------------------------------------------------
// Skill / keyword dictionary used for resume <-> job description matching
// ---------------------------------------------------------------------
const SKILL_KEYWORDS = [
  // Programming languages
  "python", "java", "javascript", "typescript", "c++", "c#", "golang", "go",
  "rust", "php", "ruby", "swift", "kotlin", "sql", "html", "css",

  // Web / frontend
  "react", "react.js", "angular", "vue", "next.js", "node.js", "express",
  "express.js", "redux", "tailwind css", "bootstrap", "jquery", "webpack",
  "vite", "rest api", "graphql",

  // Backend frameworks
  "django", "flask", "fastapi", "spring boot", "spring", ".net", "microservices",

  // Databases
  "mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle", "firebase",
  "dynamodb", "nosql",

  // AI / ML / Data
  "machine learning", "deep learning", "natural language processing", "nlp",
  "computer vision", "data analysis", "data analytics", "data science",
  "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras",
  "opencv", "generative ai", "large language models", "llm",
  "prompt engineering", "rag", "retrieval augmented generation", "embeddings",
  "transformers", "neural networks", "predictive modelling",
  "model evaluation", "exploratory data analysis", "eda",
  "data visualization", "power bi", "tableau", "matplotlib", "seaborn",
  "statistics",

  // Cloud / DevOps
  "aws", "azure", "google cloud", "gcp", "docker", "kubernetes", "ci/cd",
  "jenkins", "terraform", "linux", "git", "github", "gitlab",
  "version control",

  // Tools
  "jira", "agile", "scrum", "figma", "postman", "jupyter notebook",
  "google colab", "vs code",

  // Soft skills
  "communication", "leadership", "teamwork", "problem solving",
  "project management", "time management", "collaboration",
  "critical thinking", "adaptability", "presentation skills",
  "analytical skills", "attention to detail",
];

// Strong action verbs that ATS / recruiters associate with impact
const ACTION_VERBS = [
  "achieved", "built", "created", "designed", "developed", "engineered",
  "implemented", "improved", "increased", "launched", "led", "managed",
  "optimized", "reduced", "spearheaded", "streamlined", "transformed",
  "automated", "delivered", "established", "executed", "generated",
  "initiated", "integrated", "pioneered", "resolved", "trained", "analyzed",
  "architected", "collaborated", "coordinated", "deployed", "enhanced",
  "facilitated", "founded", "mentored", "organized", "presented",
  "researched", "scaled", "contributed", "applied", "translated",
];

// Phrases that weaken a resume and should be replaced with action verbs
const WEAK_PHRASES = [
  "responsible for", "duties included", "duties include", "worked on",
  "in charge of", "tasked with", "helped with", "assisted with",
];

// Standard ATS-recognized section headers
const SECTION_HEADERS = [
  "education", "experience", "skills", "projects", "certifications",
  "summary", "objective", "achievements",
];

// ---------------------------------------------------------------------
// Sample data so visitors can try the tool instantly
// ---------------------------------------------------------------------
const SAMPLE_RESUME = `Sample Student
Email: sample.student@email.com | Phone: +91 98765 43210

OBJECTIVE
Second-year Computer Science student with hands-on experience in Python, Machine Learning, and Web Development. Seeking an internship to apply technical skills in a professional environment.

EDUCATION
B.E. Computer Science Engineering, XYZ University, 2024 - 2028
CGPA: 8.2 / 10

SKILLS
Python, Java, JavaScript, HTML, CSS, React, MySQL, Git, Pandas, NumPy, Data Analysis, Machine Learning

PROJECTS
Student Performance Predictor
- Built a machine learning model using Python and scikit-learn to predict student grades based on study habits
- Achieved 85% prediction accuracy on test data
- Visualized results using Matplotlib and presented findings to faculty

Personal Portfolio Website
- Designed and developed a responsive portfolio website using HTML, CSS, and JavaScript
- Deployed the site using GitHub Pages

CERTIFICATIONS
Google: Introduction to Machine Learning
Coursera: Python for Data Science

ACHIEVEMENTS
- Led a team of 3 in a college hackathon, finishing in the top 10 out of 50 teams`;

const SAMPLE_JD = `We are looking for an AI/ML Intern to join our team.

Responsibilities:
- Assist in developing and training machine learning models using Python, TensorFlow, and PyTorch
- Work with large datasets, perform data analysis and exploratory data analysis (EDA)
- Collaborate with the engineering team on natural language processing (NLP) projects
- Build and maintain REST APIs using FastAPI or Flask
- Use Docker for containerization and AWS for cloud deployment
- Visualize data using Power BI or Tableau

Requirements:
- Strong knowledge of Python and SQL
- Familiarity with machine learning frameworks such as TensorFlow, PyTorch, or scikit-learn
- Experience with Pandas, NumPy, and data visualization libraries
- Understanding of Git and version control
- Good communication and problem solving skills
- Experience with cloud platforms (AWS, GCP, Azure) is a plus`;

// ---------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsTerm(lowerText, term) {
  // Pure alphanumeric/space terms get strict word-boundary matching
  if (/^[a-z0-9\s]+$/.test(term)) {
    const regex = new RegExp(`\\b${escapeRegex(term)}\\b`, "i");
    return regex.test(lowerText);
  }
  // Terms with special characters (c++, c#, .net, ci/cd) use substring match
  return lowerText.includes(term.toLowerCase());
}

function extractSkills(lowerText) {
  return SKILL_KEYWORDS.filter((skill) => containsTerm(lowerText, skill));
}

function checkBulletStructure(text) {
  if (/(^|\n)[ \t]*[•\-*▪○➤·]/.test(text)) return true;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 6) return false;
  const shortLines = lines.filter((l) => l.length < 130).length;
  return shortLines / lines.length > 0.5;
}

function countQuantifiableMetrics(text) {
  const matches = text.match(/\b\d+(\.\d+)?(%|\+|x|k|K|M)?\b/g) || [];
  return matches.filter((m) => !/^(19|20)\d{2}$/.test(m)).length;
}

function countActionVerbs(resumeLower) {
  let count = 0;
  for (const verb of ACTION_VERBS) {
    if (containsTerm(resumeLower, verb)) count++;
  }
  return count;
}

function scoreColor(score) {
  if (score >= 75) return "#4ade80";
  if (score >= 50) return "#fbbf24";
  return "#f87171";
}

// ---------------------------------------------------------------------
// ATS compatibility checklist
// ---------------------------------------------------------------------
function buildChecklist(resumeText, resumeLower) {
  const checks = [];

  // 1. Email
  const hasEmail = /[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/.test(resumeText);
  checks.push({
    id: "email",
    label: "Contact email present",
    passed: hasEmail,
    tip: "Add a professional email address near the top of your resume so recruiters and ATS can find your contact info.",
  });

  // 2. Phone
  const hasPhone = /(\+?\d{1,3}[\s-]?)?\d{4,5}[\s-]?\d{5,6}/.test(resumeText);
  checks.push({
    id: "phone",
    label: "Phone number present",
    passed: hasPhone,
    tip: "Include a phone number in your contact section — many ATS treat this as a required field.",
  });

  // 3. Standard section headers
  const foundSections = SECTION_HEADERS.filter((h) =>
    containsTerm(resumeLower, h)
  );
  checks.push({
    id: "sections",
    label: "Standard section headers",
    passed: foundSections.length >= 4,
    tip: `ATS systems look for standard section headers like Education, Experience, Skills, and Projects. Found ${foundSections.length}/${SECTION_HEADERS.length}. Use clear, conventional headings so your sections are recognized.`,
  });

  // 4. Bullet points
  const hasBullets = checkBulletStructure(resumeText);
  checks.push({
    id: "bullets",
    label: "Uses bullet points",
    passed: hasBullets,
    tip: "Use bullet points (•, -, or *) to list responsibilities and achievements — this is easier for ATS and recruiters to scan than dense paragraphs.",
  });

  // 5. Quantifiable achievements
  const metricCount = countQuantifiableMetrics(resumeText);
  checks.push({
    id: "metrics",
    label: "Quantifiable achievements",
    passed: metricCount >= 2,
    tip: 'Add numbers to show impact — e.g. "Improved matching speed by 40%" or "Built a platform covering 10,000+ opportunities" instead of vague descriptions.',
  });

  // 6. Action verbs
  const verbCount = countActionVerbs(resumeLower);
  checks.push({
    id: "verbs",
    label: "Strong action verbs",
    passed: verbCount >= 4,
    tip: 'Start bullet points with strong action verbs like "Built", "Designed", "Implemented", or "Led" instead of passive phrasing.',
  });

  // 7. Avoids weak phrases
  const weakFound = WEAK_PHRASES.filter((p) => resumeLower.includes(p));
  checks.push({
    id: "weakphrases",
    label: "Avoids weak phrases",
    passed: weakFound.length === 0,
    tip: `Replace phrases like "${weakFound.join('", "')}" with a specific action verb describing what you actually did.`,
  });

  // 8. Resume length
  const wordCount = resumeText.trim().split(/\s+/).filter(Boolean).length;
  const goodLength = wordCount >= 200 && wordCount <= 1000;
  checks.push({
    id: "length",
    label: "Appropriate resume length",
    passed: goodLength,
    tip:
      wordCount < 200
        ? `Your resume is about ${wordCount} words — consider adding more detail about your projects and experience.`
        : `Your resume is about ${wordCount} words — for early-career roles, aim for roughly one page (around 400-700 words).`,
  });

  return checks;
}

// ---------------------------------------------------------------------
// Suggestions
// ---------------------------------------------------------------------
function buildSuggestions(checklist, missing, jdSkillCount) {
  const suggestions = [];

  checklist.filter((c) => !c.passed).forEach((c) => suggestions.push(c.tip));

  if (jdSkillCount === 0) {
    suggestions.push(
      'We could not detect specific skill keywords in the job description. Try pasting the full posting, including the "Requirements" or "Qualifications" section, for a more accurate keyword match.'
    );
  } else if (missing.length > 0) {
    const topMissing = missing.slice(0, 8).join(", ");
    suggestions.push(
      `If you genuinely have experience with these, weave them naturally into your resume: ${topMissing}.`
    );
  } else {
    suggestions.push(
      "Strong keyword coverage — your resume already reflects most of the skills mentioned in this job description."
    );
  }

  suggestions.push(
    "Export your final resume as a text-based PDF (from Word or Google Docs, not a scanned image) so ATS software can read it correctly."
  );
  suggestions.push(
    "Avoid tables, multi-column layouts, headers/footers, and graphics in the version you submit to ATS — these are often misread or skipped entirely."
  );

  return suggestions;
}

// ---------------------------------------------------------------------
// Main analysis
// ---------------------------------------------------------------------
function analyze(resumeText, jdText) {
  const resumeLower = resumeText.toLowerCase();
  const jdLower = jdText.toLowerCase();

  const jdSkills = extractSkills(jdLower);
  const resumeSkills = extractSkills(resumeLower);

  const matched = jdSkills.filter((s) => resumeSkills.includes(s));
  const missing = jdSkills.filter((s) => !resumeSkills.includes(s));

  const keywordScore =
    jdSkills.length > 0
      ? Math.round((matched.length / jdSkills.length) * 100)
      : 100;

  const checklist = buildChecklist(resumeText, resumeLower);
  const passedChecks = checklist.filter((c) => c.passed).length;
  const atsScore = Math.round((passedChecks / checklist.length) * 100);

  const overallScore = Math.round(keywordScore * 0.5 + atsScore * 0.5);

  const suggestions = buildSuggestions(checklist, missing, jdSkills.length);

  return {
    overallScore,
    keywordScore,
    atsScore,
    matched,
    missing,
    checklist,
    suggestions,
  };
}

// ---------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------
const GAUGE_CIRCUMFERENCE = 534; // 2 * PI * r (r = 85)

function renderTags(containerId, items, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (items.length === 0) {
    const span = document.createElement("span");
    span.className = "tag empty";
    span.textContent =
      type === "matched" ? "No matches found" : "None — great job!";
    container.appendChild(span);
    return;
  }

  items.forEach((item) => {
    const span = document.createElement("span");
    span.className = `tag ${type}`;
    span.textContent = item;
    container.appendChild(span);
  });
}

function renderResults(result) {
  document.getElementById("results").classList.remove("hidden");

  // Gauge
  const offset =
    GAUGE_CIRCUMFERENCE - (GAUGE_CIRCUMFERENCE * result.overallScore) / 100;
  const gaugeFill = document.getElementById("gaugeFill");
  // Force reflow so the transition replays on repeated analyses
  gaugeFill.style.transition = "none";
  gaugeFill.style.strokeDashoffset = GAUGE_CIRCUMFERENCE;
  void gaugeFill.offsetWidth;
  gaugeFill.style.transition = "stroke-dashoffset 1.2s ease, stroke 1.2s ease";
  gaugeFill.style.strokeDashoffset = offset;
  gaugeFill.style.stroke = scoreColor(result.overallScore);
  document.getElementById("gaugeScore").textContent = result.overallScore;

  // Sub-scores
  document.getElementById("keywordScoreLabel").textContent = `${result.keywordScore}%`;
  document.getElementById("keywordScoreBar").style.width = `${result.keywordScore}%`;
  document.getElementById("atsScoreLabel").textContent = `${result.atsScore}%`;
  document.getElementById("atsScoreBar").style.width = `${result.atsScore}%`;

  // Keywords
  renderTags("matchedKeywords", result.matched, "matched");
  renderTags("missingKeywords", result.missing, "missing");
  document.getElementById("matchedCount").textContent = `(${result.matched.length})`;
  document.getElementById("missingCount").textContent = `(${result.missing.length})`;

  // Checklist
  const checklistEl = document.getElementById("checklist");
  checklistEl.innerHTML = "";
  result.checklist.forEach((c) => {
    const li = document.createElement("li");
    li.className = c.passed ? "pass" : "fail";

    const icon = c.passed
      ? '<polyline points="20 6 9 17 4 12"/>'
      : '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>';

    li.innerHTML = `
      <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg>
      <div class="check-body">
        <strong>${c.label}</strong>
        ${c.passed ? "" : `<span>${c.tip}</span>`}
      </div>
    `;
    checklistEl.appendChild(li);
  });

  // Suggestions
  const suggestionsEl = document.getElementById("suggestions");
  suggestionsEl.innerHTML = "";
  result.suggestions.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s;
    suggestionsEl.appendChild(li);
  });
}

// ---------------------------------------------------------------------
// Report download
// ---------------------------------------------------------------------
function downloadReport(result) {
  const lines = [];
  lines.push("ResumeRadar - ATS Analysis Report");
  lines.push("==================================");
  lines.push("");
  lines.push(`Overall ATS Match Score: ${result.overallScore}%`);
  lines.push(`Keyword Match Score: ${result.keywordScore}%`);
  lines.push(`ATS & Content Quality Score: ${result.atsScore}%`);
  lines.push("");
  lines.push(`Matched Keywords (${result.matched.length}): ${result.matched.join(", ") || "None"}`);
  lines.push(`Missing Keywords (${result.missing.length}): ${result.missing.join(", ") || "None"}`);
  lines.push("");
  lines.push("ATS Compatibility Checklist:");
  result.checklist.forEach((c) => {
    lines.push(`[${c.passed ? "PASS" : "FAIL"}] ${c.label}`);
    if (!c.passed) lines.push(`    -> ${c.tip}`);
  });
  lines.push("");
  lines.push("Suggestions:");
  result.suggestions.forEach((s, i) => lines.push(`${i + 1}. ${s}`));

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resume-ats-report.txt";
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------
// Event wiring
// ---------------------------------------------------------------------
let lastResult = null;

document.getElementById("analyzeBtn").addEventListener("click", () => {
  const resumeText = document.getElementById("resumeInput").value.trim();
  const jdText = document.getElementById("jdInput").value.trim();

  if (!resumeText || !jdText) {
    alert("Please paste both your resume and a job description before analyzing.");
    return;
  }

  lastResult = analyze(resumeText, jdText);
  renderResults(lastResult);

  document.getElementById("results").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("sampleBtn").addEventListener("click", () => {
  document.getElementById("resumeInput").value = SAMPLE_RESUME;
  document.getElementById("jdInput").value = SAMPLE_JD;
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  if (lastResult) downloadReport(lastResult);
});
