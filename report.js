(() => {
  'use strict';
  const D=window.ReportData;
  const params=new URLSearchParams(location.search);
  const state={role:D.roles[params.get('role')]?params.get('role'):'ai',selected:D.candidates.some(c=>c.id===params.get('candidate'))?params.get('candidate'):'alex',filter:'all',average:true};
  const $=id=>document.getElementById(id);
  const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const role=()=>D.roles[state.role];
  function synchronizeURL(){const q=new URLSearchParams({role:state.role,candidate:state.selected});try{history.replaceState(null,'','?'+q.toString());}catch{/* file previews can restrict history updates */}}
  function renderRankings(){
    $('rankings').innerHTML=role().metrics.filter(m=>state.filter==='all'||m[2]===state.filter).map((m,i)=>{
      const ranked=[...D.candidates].sort((a,b)=>D.score(b,m)-D.score(a,m)||a.name.localeCompare(b.name));
      return `<article class="ranking-card" aria-labelledby="chart-${m[0]}"><div class="chart-heading"><div><h3 id="chart-${m[0]}">${safe(m[1])}</h3><p class="chart-kicker">${D.categories[m[2]]} · 8 APPLICANTS</p></div><span class="chart-index">${String(role().metrics.indexOf(m)+1).padStart(2,'0')}</span></div><div class="bar-list">${ranked.map((c,n)=>`<button class="bar-row" data-candidate="${c.id}" data-metric="${m[0]}" aria-pressed="${state.selected===c.id}" aria-label="${safe(c.name)}, rank ${n+1}, ${D.score(c,m)} out of 100 in ${safe(m[1])}. Show applicant profile." style="--candidate-color:${c.color};--score:${D.score(c,m)}%"><span class="rank">${String(n+1).padStart(2,'0')}</span><span class="bar-name">${safe(c.name)}</span><span class="bar-track" aria-hidden="true"><span class="bar-fill"></span></span><span class="bar-value">${D.score(c,m)}</span></button>`).join('')}</div><div class="chart-axis" aria-hidden="true"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div><p class="chart-footer">${typeof m[3]==='number'||Array.isArray(m[3])?'Illustrative interview competency score':'Mean of the five corresponding radar dimensions'} · click a bar to explore</p></article>`;
    }).join('');
  }
  function renderLegend(){
    $('candidate-legend').innerHTML=D.candidates.map(c=>`<button class="legend-item" data-candidate="${c.id}" aria-pressed="${c.id===state.selected}"><span class="color-dot" style="background:${c.color}"></span>${safe(c.name)}</button>`).join('');
  }
  function radarSVG(c,dimension,labels){
    const cx=200,cy=151,r=88,n=labels.length;
    const point=(i,value,rr=r)=>{const a=-Math.PI/2+i*2*Math.PI/n;return [cx+Math.cos(a)*rr*value/100,cy+Math.sin(a)*rr*value/100]};
    const points=values=>values.map((v,i)=>point(i,v).map(x=>x.toFixed(2)).join(',')).join(' ');
    const averages=labels.map((_,i)=>D.mean(D.candidates.map(p=>p[dimension.id][i])));
    const splitLabel=label=>{if(label.length<=16)return [label];const words=label.split(' ');let first=words.shift();while(words.length>1&&first.length+words[0].length<15)first+=' '+words.shift();return[first,words.join(' ')]};
    return `<svg class="radar-svg" viewBox="0 0 400 310" role="img" aria-labelledby="radar-title-${dimension.id} radar-desc-${dimension.id}"><title id="radar-title-${dimension.id}">${safe(c.name)} — ${safe(dimension.title)}</title><desc id="radar-desc-${dimension.id}">${labels.map((l,i)=>safe(l)+': '+c[dimension.id][i]+' out of 100').join('; ')}.${state.average?' Dashed polygon represents the average of all 8 fictional applicants.':''}</desc>${[25,50,75,100].map(level=>`<polygon points="${points(labels.map(()=>level))}" fill="${level===100?'#fafbf7':'none'}" stroke="#e4e8dd" stroke-width="1"/>`).reverse().join('')}${labels.map((_,i)=>`<line x1="${cx}" y1="${cy}" x2="${point(i,100)[0]}" y2="${point(i,100)[1]}" stroke="#e4e8dd"/>`).join('')}${[25,50,75,100].map(v=>`<text class="tick-label" x="${cx+4}" y="${cy-r*v/100-3}">${v}</text>`).join('')}${state.average?`<polygon class="average-polygon" points="${points(averages)}" fill="none" stroke="#9da59b" stroke-width="1.5" stroke-dasharray="4 4"/>`:''}<polygon class="candidate-polygon" points="${points(c[dimension.id])}" fill="${c.color}" fill-opacity=".15" stroke="${c.color}" stroke-width="2"/>${c[dimension.id].map((v,i)=>`<circle cx="${point(i,v)[0]}" cy="${point(i,v)[1]}" r="3.5" fill="${c.color}" stroke="#fff" stroke-width="1.5"/>`).join('')}${labels.map((label,i)=>{const [x,y]=point(i,100,119);const lines=splitLabel(label);return `<text x="${x}" y="${y-(lines.length>1?5:0)}" text-anchor="middle">${lines.map((l,j)=>`<tspan x="${x}" dy="${j===0?0:12}">${safe(l)}</tspan>`).join('')}</text>`}).join('')}</svg>`;
  }
  function profileCopy(c){
    const evidence=D.evidenceFor(c,state.role);
    if(state.role==='ai')return {...c,evidence,followup:evidence[0].verify};
    const labels=role().technicalLabels;
    return {...c,headline:`${c.years} of experience · ${role().title} interview profile.`,strength:evidence[0].action,followup:evidence[0].verify,evidence};
  }
  function renderEvidence(c){
    return `<section class="evidence-section" aria-labelledby="evidence-title"><header class="evidence-header"><div><p class="eyebrow">INTERVIEW CONTEXT</p><h3 id="evidence-title">Interview evidence</h3><p class="evidence-label">Specific response summaries for ${safe(c.name)} · all situations and results are fictional.</p></div><span class="demo-badge">ILLUSTRATIVE EXAMPLES</span></header><div class="evidence-items">${c.evidence.map((e,i)=>`<article class="evidence-item"><div class="evidence-card-heading"><small>EXAMPLE ${String(i+1).padStart(2,'0')}</small><h4>${safe(e.title)}</h4><p class="evidence-focus">${safe(e.focus)}</p></div><div class="evidence-prompt"><span>EXAMPLE INTERVIEW PROMPT</span><p>${safe(e.prompt)}</p></div><dl class="evidence-fields"><div><dt>Situation</dt><dd>${safe(e.context)}</dd></div><div><dt>Personal contribution</dt><dd>${safe(e.action)}</dd></div><div class="evidence-result"><dt>Result & scope</dt><dd>${safe(e.result)}</dd></div></dl><details class="evidence-followup"><summary>What to verify next</summary><p>${safe(e.verify)}</p></details></article>`).join('')}</div></section>`;
  }
  function renderProfile(){
    const c=profileCopy(D.candidates.find(x=>x.id===state.selected));
    const index=D.candidates.findIndex(x=>x.id===state.selected);
    $('candidate-profile').style.setProperty('--candidate-color',c.color);
    $('candidate-profile').innerHTML=`<div class="candidate-summary"><div><div class="candidate-id"><div class="avatar" aria-hidden="true">${c.initials}</div><div><h3 class="candidate-title">${safe(c.name)}</h3><p class="candidate-meta">Applicant ${String(index+1).padStart(2,'0')} · ${safe(c.years)} experience <span class="complete-tag">✓ Interview completed</span></p></div></div><p class="candidate-headline">${safe(c.headline)}</p><div class="trait-tags">${c.traits.map(t=>`<span>${safe(t)}</span>`).join('')}</div></div><div class="candidate-insight"><div><h4>Standout evidence</h4><p>${safe(c.strength)}</p></div><div><h4>Worth a follow-up</h4><p>${safe(c.followup)}</p></div></div></div><div class="profile-toolbar"><div class="profile-legend"><span><i class="line-swatch"></i>${safe(c.name)}</span>${state.average?'<span><i class="line-swatch average"></i>Applicant pool average</span>':''}<span>Scale: 0–100</span></div><div class="candidate-controls"><button class="arrow-button" data-step="-1" aria-label="Previous applicant">‹</button><label class="sr-only" for="candidate-select">Selected applicant</label><select id="candidate-select">${D.candidates.map(p=>`<option value="${p.id}" ${p.id===c.id?'selected':''}>${safe(p.name)}</option>`).join('')}</select><button class="arrow-button" data-step="1" aria-label="Next applicant">›</button></div></div><div class="radar-grid">${D.dimensions.map(d=>{const labels=d.id==='technical'&&role().technicalLabels?role().technicalLabels:d.labels;return `<article class="radar-card" style="--dimension-color:${d.color}"><header><div><h3>${safe(d.title)}</h3><p class="radar-subtitle">${safe(d.subtitle)}</p></div><div class="dimension-score">${D.mean(c[d.id])}<small>/100</small></div></header><div class="radar-body">${radarSVG(c,d,labels)}<ul class="radar-details" aria-label="${safe(d.title)} scores">${labels.map((l,i)=>`<li><div class="radar-label"><span>${safe(l)}</span><b>${c[d.id][i]}</b></div><div class="detail-track" aria-hidden="true"><span style="--score:${c[d.id][i]}%"></span></div></li>`).join('')}</ul></div><p class="radar-caption">${d.id==='style'?'Illustrative work behaviors, not a clinical personality assessment.':'Same dimensions for every applicant. Each profile reflects different scores.'}</p></article>`}).join('')}</div>${renderEvidence(c)}`;
  }
  function selectCandidate(id){
    if(!D.candidates.some(c=>c.id===id))return;
    state.selected=id;
    document.querySelectorAll('[data-candidate]').forEach(el=>el.setAttribute('aria-pressed',el.dataset.candidate===id));
    renderProfile();synchronizeURL();
    $('profile-live').textContent=`Profile updated: ${D.candidates.find(c=>c.id===id).name}. All five radar charts now show this applicant.`;
  }
  document.addEventListener('click',e=>{
    const candidate=e.target.closest('[data-candidate]');if(candidate){selectCandidate(candidate.dataset.candidate);$('dock-name').textContent=D.candidates.find(c=>c.id===state.selected).name+' selected';$('selection-dock').hidden=false;return;}
    const step=e.target.closest('[data-step]');if(step){const i=D.candidates.findIndex(c=>c.id===state.selected);selectCandidate(D.candidates[(i+Number(step.dataset.step)+D.candidates.length)%D.candidates.length].id);document.querySelector(`[data-step="${step.dataset.step}"]`).focus();return;}
    const filter=e.target.closest('[data-filter]');if(filter){state.filter=filter.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',b===filter));renderRankings();}
  });
  document.addEventListener('change',e=>{if(e.target.id==='candidate-select'){selectCandidate(e.target.value);$('candidate-select').focus();}});
  $('show-average').addEventListener('change',e=>{state.average=e.target.checked;renderProfile();});
  $('view-profile').addEventListener('click',()=>{$('selection-dock').hidden=true;$('profile-title').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});$('profile-title').focus({preventScroll:true});});
  $('close-dock').addEventListener('click',()=>{$('selection-dock').hidden=true;});
  $('role').value=state.role;
  $('role').addEventListener('change',e=>{state.role=e.target.value;renderRankings();renderProfile();synchronizeURL();});
  $('export').addEventListener('click',()=>{
    const quote=v=>'"'+String(v).replace(/"/g,'""')+'"';
    const rows=[['DEMO DATA — fictional applicant scores; not hiring recommendations'],['Role',role().title],['Applicant',...role().metrics.map(m=>m[1])],...D.candidates.map(c=>[c.name,...role().metrics.map(m=>D.score(c,m))])];
    const url=URL.createObjectURL(new Blob(['\ufeff'+rows.map(r=>r.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=`head-hunters-${state.role}-demo-scores.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  if(params.get('from')==='applicant'){$('submission-notice').hidden=false;$('submission-notice').textContent='Resume step completed. The AI pre-view interview is skipped in this prototype. You are now viewing the recruiter report with eight fictional completed interviews; uploaded resume content is not scored or added to these fixtures.';}
  renderLegend();renderRankings();renderProfile();
})();
