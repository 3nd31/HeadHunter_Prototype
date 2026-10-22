// ---------- Simulated candidate answer bank ----------
// Order matches each job's `reqs` array in app.js: [meets answer, doesn't-meet answer]
const ANSWERS = {
  fe: [
    ["Eight years of TypeScript. I migrated a 200k-line JavaScript codebase to strict TypeScript and set up lint rules to keep it that way.", "Mostly plain JavaScript, and only simple scripts and form validation. I haven't used TypeScript on a real project."],
    ["React is my main framework. On our dashboard I used memoization and virtualized lists to cut render time in half.", "I've done tutorials in React and used jQuery and Angular at work. Nothing in production with React."],
    ["I audit with axe and screen readers. I once fixed keyboard traps in a checkout flow that were blocking users.", "I make layouts responsive, but I haven't done formal accessibility work."],
    ["Jest and Testing Library for units, Playwright for critical flows. I keep end-to-end tests to the revenue paths only.", "Mostly manual testing. I've written a few Jest tests but I don't test regularly."],
    ["REST and GraphQL both. I use React Query for caching and show skeletons and retry states for failures.", "I've called a REST endpoint with fetch a few times, but a backend teammate handled the rest."],
    ["GitHub Actions with preview deploys per pull request. I recently cut build times from 15 to 6 minutes by caching.", "I push to Git, but deployment was run by another team."],
    ["I mentor two junior engineers and own our code review guidelines. One of them was promoted last year.", "I haven't formally mentored anyone. I answer questions from teammates when asked."]
  ],
  de: [
    ["Six years of Python. I wrote pandas and PySpark jobs processing around two billion rows a day.", "I've used Python for small scripts, but my pipelines were built in a drag-and-drop ETL tool."],
    ["Daily SQL with window functions and CTEs. I designed a star schema for sales that replaced a pile of inconsistent reports.", "Basic SELECTs and JOINs. I haven't designed a data model myself."],
    ["Airflow for orchestration and dbt for transforms. After a bad incident I added alerting and idempotent backfills.", "I ran scheduled cron scripts. I haven't used Airflow or dbt."],
    ["Snowflake for three years. I cut spend about 30% by right-sizing warehouses and clustering the big tables.", "I've only queried a warehouse someone else set up. I haven't administered one."],
    ["Spark for batch and Kafka for event streams. I tuned partitioning to fix a skewed join that was failing nightly.", "I've read about Spark and Kafka but haven't used them in production."],
    ["Mostly AWS: S3, Glue and IAM. I set up least-privilege roles and encrypted buckets for our data lake.", "I've used the AWS console to upload files. Infrastructure was handled by another team."],
    ["Great Expectations checks on every load, plus freshness monitors. We caught a broken upstream feed before it hit dashboards.", "I spot-check outputs by hand. There are no automated tests on the data."]
  ]
};
const PARTIAL = [
  "A bit, yes. {x} came up on a couple of projects, but a teammate usually led that part.",
  "I've used {x} on smaller pieces and in side projects. I haven't owned it end to end, so I'd call myself intermediate.",
  "Some exposure to {x} at work, nothing at serious scale."
];
const PROBE = {
  strong: ["Can you share a concrete result or number from that work?", "What was the outcome, and how did you measure it?"],
  partial: ["Which part did you personally own, versus a teammate?", "What would you need to learn to own it fully?"],
  weak: ["Is this something you could pick up quickly? What would ramp-up look like?", "Have you had any hands-on exposure at all, even small?"]
};
const REPLY = {
  strong: ["Yes. It shipped to all customers, usage grew about 40%, and I documented the approach for the team.", "Sure. It handled roughly ten times the earlier load, and I was on call for it for six months."],
  partial: ["Mostly the implementation of a few features. Design decisions were made above me, so I'm still building that judgment.", "I contributed code and fixes, but I wasn't the decision maker."],
  weak: ["Honestly, no. I'd need a few weeks with a mentor before I'd be productive.", "Not yet. I'm interested in it, but I can't point to real experience."]
};
const VERDICT = {
  strong: "Meets criteria: specific, owned example with an outcome.",
  partial: "Partially meets: some exposure, limited ownership.",
  weak: "Does not meet: no hands-on experience shown."
};
const POINTS = { strong: 1, partial: 0.5, weak: 0 };
const LABEL = { strong: "Meets", partial: "Partial", weak: "Not met" };

// ---------- Interview engine ----------
let runId = 0, fast = false;
const sleep = (ms) => new Promise(r => setTimeout(r, fast ? 0 : ms));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
function outcomeFor(kind) {
  const r = Math.random();
  return kind === "gap" ? (r < .25 ? "strong" : r < .55 ? "partial" : "weak")
                        : (r < .65 ? "strong" : r < .9 ? "partial" : "weak");
}

function buildItems(job, res) {
  const items = [];
  const mk = (r, kind, q) => {
    const i = job.reqs.findIndex(x => x.label === r.label);
    return { label: r.label, kind, q: kind === "gap" ? `Your resume doesn't say much about ${r.label}. ${q}` : `Your resume mentions ${r.label}. ${q}`, ans: ANSWERS[job.id][i] };
  };
  res.gaps.forEach(g => items.push(mk(g, "gap", g.gapQ)));
  const n = job.minYears;
  items.push({ label: `${n}+ years experience`, kind: res.yearsOk ? "verify" : "gap",
    q: `This role needs ${n}+ years of relevant experience. How many years do you have?`,
    ans: [`I have ${n + 2} years of hands-on work in roles like the ones on my resume.`, `Around ${Math.max(1, n - 3)} years so far.`],
    partialText: `About ${n - 1} years, though the last two were at a more senior level.` });
  res.met.forEach(m => items.push(mk(m, "verify", m.verifyQ)));
  return items;
}

async function runInterview(job, res, matchPct, showNote = true) {
  const id = ++runId;
  const root = document.getElementById("interview");
  root.innerHTML = `<div class="panel"><h3>Simulated interview</h3>
    <p class="note">The candidate's answers are simulated and change on every run.</p>
    <div class="chatwrap"><div class="chat" id="chat" role="log" aria-live="polite"></div>
    <div class="side"><button class="ghost" id="skip">Skip the interview</button></div></div></div><div id="report"></div>`;
  const chat = document.getElementById("chat");
  document.getElementById("skip").onclick = () => { fast = true; };
  fast = false;
  const log = [], results = [];

  async function say(role, text) {
    if (id !== runId) return false;
    const el = document.createElement("div");
    el.className = "msg " + role;
    const who = document.createElement("span");
    who.className = "who";
    who.textContent = role === "int" ? "Interviewer" : "Candidate";
    const p = document.createElement("p");
    el.append(who, p);
    chat.appendChild(el);
    p.innerHTML = fast ? "" : '<span class="dots"><i></i><i></i><i></i></span>';
    el.scrollIntoView({ block: "end", behavior: "smooth" });
    await sleep(600);
    if (id !== runId) return false;
    p.textContent = "";
    const words = text.split(" ");
    for (const w of words) {
      if (id !== runId) return false;
      p.textContent += (p.textContent ? " " : "") + w;
      await sleep(35);
    }
    el.scrollIntoView({ block: "end" });
    log.push(`${role === "int" ? "Interviewer" : "Candidate"}: ${text}`);
    await sleep(350);
    return true;
  }
  function note(text) {
    const el = document.createElement("div");
    el.className = "msg sys"; el.textContent = text;
    chat.appendChild(el); el.scrollIntoView({ block: "end" });
    log.push(`[Assessment] ${text}\n`);
  }

  if (showNote) {
    const d = document.getElementById("note");
    d.showModal();
    await new Promise(r => { document.getElementById("note-ok").onclick = () => { d.close(); r(); }; });
    if (id !== runId) return;
  }
  if (!await say("int", `Thanks for joining. I'm interviewing you for the ${job.title} role at ${job.company}. I've read your resume and have a few questions about areas it didn't fully cover.`)) return;
  if (!await say("cand", "Happy to be here. Go ahead.")) return;

  for (const it of buildItems(job, res)) {
    const o = outcomeFor(it.kind);
    const a = o === "strong" ? it.ans[0] : o === "weak" ? it.ans[1] : (it.partialText || pick(PARTIAL).replace("{x}", it.label));
    if (!await say("int", it.q)) return;
    if (!await say("cand", a)) return;
    if (!await say("int", pick(PROBE[o]))) return;
    if (!await say("cand", pick(REPLY[o]))) return;
    note(`${it.label}: ${VERDICT[o]}`);
    results.push({ label: it.label, outcome: o });
  }
  if (!await say("int", "That's all my questions. Thanks for your time. We'll review and follow up.")) return;
  if (!await say("cand", "Thank you.")) return;

  document.getElementById("skip").disabled = true;
  // ----- Report -----
  const pts = results.reduce((s, r) => s + POINTS[r.outcome], 0);
  const pct = Math.round(pts / results.length * 100);
  const anyWeak = results.some(r => r.outcome === "weak");
  const rec = pct >= 75 && !anyWeak ? "Advance to next round"
            : pct >= 50 ? "Hold: follow up on weaker areas" : "Do not advance";
  const head = [
    "SIMULATED INTERVIEW TRANSCRIPT",
    `Role: ${job.title}, ${job.company}`,
    `Date: ${new Date().toLocaleString()}`,
    `Resume keyword match: ${matchPct}%`,
    "=".repeat(48), ""
  ];
  const tail = ["", "=".repeat(48), "SCORECARD",
    ...results.map(r => `- ${r.label}: ${LABEL[r.outcome]}`),
    `Interview score: ${pct}%`, `Recommendation: ${rec}`];
  const transcript = [...head, ...log, ...tail].join("\n");

  document.getElementById("report").innerHTML = `
    <div class="panel ${pct >= 75 && !anyWeak ? "met" : "gap"}"><h3>Interview result: ${rec}</h3>
      <div class="score"><b>${pct}%</b><span>interview score across ${results.length} topics</span></div>
      <table><tbody>${results.map(r => `<tr><td>${esc(r.label)}</td><td><span class="tag ${r.outcome === "strong" ? "m" : "g"}">${LABEL[r.outcome]}</span></td></tr>`).join("")}</tbody></table>
    </div>
    <div class="panel"><h3>Transcript</h3>
      <pre id="tx"></pre>
      <button class="primary" id="dl">Download transcript (.txt)</button>
      <button class="ghost" id="cp">Copy</button>
      <button class="ghost" id="rerun">Run another interview</button>
    </div>`;
  document.getElementById("tx").textContent = transcript;
  document.getElementById("dl").onclick = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([transcript], { type: "text/plain" }));
    a.download = `interview-${job.id}.txt`; a.click();
  };
  document.getElementById("cp").onclick = (e) => {
    navigator.clipboard.writeText(transcript).then(() => { e.target.textContent = "Copied"; });
  };
  document.getElementById("rerun").onclick = () => runInterview(job, res, matchPct, false);
  document.getElementById("report").scrollIntoView({ behavior: "smooth" });
}
