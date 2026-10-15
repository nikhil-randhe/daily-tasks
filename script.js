const K='dtt_v1';let S=null;
try{S=JSON.parse(localStorage.getItem(K))}catch(e){}
S=S||{tasks:[],done:{},hid:{}};
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
const pad=n=>String(n).padStart(2,'0');
const key=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=k=>{const[a,b,c]=k.split('-');return new Date(+a,b-1,+c)};
const DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const fmt=k=>{const d=parse(k);return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()+' ('+DN[d.getDay()]+')'};
const addD=(k,n)=>{const d=parse(k);d.setDate(d.getDate()+n);return key(d)};
const TODAY=key(new Date());
let cur=TODAY,tab='today',mode='week',anc=TODAY;
const P={l:'<path d="M15 18l-6-6 6-6"/>',r:'<path d="M9 18l6-6-6-6"/>',ck:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',eoff:'<path d="M3 3l18 18M10.6 6.1A9.6 9.6 0 0112 6c6.5 0 10 6 10 6a17 17 0 01-3.2 3.9M6.6 6.7C3.6 8.6 2 12 2 12s3.5 7 10 7c1.8 0 3.4-.4 4.8-1.1M9.9 9.9a3 3 0 004.2 4.2"/>',tr:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3"/>',list:'<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',bar:'<path d="M5 20V10M12 20V4M19 20v-7"/>'};
const ic=(n,s=20,w=2)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" style="display:block">${P[n]}</svg>`;
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const vis=k=>S.tasks.filter(t=>t.start<=k&&(!t.end||k<t.end));
const isHid=(k,id)=>!!(S.hid[k]&&S.hid[k][id]);
const isDone=(k,id)=>!!(S.done[k]&&S.done[k][id]);
const active=k=>vis(k).filter(t=>!isHid(k,t.id));
const score=k=>{const a=active(k);if(!a.length)return null;const n=a.filter(t=>isDone(k,t.id)).length;return{n,t:a.length,p:Math.round(n/a.length*100)}};
const col=p=>p>=80?'#4CC38A':p>=50?'#F7B955':'#F59E55';
function range(){
  if(mode==='week'){const d=parse(anc);const s=addD(anc,-((d.getDay()+6)%7));return Array.from({length:7},(_,i)=>addD(s,i))}
  const d=parse(anc),n=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
  return Array.from({length:n},(_,i)=>key(new Date(d.getFullYear(),d.getMonth(),i+1)));
}
function renderToday(){
  const list=vis(cur),sc=score(cur),past=cur<TODAY,fut=cur>TODAY;
  const p=sc?sc.p:0,C=2*Math.PI*34;
  let h=`<h1>Daily Tasks</h1><div class="nav"><button class="ib" data-a="prev">${ic("l")}</button><b>${fmt(cur)}</b><button class="ib" data-a="next">${ic("r")}</button></div>`;
  if(cur!==TODAY)h+=`<button class="tdy" data-a="today">Go to today</button>`;
  h+=`<div class="hero"><svg width="84" height="84" viewBox="0 0 84 84"><circle cx="42" cy="42" r="34" fill="none" stroke="#FFD9B3" stroke-width="9"/><circle cx="42" cy="42" r="34" fill="none" stroke="#F59E55" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C*p/100} ${C}" transform="rotate(-90 42 42)"/><text x="42" y="47" text-anchor="middle" fill="#3B1D0B" font-size="18" font-weight="700">${sc?p+'%':'–'}</text></svg><div><div class="big">${sc?(p===100?'All tasks done':p>=50?'Good progress':'Let’s get started'):'No tasks for this day'}</div><small>${sc?sc.n+' of '+sc.t+' tasks completed':'Add a task below'}</small></div></div>`;
  if(!list.length)h+=`<div class="empty">No tasks yet</div>`;
  list.forEach(t=>{const hd=isHid(cur,t.id),dn=isDone(cur,t.id);
    h+=`<div class="card task ${hd?'hid':''}"><button class="chk ${dn&&!hd?'on':''}" data-a="tick" data-id="${t.id}" ${hd||fut?'disabled style="opacity:.4"':''}>${dn&&!hd?ic('ck',18,3):''}</button><span class="nm">${esc(t.name)}</span><button class="sm" data-a="hide" data-id="${t.id}" title="${hd?'Unhide':'Hide for this day'}">${ic(hd?'eoff':'eye',20)}</button>${past?'':`<button class="sm" data-a="del" data-id="${t.id}" title="Delete from this day onwards">${ic('tr',19)}</button>`}</div>`});
  if(past)h+=`<div class="note">Past day: tasks can’t be added or deleted here, only ticked or hidden.</div>`;
  else h+=`<div class="add"><input id="ni" placeholder="Add a new task…" maxlength="80"><button class="btn" data-a="add">Add</button></div><div class="note">New tasks appear from this date onwards. The eye icon hides a task for this day only (not counted in score).</div>`;
  return h;
}
function renderDash(){
  const days=range(),sc=days.map(k=>({k,s:score(k)}));
  const done=sc.filter(x=>x.s&&x.k<=TODAY);
  const avg=done.length?Math.round(done.reduce((a,x)=>a+x.s.p,0)/done.length):0;
  const perfect=done.filter(x=>x.s.p===100).length;
  let streak=0;for(let k=TODAY;;k=addD(k,-1)){const s=score(k);if(s&&s.p===100)streak++;else if(s||k===TODAY&&!s){if(k!==TODAY||s)break}else if(!s&&k!==TODAY)break;if(streak>3650)break}
  const bestDay=done.length?done.reduce((a,x)=>x.s.p>a.s.p?x:a):null;
  const d=parse(anc),MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const lbl=mode==='week'?fmt(days[0]).slice(0,10)+' – '+fmt(days[6]).slice(0,10):MN[d.getMonth()]+' '+d.getFullYear();
  let h=`<h1>Dashboard</h1><div class="seg"><button data-a="mode" data-m="week" class="${mode==='week'?'on':''}">Weekly</button><button data-a="mode" data-m="month" class="${mode==='month'?'on':''}">Monthly</button></div><div class="nav"><button class="ib" data-a="dp">${ic("l")}</button><b>${lbl}</b><button class="ib" data-a="dn">${ic("r")}</button></div>`;
  h+=`<div class="stats"><div class="st s1"><b>${avg}%</b><span>Average score</span></div><div class="st s2"><b>${perfect}</b><span>Perfect days (100%)</span></div><div class="st s3"><b>${streak} day${streak===1?'':'s'}</b><span>Current streak</span></div><div class="st s4"><b>${bestDay?bestDay.s.p+'%':'–'}</b><span>Best day${bestDay?' · '+fmt(bestDay.k).slice(0,5):''}</span></div></div>`;
  h+=`<div class="card chart">`+sc.map(x=>{const f=x.k>TODAY,p=x.s?x.s.p:0,dt=parse(x.k);
    return `<div class="col">${mode==='week'&&x.s?`<em>${p}%</em>`:''}<div class="bar" style="height:${x.s?Math.max(p*.8,3):3}px;background:${f||!x.s?'#FFE4CC':col(p)}"></div><i>${mode==='week'?DN[dt.getDay()]:(dt.getDate()%5===1||dt.getDate()===1?dt.getDate():'')}</i></div>`}).join('')+`</div>`;
  const rates=S.tasks.map(t=>{let a=0,b=0;days.forEach(k=>{if(k<=TODAY&&vis(k).includes(t)&&!isHid(k,t.id)){b++;if(isDone(k,t.id))a++}});return{t,a,b}}).filter(r=>r.b);
  h+=`<h3>Task-wise completion</h3>`;
  if(!rates.length)h+=`<div class="empty">No data for this period</div>`;
  rates.forEach(r=>{const p=Math.round(r.a/r.b*100);h+=`<div class="card rate"><div><span>${esc(r.t.name)}</span><b>${p}% <small style="color:var(--mu);font-weight:400">(${r.a}/${r.b})</small></b></div><div class="trk"><div style="width:${p}%;background:${col(p)}"></div></div></div>`});
  return h;
}
function render(){
  const f=document.activeElement&&document.activeElement.id==='ni'?document.getElementById('ni').value:'';
  document.getElementById('app').innerHTML=tab==='today'?renderToday():renderDash();
  const ni=document.getElementById('ni');if(ni&&f)ni.value=f;
  t1.className=tab==='today'?'on':'';t2.className=tab==='dash'?'on':'';
}
function addTask(){
  const i=document.getElementById('ni'),v=i.value.trim();if(!v)return;
  S.tasks.push({id:'t'+Date.now()+Math.random().toString(36).slice(2,5),name:v,start:cur,end:null});
  save();render();
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-a]');if(!b||b.disabled)return;
  const a=b.dataset.a,id=b.dataset.id;
  if(a==='prev')cur=addD(cur,-1);
  else if(a==='next')cur=addD(cur,1);
  else if(a==='today')cur=TODAY;
  else if(a==='add')return addTask();
  else if(a==='tick'){S.done[cur]=S.done[cur]||{};S.done[cur][id]=!S.done[cur][id];save()}
  else if(a==='hide'){S.hid[cur]=S.hid[cur]||{};S.hid[cur][id]=!S.hid[cur][id];save()}
  else if(a==='del'){const t=S.tasks.find(x=>x.id===id);if(!confirm('Delete "'+t.name+'" from '+fmt(cur)+' onwards?\nPrevious days stay unchanged.'))return;t.end=cur;save()}
  else if(a==='mode'){mode=b.dataset.m}
  else if(a==='dp'||a==='dn'){const s=a==='dn'?1:-1;if(mode==='week')anc=addD(anc,7*s);else{const d=parse(anc);anc=key(new Date(d.getFullYear(),d.getMonth()+s,1))}}
  render();
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='ni')addTask()});
t1.onclick=()=>{tab='today';render()};t2.onclick=()=>{tab='dash';anc=cur;render()};
i1.innerHTML=ic('list',18);i2.innerHTML=ic('bar',18);
render();

if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js').catch(function(){})}
