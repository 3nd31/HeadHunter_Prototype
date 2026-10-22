# Head Hunters — Applicant Insights

An interactive recruiter-report prototype that combines applicant ranking bar charts, individual radar charts, and specific interview examples.

This is one of the team's three prototype approaches. It focuses on the report recruiters receive after applicants complete an AI pre-view interview. The shared applicant frontend is included, and the interview step is skipped so testers can explore the report directly.

## Purpose and hypothesis

**Target user:** A recruiter comparing several applicants for the same technical position and deciding whom to invite to the next interview.

**Hypothesis:** Recruiters can compare applicants more quickly and make more informed shortlisting decisions when interview results are presented through competency rankings, interactive radar charts, and specific interview evidence.

The prototype supports three tasks:

- Find applicants who stand out on a particular job requirement.
- Explore an individual's broader strengths and areas to investigate.
- Read concrete examples and identify useful follow-up questions.

These benefits are hypotheses to test with users; this demo does not establish that they have been achieved.

## Open the demo

1. Download and extract the entire ZIP archive.
2. Keep all extracted files together in the same folder.
3. Open `index.html` in Chrome, Safari, or Edge.

The report runs directly in the browser. No installation, API key, build command, or local server is required. Its charts and fictional data work offline.

For the applicant-side entry point, open `applicant.html`. Choose a role, upload a resume or paste a few lines of resume text, then click **Continue to recruiter report**. The AI pre-view interview is skipped, and the corresponding report opens with the fictional applicant pool.

PDF reading in the applicant page requires internet access for its PDF library. That page also loads online fonts. If PDF reading fails, paste text instead. Uploaded or pasted resume content is read locally; it is not sent for AI analysis or used to create the report's scores.

## Explore the report

### Applicant rankings

The report contains **8 fictional applicants** and **8 ranking charts** per job position. Each chart sorts every applicant from highest to lowest on a 0–100 scale. Each applicant keeps the same color across charts, and an outline marks the selected person.

| Filter | Charts displayed |
| --- | --- |
| All competencies | All 8 charts |
| Technical | 3 technical competencies for the selected role |
| People & thinking | Work style; Team collaboration; Communication & problem solving |
| Execution & ownership | Independent delivery; Prioritization |

The default role is **AI Software Engineer**, whose technical rankings are Java proficiency, Python proficiency, and AI model understanding. The role selector also supports **Senior Frontend Engineer** and **Data Engineer**, with different technical labels and interview examples.

### Individual applicant profiles

Click any bar or applicant name in the color legend to update the selected profile. Use the floating **View radar profile** button to jump to it. The profile includes a summary, workplace-behavior tags, standout evidence, a follow-up area, and five radar charts:

| Radar chart | Dimensions |
| --- | --- |
| Technical capabilities — default AI role | Java; Python; AI models; System design; Testing |
| Work style | Initiative; Adaptability; Ownership; Learning drive; Organization |
| Team collaboration | Feedback; Knowledge sharing; Conflict handling; Reliability; Team alignment |
| Communication & problem solving | Clarity; Structured thinking; Trade-off reasoning; Active listening; Requirements |
| Execution & ownership | Independent delivery; Prioritization; Follow-through; Quality judgment; Progress reporting |

Dimensions remain consistent across applicants within a role so their profiles can be compared. The technical radar labels change with the selected position. Learning drive and adaptability appear within Work style; there is no separate Learning & adaptability category.

Turn **Show pool average** on or off to control the dashed comparison polygon. Use the profile dropdown or previous/next arrows to switch applicants.

### Interview evidence

Each applicant has two fictional response-summary cards: a technical example for the selected role and a collaboration example. Each card includes:

- An example interview prompt and the competencies it relates to.
- The situation and the applicant's personal contribution.
- A specific result, including the scope or limits of that result.
- An expandable **What to verify next** question.

For example, Alex Morgan's AI-role card describes a Java endpoint tested at 600 requests per second, the batch-query and caching changes attributed to Alex, and a staging p95 response-time change from 820 ms to 310 ms. The card explicitly identifies this as a staging example rather than a demonstrated production improvement. All of these details are invented for the prototype.

### Export

Click **Export scores** to download a CSV containing all 8 applicants and their 8 competency scores for the selected role. The export is labeled as demo data.

## Suggested walkthrough and user test

For a short demonstration:

1. Open the AI Software Engineer report and select Priya Shah's Python bar.
2. Open her radar profile, compare it with the pool average, and read the technical example.
3. Select Jordan Lee in Team collaboration and inspect the different profile.
4. Open Execution & ownership, then expand a **What to verify next** question.

For a user test, ask a recruiter to select two applicants for a role emphasizing Python and collaboration, explain the trade-offs, and identify one follow-up question. Compare completion time, ability to find relevant information, reasoning supported by the displayed examples, and reported confidence across the team's report prototypes. Use the same applicant data and task when comparing formats. Confidence alone does not establish decision quality.

## Demo data and scoring

All applicant names, experience descriptions, scores, and interview examples are fictional. Scores are predefined fixtures; they are not calculated from uploaded resumes or from the example interview summaries. Role changes reuse the same numerical templates while changing technical labels and examples.

The rankings and radars are connected as follows:

- The three technical ranking values use the first three dimensions of the technical radar.
- Work style, Team collaboration, and Communication & problem solving rankings use the rounded mean of their corresponding five radar dimensions.
- Independent delivery and Prioritization rankings use the first two dimensions of the Execution & ownership radar.
- Each radar card's summary score is its five-dimension rounded mean. Pool-average polygons use rounded averages across all 8 applicants for each dimension.

The demo includes no live AI interview, model-generated assessment, applicant database, saved resume storage, or automated hiring decision. Work-style examples describe fictional workplace behaviors, not validated personality measurements. This prototype can be used to test the report experience; it cannot validate real candidate-assessment accuracy.

## Files and team integration

| File | Purpose |
| --- | --- |
| `index.html` | Recruiter report entry point and page structure |
| `report.css` | Report layout, charts, responsive styles, and print styles |
| `report-data.js` | Fictional applicants, scores, radar dimensions, and role configuration |
| `interview-evidence.js` | Specific technical and collaboration examples for the applicant profiles |
| `report.js` | Rankings, candidate selection, SVG radar charts, filters, and CSV export |
| `applicant.html` | Shared applicant frontend adapted to route into the report |
| `app.js` | Job selection, local resume reading, and report navigation |
| `styles.css` | Applicant-page styling |
| `interview.js` | Original simulated-interview code, retained but unused in the current flow |
| `logo.png` | Head Hunters branding |
| `README.md` | Setup, feature guide, hypothesis, and development prompt log |

To integrate this report with another frontend, link to `index.html?role=ai`, `index.html?role=fe`, or `index.html?role=de`. An optional parameter such as `candidate=priya` sets the initially selected applicant. Keep the report scripts, stylesheet, and logo alongside `index.html`.

## AI development prompt log

These entries are edited summaries of the requests and follow-up questions used during development, not verbatim transcripts. The learning goals describe design intentions, not completed user-research findings.

| # | Prompt / request | What I was trying to learn |
| --- | --- | --- |
| 1 | Use the shared frontend to build a post-interview recruiter report. Show all applicants in competency ranking charts, and update individual radar charts when a bar is clicked. Skip the interview and use fictional data. | Could the interaction support moving from a pool-level comparison to an individual profile? |
| 2 | Remove the fictional company name Brightline Labs and use HH / Recruiter workspace. Update the website and downloadable files. | Could clearer branding communicate the product and recruiter context without confusing testers? |
| 3 | Explain the purpose of the A little more context section and how its examples relate to the applicant's assessment. | What value would interview examples add beyond the charts, and would their purpose be clear? |
| 4 | Make the examples more specific to each applicant, with the situation, personal contribution, and outcome. Suggest and implement one or two additional competency categories. | Could concrete examples help recruiters interpret scores, and could another category reveal useful differences? |
| 5 | Remove the separate Learning & adaptability section. Keep Execution & ownership and the more specific examples. | Could the report add useful information while avoiding overlap and unnecessary complexity? |
