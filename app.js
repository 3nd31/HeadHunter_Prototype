// ---------- Dummy job postings (edit freely) ----------
// Each requirement: kws = words/phrases that count as evidence in a resume,
// gapQ = asked when no evidence is found, verifyQ = asked to confirm depth when found.
const JOBS = [
  {
    id: "ai", title: "AI Software Engineer", company: "HH",
    location: "Remote", minYears: 3,
    summary: "Build reliable software and apply AI models to practical product problems.",
    reqs: [
      {label:"Java",kws:["java"],gapQ:"Describe your Java experience.",verifyQ:"What Java component did you personally own?"},
      {label:"Python",kws:["python"],gapQ:"Describe your Python experience.",verifyQ:"Walk through a Python project you implemented."},
      {label:"AI model understanding",kws:["machine learning","model","llm"],gapQ:"How have you worked with AI models?",verifyQ:"How did you evaluate a model's outputs?"},
      {label:"Team collaboration",kws:["team","collaboration"],gapQ:"Describe a team project.",verifyQ:"How did you handle a disagreement?"}
    ]
  },
  {
    id: "fe", title: "Senior Frontend Engineer", company: "HH",
    location: "Remote", minYears: 5,
    summary: "Build and own the customer-facing web app for a logistics platform.",
    reqs: [
      { label: "JavaScript / TypeScript", kws: ["javascript", "typescript", "es6"],
        gapQ: "What is your experience with JavaScript or TypeScript, and in what kinds of projects?",
        verifyQ: "Describe a complex TypeScript or JavaScript problem you solved. What made it hard?" },
      { label: "React", kws: ["react", "next.js", "nextjs"],
        gapQ: "Have you built production apps with React or a similar component framework? Which one?",
        verifyQ: "How have you managed state and performance in a large React app?" },
      { label: "HTML & CSS / accessibility", kws: ["css", "sass", "tailwind", "accessibility", "wcag", "a11y"],
        gapQ: "How do you approach responsive layout and accessibility (WCAG) in your work?",
        verifyQ: "Give an example of an accessibility issue you found and fixed." },
      { label: "Testing (Jest, Cypress, Playwright)", kws: ["jest", "cypress", "playwright", "vitest", "testing library", "unit test"],
        gapQ: "What testing tools and strategy do you use for frontend code?",
        verifyQ: "What is your approach to deciding what to unit test versus end-to-end test?" },
      { label: "REST / GraphQL APIs", kws: ["rest", "graphql", "api"],
        gapQ: "Have you integrated frontends with REST or GraphQL APIs? Describe a typical setup.",
        verifyQ: "How do you handle loading, error and caching states for API calls?" },
      { label: "CI/CD & Git workflows", kws: ["ci/cd", "github actions", "jenkins", "gitlab", "circleci", "git"],
        gapQ: "What CI/CD and Git branching practices have you used on a team?",
        verifyQ: "Describe the deployment pipeline you used most recently." },
      { label: "Mentoring / technical leadership", kws: ["mentor", "led a team", "tech lead", "lead engineer", "code review"],
        gapQ: "Have you mentored engineers or led technical decisions? Please give an example.",
        verifyQ: "Tell us about a time you changed a teammate's or team's technical direction." }
    ]
  },
  {
    id: "de", title: "Data Engineer", company: "Northwind Analytics (dummy)",
    location: "Hybrid, Chicago", minYears: 3,
    summary: "Design and run the pipelines that feed analytics and ML teams.",
    reqs: [
      { label: "Python", kws: ["python", "pandas", "pyspark"],
        gapQ: "What is your experience with Python for data processing?",
        verifyQ: "Describe the largest data processing job you wrote in Python." },
      { label: "SQL & data modeling", kws: ["sql", "postgres", "mysql", "data model", "star schema", "dimensional"],
        gapQ: "How comfortable are you with advanced SQL and designing data models?",
        verifyQ: "Walk through a data model you designed and the trade-offs you made." },
      { label: "ETL / orchestration (Airflow, dbt)", kws: ["airflow", "dbt", "etl", "elt", "dagster", "prefect"],
        gapQ: "Have you built and scheduled ETL/ELT pipelines? With which tools?",
        verifyQ: "How did you monitor pipelines and handle failures or backfills?" },
      { label: "Cloud data warehouse (Snowflake, BigQuery, Redshift)", kws: ["snowflake", "bigquery", "redshift", "databricks", "synapse"],
        gapQ: "Which cloud data warehouses have you used, and for what workloads?",
        verifyQ: "How did you control cost and performance in your warehouse?" },
      { label: "Big data / streaming (Spark, Kafka)", kws: ["spark", "kafka", "kinesis", "flink", "streaming"],
        gapQ: "Do you have experience with Spark or streaming systems like Kafka?",
        verifyQ: "Describe a streaming or large-scale batch system you worked on." },
      { label: "Cloud platform (AWS, GCP, Azure)", kws: ["aws", "gcp", "google cloud", "azure", "s3"],
        gapQ: "Which cloud platform have you worked on, and which services?",
        verifyQ: "How did you secure and manage access to data in the cloud?" },
      { label: "Data quality & testing", kws: ["data quality", "great expectations", "data validation", "unit test", "monitoring"],
        gapQ: "How do you validate data quality and test pipelines?",
        verifyQ: "Share an example of a data quality incident and how you prevented a repeat." }
    ]
  }
];

// ---------- UI ----------
const $ = (id) => document.getElementById(id);
let selected = null;

function renderJobs() {
  $("jobs").innerHTML = JOBS.map(j => `
    <button class="job" data-id="${j.id}" aria-pressed="false">
      <h3>${j.title}</h3>
      <small>${j.company} · ${j.location}</small>
      <p>${j.summary}</p>
      <ul>${j.reqs.map(r => `<li>${r.label}</li>`).join("")}<li>${j.minYears}+ years of experience</li></ul>
    </button>`).join("");
  document.querySelectorAll(".job").forEach(btn => btn.addEventListener("click", () => {
    selected = JOBS.find(j => j.id === btn.dataset.id);
    document.querySelectorAll(".job").forEach(b => b.setAttribute("aria-pressed", b === btn));
    $("step-resume").hidden = false;
    $("results").hidden = true;
    $("step-resume").scrollIntoView({ behavior: "smooth" });
  }));
}

// ---------- Resume reading ----------
async function readFile(file) {
  if (file.name.toLowerCase().endsWith(".pdf")) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      text += (await page.getTextContent()).items.map(t => t.str).join(" ") + "\n";
    }
    return text;
  }
  return file.text();
}

$("file").addEventListener("change", async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  $("error").textContent = "";
  try { $("resume").value = await readFile(f); }
  catch { $("error").textContent = "Could not read that file. Paste the text instead."; }
});

// ---------- Analysis ----------
function findYears(text) {
  const nums = [...text.matchAll(/(\d{1,2})\s*\+?\s*(?:years|yrs)/gi)].map(m => +m[1]);
  return nums.length ? Math.max(...nums) : null;
}
function hasKeyword(text, kw) {
  const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${esc}($|[^a-z0-9])`, "i").test(text);
}

function analyze(job, text) {
  const met = [], gaps = [];
  job.reqs.forEach(r => {
    const hits = r.kws.filter(k => hasKeyword(text, k));
    (hits.length ? met : gaps).push({ ...r, hits });
  });
  const years = findYears(text);
  const yearsOk = years !== null && years >= job.minYears;
  return { met, gaps, years, yearsOk };
}

function esc(s) { return s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

function render(job, res) {
  const total = job.reqs.length + 1;
  const score = Math.round(((res.met.length + (res.yearsOk ? 1 : 0)) / total) * 100);
  const qs = [];
  res.gaps.forEach(g => qs.push({ q: g.gapQ, why: `Gap: no evidence of ${g.label}` }));
  if (!res.yearsOk) qs.push({
    q: `This role needs ${job.minYears}+ years of relevant experience. How many years do you have, and in what roles?`,
    why: res.years === null ? "Gap: years of experience not stated" : `Gap: resume states ${res.years} years`
  });
  res.met.forEach(m => qs.push({ q: m.verifyQ, why: `Verify depth: resume mentions ${m.hits.join(", ")}` }));

  $("results").hidden = false;
  $("results").innerHTML = `
    <h2>Results for ${job.title}</h2>
    <div class="score"><b>${score}%</b><span>of requirements show evidence in your resume</span></div>
    <div class="panel gap"><h3>Gaps (${res.gaps.length + (res.yearsOk ? 0 : 1)})</h3>
      ${res.gaps.map(g => `<span class="tag g">${g.label}</span>`).join("")}
      ${res.yearsOk ? "" : `<span class="tag g">${job.minYears}+ years experience</span>`}
      ${!res.gaps.length && res.yearsOk ? "<p>No gaps found.</p>" : ""}
    </div>
    <div class="panel met"><h3>Found in resume (${res.met.length})</h3>
      ${res.met.map(m => `<span class="tag m">${m.label}</span>`).join("") || "<p>Nothing matched yet.</p>"}
    </div>
    <div id="interview"></div>`;
  runInterview(job, res, score);
}

$("analyze").addEventListener("click", () => {
  const text = $("resume").value.trim();
  if (!selected) { $("error").textContent = "Choose a role first."; return; }
  if (text.length < 80) { $("error").textContent = "Add more resume text (at least a few lines) to compare."; return; }
  $("error").textContent = "";
  window.location.href = `index.html?role=${encodeURIComponent(selected.id)}&from=applicant`;
});

renderJobs();
