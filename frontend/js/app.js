
let loginCaptcha="";
function newLoginCaptcha(){
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  loginCaptcha=Array.from({length:5},()=>chars[Math.floor(Math.random()*chars.length)]).join("");
  const el=document.getElementById("captchaValue"); if(el)el.textContent=loginCaptcha;
}



async function doctorsPage(){
  try{
    const r=await api("/auth/doctors");
    $("page").innerHTML=`<div class="animate-up"><div class="topbar"><div><span class="eyebrow">HOSPITAL ADMINISTRATION</span><div class="title">Registered Doctors</div><p class="subtitle">Only hospital administrators can create or deactivate doctor accounts.</p></div></div>
    <div class="card"><div class="section-title">Register new doctor</div><div class="reminder-form">
    <label>DOCTOR NAME<input id="docName" placeholder="Dr. Full Name"></label>
    <label>STAFF ID<input id="docStaffId" placeholder="Hospital staff ID"></label>
    <label>EMAIL<input id="docEmail" type="email" placeholder="doctor@hospital.com"></label>
    <label>TEMPORARY PASSWORD<input id="docPassword" type="password" minlength="8" placeholder="Minimum 8 characters"></label>
    <div class="full-col"><button class="btn primary" id="registerDoctor">Register doctor</button></div></div></div>
    <div class="card" style="margin-top:16px"><div class="section-title">Doctor accounts</div><div class="table-wrap"><table class="table"><thead><tr><th>NAME</th><th>STAFF ID</th><th>EMAIL</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>
    ${r.doctors.map(d=>`<tr><td>${escapeHtml(d.name)}</td><td>${escapeHtml(d.staffId)}</td><td>${escapeHtml(d.email)}</td><td><span class="badge">${d.active?"Active":"Inactive"}</span></td><td><button class="btn" onclick="toggleDoctor('${d._id}',${!d.active})">${d.active?"Deactivate":"Activate"}</button></td></tr>`).join("")}
    </tbody></table></div></div></div>`;
    $("registerDoctor").onclick=async()=>{
      try{
        await api("/auth/register-doctor",{method:"POST",body:JSON.stringify({
          name:$("docName").value.trim(),staffId:$("docStaffId").value.trim(),email:$("docEmail").value.trim(),password:$("docPassword").value
        })});
        toast("Doctor registered successfully");doctorsPage();
      }catch(e){toast(e.message)}
    };
  }catch(e){toast(e.message)}
}
async function toggleDoctor(id,active){
  try{await api("/auth/doctors/"+id+"/status",{method:"PATCH",body:JSON.stringify({active})});toast(active?"Doctor activated":"Doctor deactivated");doctorsPage()}
  catch(e){toast(e.message)}
}
window.toggleDoctor=toggleDoctor;

/* ===== Multilingual patient experience + reminders ===== */
const LANGS={
en:{name:"English",medicine:"Medicine",appointment:"Appointment",reminders:"Reminders",schedule:"Schedule reminder",upcoming:"Upcoming reminders",enable:"Enable notifications",enabled:"Notifications enabled",language:"Patient language",once:"Once",daily:"Daily",patient:"Patient",cancel:"Cancel"},
hi:{name:"हिन्दी",medicine:"दवा",appointment:"डॉक्टर अपॉइंटमेंट",reminders:"रिमाइंडर",schedule:"रिमाइंडर सेट करें",upcoming:"आने वाले रिमाइंडर",enable:"नोटिफिकेशन चालू करें",enabled:"नोटिफिकेशन चालू हैं",language:"मरीज़ की भाषा",once:"एक बार",daily:"हर दिन",patient:"मरीज़",cancel:"रद्द करें"},
mr:{name:"मराठी",medicine:"औषध",appointment:"डॉक्टर भेट",reminders:"स्मरणपत्र",schedule:"स्मरणपत्र सेट करा",upcoming:"आगामी स्मरणपत्रे",enable:"नोटिफिकेशन सुरू करा",enabled:"नोटिफिकेशन सुरू आहेत",language:"रुग्णाची भाषा",once:"एकदा",daily:"दररोज",patient:"रुग्ण",cancel:"रद्द करा"},
ta:{name:"தமிழ்",medicine:"மருந்து",appointment:"மருத்துவர் சந்திப்பு",reminders:"நினைவூட்டல்கள்",schedule:"நினைவூட்டலை அமைக்கவும்",upcoming:"வரவிருக்கும் நினைவூட்டல்கள்",enable:"அறிவிப்புகளை இயக்கவும்",enabled:"அறிவிப்புகள் இயக்கப்பட்டன",language:"நோயாளியின் மொழி",once:"ஒருமுறை",daily:"தினமும்",patient:"நோயாளர்",cancel:"ரத்து"},
te:{name:"తెలుగు",medicine:"మందు",appointment:"డాక్టర్ అపాయింట్‌మెంట్",reminders:"రిమైండర్లు",schedule:"రిమైండర్ సెట్ చేయండి",upcoming:"రాబోయే రిమైండర్లు",enable:"నోటిఫికేషన్లు ప్రారంభించండి",enabled:"నోటిఫికేషన్లు ప్రారంభించబడ్డాయి",language:"రోగి భాష",once:"ఒక్కసారి",daily:"ప్రతిరోజూ",patient:"రోగి",cancel:"రద్దు"},
bn:{name:"বাংলা",medicine:"ওষুধ",appointment:"ডাক্তারের অ্যাপয়েন্টমেন্ট",reminders:"রিমাইন্ডার",schedule:"রিমাইন্ডার সেট করুন",upcoming:"আসন্ন রিমাইন্ডার",enable:"নোটিফিকেশন চালু করুন",enabled:"নোটিফিকেশন চালু",language:"রোগীর ভাষা",once:"একবার",daily:"প্রতিদিন",patient:"রোগী",cancel:"বাতিল"}
};
let currentLang=localStorage.getItem("carevault_lang")||"en";
const T=k=>(LANGS[currentLang]&&LANGS[currentLang][k])||LANGS.en[k]||k;
function langSelect(){return `<div class="language-bar"><span class="muted">${T("language")}:</span><select id="langSelect">${Object.entries(LANGS).map(([k,v])=>`<option value="${k}" ${k===currentLang?"selected":""}>${v.name}</option>`).join("")}</select></div>`}
function bindLang(){const s=document.getElementById("langSelect");if(s)s.onchange=()=>{currentLang=s.value;localStorage.setItem("carevault_lang",currentLang);render()}}
async function enableNotifications(){
 if(!("Notification" in window))return toast("Browser notifications are not supported");
 const p=await Notification.requestPermission();
 toast(p==="granted"?T("enabled"):"Notification permission was not granted");
}
function localReminder(r){
 const ms=new Date(r.remindAt).getTime()-Date.now();
 if(ms<=0||ms>2147483647)return;
 setTimeout(()=>{
   if(Notification.permission==="granted"){
     new Notification(r.type==="medicine"?"💊 "+r.title:"📅 "+r.title,{body:r.notes||"CareVault reminder"});
   }
   if(r.repeat==="daily"){r.remindAt=new Date(new Date(r.remindAt).getTime()+86400000).toISOString();localReminder(r)}
 },ms);
}
async function remindersPage(){
 let rs=[];
 try{rs=(await api("/reminders")).reminders;rs.forEach(localReminder)}catch(e){toast(e.message)}
 $("page").innerHTML=`<div class="animate-up"><div class="topbar"><div><span class="eyebrow">PATIENT CARE</span><div class="title">${T("reminders")}</div><p class="subtitle">Medicine intake and doctor appointment reminders.</p></div><div class="actions">${langSelect()}<button class="btn" id="notifyBtn">🔔 ${T("enable")}</button></div></div>
 <div class="card"><div class="section-title">${T("schedule")}</div><div class="reminder-form">
 <label>${T("patient")}<select id="remPatient">${state.patients.map(p=>`<option value="${p._id}">#${p._id.slice(-8).toUpperCase()}</option>`).join("")}</select></label>
 <label>TYPE<select id="remType"><option value="medicine">💊 ${T("medicine")}</option><option value="appointment">📅 ${T("appointment")}</option></select></label>
 <label>TITLE<input id="remTitle" placeholder="Medicine name or appointment title"></label>
 <label>TIME<input id="remAt" type="datetime-local" required></label>
 <label>REPEAT<select id="remRepeat"><option value="once">${T("once")}</option><option value="daily">${T("daily")}</option></select></label>
 <label>${T("language")}<select id="remLang">${Object.entries(LANGS).map(([k,v])=>`<option value="${k}" ${k===currentLang?"selected":""}>${v.name}</option>`).join("")}</select></label>
 <label class="full-col">NOTES<textarea id="remNotes" placeholder="Dosage, timing, clinic location or preparation instructions"></textarea></label>
 <div class="full-col"><button class="btn primary" id="createRem">${T("schedule")}</button></div></div></div>
 <div class="card" style="margin-top:16px"><div class="section-title">${T("upcoming")}</div><div class="reminder-list">${rs.length?rs.map(r=>`<div class="reminder"><div><strong>${r.type==="medicine"?"💊":"📅"} ${escapeHtml(r.title)}</strong><small>#${r.patientId?String(r.patientId._id).slice(-8).toUpperCase():""} · ${new Date(r.remindAt).toLocaleString()} · ${r.repeat==="daily"?T("daily"):T("once")}</small><small>${escapeHtml(r.notes||"")}</small></div><button class="btn danger" onclick="cancelReminder('${r._id}')">${T("cancel")}</button></div>`).join(""):`<div class="empty">${T("upcoming")}: none</div>`}</div></div></div>`;
 bindLang();
 $("notifyBtn").onclick=enableNotifications;
 $("createRem").onclick=async()=>{
   const when=$("remAt").value;
   if(!when||new Date(when)<=new Date())return toast("Choose a future reminder time");
   if(!$("remTitle").value.trim())return toast("Enter a reminder title");
   try{
     const r=await api("/reminders",{method:"POST",body:JSON.stringify({patientId:$("remPatient").value,type:$("remType").value,title:$("remTitle").value.trim(),notes:$("remNotes").value,remindAt:new Date(when).toISOString(),repeat:$("remRepeat").value,language:$("remLang").value})});
     localReminder(r.reminder);toast("Reminder scheduled");remindersPage();
   }catch(e){toast(e.message)}
 };
}
async function cancelReminder(id){try{await api("/reminders/"+id,{method:"DELETE"});toast("Reminder cancelled");remindersPage()}catch(e){toast(e.message)}}
window.cancelReminder=cancelReminder;

const API="http://localhost:5000/api";
const state={user:null,patients:[],page:"dashboard"};

const $=id=>document.getElementById(id);
function toast(msg){$("toast").innerHTML=`<div class="toast-msg">${escapeHtml(msg)}</div>`;setTimeout(()=>$("toast").innerHTML="",2800)}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
async function api(path,opts={}){
  let res;
  try{res=await fetch(API+path,{credentials:"include",headers:{"Content-Type":"application/json",...(opts.headers||{})},...opts})}
  catch(e){throw Error("Backend is not reachable. Start Node/Express on http://localhost:5000.")}
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw Error(data.message||`Request failed (${res.status})`);
  return data;
}

async function start(){try{const r=await api("/auth/me");state.user=r.user;await loadPatients();showApp()}catch{showLogin()}}
function showLogin(){ $("loginScreen").classList.remove("hidden");$("appScreen").classList.add("hidden");bindLang();newLoginCaptcha() }
function showApp(){
 $("loginScreen").classList.add("hidden");$("appScreen").classList.remove("hidden");
 $("userName").textContent=state.user.name;$("userRole").textContent=state.user.role+" · Staff ID "+(state.user.staffId||"");
 document.querySelectorAll(".admin-only").forEach(x=>x.classList.toggle("hidden",state.user.role!=="admin"));
 document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>{state.page=b.dataset.page;render()});
 render()
}
$("loginForm").onsubmit=async e=>{
  e.preventDefault();
  if(($("loginCaptcha").value||"").trim().toUpperCase()!==loginCaptcha){
    toast("Incorrect captcha");newLoginCaptcha();$("loginCaptcha").value="";return;
  }
  try{
    await api("/auth/login",{method:"POST",body:JSON.stringify({
      staffId:$("loginStaffId").value.trim(),
      password:$("loginPassword").value
    })});
    await start();
  }catch(err){toast(err.message);newLoginCaptcha()}
};

$("logoutBtn").onclick=async()=>{await api("/auth/logout",{method:"POST"});state.user=null;showLogin()};

async function loadPatients(){const r=await api("/patients");state.patients=r.patients}
function navActive(){document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===state.page))}
function render(){navActive();if(state.page==="dashboard")dashboard();if(state.page==="patients")patientsPage();if(state.page==="new")formPage();if(state.page==="audit")auditPage();if(state.page==="reminders")remindersPage();if(state.page==="doctors")doctorsPage()}

function patientRows(list=state.patients){if(!list.length)return `<div class="empty">No patient cases found.<br><br><button class="btn primary" onclick="state.page='new';render()">Create first case</button></div>`;return `<div class="table-wrap"><table class="table"><thead><tr><th>CASE ID</th><th>LAST UPDATED</th><th>STATUS</th></tr></thead><tbody>${list.map(p=>`<tr onclick="openPatient('${p._id}')"><td>#${p._id.slice(-8).toUpperCase()}</td><td>${new Date(p.updatedAt).toLocaleString()}</td><td><span class="badge">Encrypted</span></td></tr>`).join("")}</tbody></table></div>`}
function dashboard(){$("page").innerHTML=`<div class="animate-up"><div class="topbar"><div><span class="eyebrow">CLINICAL COMMAND CENTER</span><div class="title">Good day, ${escapeHtml(state.user.name)}</div><p class="subtitle">Structured history taking with privacy-first records.</p></div><button class="btn primary" onclick="state.page='new';render()">＋ New patient</button></div><div class="grid3"><div class="card"><span class="metric-label">TOTAL CASES</span><div class="metric">${state.patients.length}</div><span class="badge">Encrypted records</span></div><div class="card"><span class="metric-label">ROLE</span><div class="metric" style="font-size:22px;text-transform:capitalize">${escapeHtml(state.user.role)}</div><span class="badge">RBAC enabled</span></div><div class="card"><span class="metric-label">SECURITY</span><div class="metric" style="font-size:22px">Protected</div><span class="badge">AES-256-GCM</span></div></div><div class="card" style="margin-top:16px"><div class="topbar"><div><div class="section-title">Recent cases</div><p class="subtitle">Open a case to decrypt authorized details.</p></div><button class="btn" onclick="state.page='patients';render()">View all</button></div>${patientRows(state.patients.slice(0,5))}</div></div>`}
function patientsPage(){$("page").innerHTML=`<div class="animate-up"><div class="topbar"><div><span class="eyebrow">CASE REGISTRY</span><div class="title">Patients</div><p class="subtitle">Patient content stays encrypted in MongoDB.</p></div><div class="actions"><input class="search" id="search" placeholder="Search case ID..."><button class="btn primary" onclick="state.page='new';render()">＋ New patient</button></div></div><div class="card" id="patientList">${patientRows()}</div></div>`;$("search").oninput=e=>{$("patientList").innerHTML=patientRows(state.patients.filter(p=>p._id.toLowerCase().includes(e.target.value.toLowerCase())))}} 
function val(id){return $(id).value}
function inp(id,label,value="",type="text"){return `<label>${label}<input id="${id}" type="${type}" value="${escapeHtml(value)}"></label>`}
function area(id,label,value=""){return `<label class="full-col">${label}<textarea id="${id}">${escapeHtml(value)}</textarea></label>`}
function formPage(record=null){
 const p=record?.data?.personal||{},m=record?.data?.medical||{};
 $("page").innerHTML=`<div class="animate-up"><div class="topbar"><div><span class="eyebrow">${record?"EDIT CASE":"NEW CASE"}</span><div class="title">${record?"Patient record":"Patient case-taking"}</div><p class="subtitle">All patient fields are encrypted by the backend before MongoDB storage.</p></div><div class="actions"><button class="btn" onclick="state.page='patients';render()">Cancel</button><button class="btn primary" id="saveBtn">Save securely</button></div></div><form id="patientForm" class="card">
 <div class="form-section"><div class="section-title">01 · Personal details</div><div class="form-grid">${inp("fullName","FULL NAME",p.fullName)}${inp("dob","DATE OF BIRTH",p.dateOfBirth,"date")}${inp("gender","GENDER",p.gender)}${inp("phone","PHONE",p.phone)}${inp("email","EMAIL",p.email,"email")}${inp("emergency","EMERGENCY CONTACT",p.emergencyContact)}${area("address","ADDRESS",p.address)}</div></div>
 <div class="form-section"><div class="section-title">02 · Clinical history</div><div class="form-grid">${area("complaint","CHIEF COMPLAINT",m.chiefComplaint)}${area("hpi","HISTORY OF PRESENT ILLNESS",m.historyPresentIllness)}${area("past","PAST MEDICAL HISTORY",m.pastMedicalHistory)}${area("surgery","PAST SURGICAL HISTORY",m.surgicalHistory)}${area("meds","CURRENT MEDICATIONS",m.medications)}${area("allergies","DRUG / FOOD ALLERGIES",m.allergies)}${area("family","FAMILY HISTORY",m.familyHistory)}${area("personal","PERSONAL HISTORY",m.personalHistory)}</div></div>
 <div class="form-section"><div class="section-title">03 · Examination & plan</div><div class="form-grid">${area("exam","EXAMINATION FINDINGS",m.examination)}${area("diagnosis","CLINICAL IMPRESSION / DIAGNOSIS",m.diagnosis)}${area("treatment","TREATMENT PLAN",m.treatmentPlan)}${area("notes","ADDITIONAL NOTES",m.notes)}</div></div></form></div>`;
 $("saveBtn").onclick=async()=>{const body={personal:{fullName:val("fullName"),dateOfBirth:val("dob"),gender:val("gender"),phone:val("phone"),email:val("email"),address:val("address"),emergencyContact:val("emergency")},medical:{chiefComplaint:val("complaint"),historyPresentIllness:val("hpi"),pastMedicalHistory:val("past"),surgicalHistory:val("surgery"),medications:val("meds"),allergies:val("allergies"),familyHistory:val("family"),personalHistory:val("personal"),examination:val("exam"),diagnosis:val("diagnosis"),treatmentPlan:val("treatment"),notes:val("notes")}};try{await api(record?`/patients/${record.id}`:"/patients",{method:record?"PUT":"POST",body:JSON.stringify(body)});await loadPatients();toast(record?"Patient updated securely":"Patient created securely");state.page="patients";render()}catch(e){toast(e.message)}}}
async function openPatient(id){try{const r=await api("/patients/"+id);const p=r.data.personal,m=r.data.medical;$("page").innerHTML=`<div class="animate-up"><div class="topbar"><div><span class="eyebrow">DECRYPTED RECORD</span><div class="title">${escapeHtml(p.fullName)}</div><p class="subtitle">Case #${r.id.slice(-8).toUpperCase()} · Updated ${new Date(r.updatedAt).toLocaleString()}</p></div><div class="actions"><button class="btn" id="edit">Edit</button>${state.user.role==="admin"?'<button class="btn danger" id="delete">Delete</button>':""}<button class="btn" onclick="state.page='patients';render()">Back</button></div></div><div class="grid3"><div class="card"><span class="metric-label">PHONE</span><div style="margin-top:9px">${escapeHtml(p.phone)||"—"}</div></div><div class="card"><span class="metric-label">DATE OF BIRTH</span><div style="margin-top:9px">${escapeHtml(p.dateOfBirth)||"—"}</div></div><div class="card"><span class="metric-label">GENDER</span><div style="margin-top:9px">${escapeHtml(p.gender)||"—"}</div></div></div><div class="card" style="margin-top:16px"><div class="section-title">Personal information</div><div class="form-grid">${detail("Email",p.email)}${detail("Emergency contact",p.emergencyContact)}${detail("Address",p.address)}</div></div><div class="card" style="margin-top:16px"><div class="section-title">Clinical history</div><div class="form-grid">${detail("Chief complaint",m.chiefComplaint)}${detail("History of present illness",m.historyPresentIllness)}${detail("Past medical history",m.pastMedicalHistory)}${detail("Surgical history",m.surgicalHistory)}${detail("Medications",m.medications)}${detail("Allergies",m.allergies)}${detail("Family history",m.familyHistory)}${detail("Personal history",m.personalHistory)}${detail("Examination",m.examination)}${detail("Diagnosis",m.diagnosis)}${detail("Treatment plan",m.treatmentPlan)}${detail("Additional notes",m.notes)}</div></div></div>`;$("edit").onclick=()=>formPage(r);if($("delete"))$("delete").onclick=async()=>{if(confirm("Permanently delete this record?")){try{await api("/patients/"+r.id,{method:"DELETE"});await loadPatients();toast("Record deleted");state.page="patients";render()}catch(e){toast(e.message)}}}}catch(e){toast(e.message)}}
function detail(k,v){return `<div class="full-col"><label>${escapeHtml(k).toUpperCase()}</label><div class="detail">${escapeHtml(v)||"—"}</div></div>`}
async function auditPage(){try{const r=await api("/audit");$("page").innerHTML=`<div class="animate-up"><div class="topbar"><div><span class="eyebrow">SECURITY TRAIL</span><div class="title">Audit Log</div><p class="subtitle">Administrator-only activity history.</p></div></div><div class="card table-wrap"><table class="table"><thead><tr><th>TIME</th><th>ACTOR</th><th>ACTION</th><th>PATIENT</th></tr></thead><tbody>${r.logs.map(x=>`<tr><td>${new Date(x.timestamp).toLocaleString()}</td><td>${escapeHtml(x.actor?.name||"Unknown")}</td><td><span class="badge">${escapeHtml(x.action)}</span></td><td>${x.patientId?"#"+x.patientId._id.slice(-8).toUpperCase():"—"}</td></tr>`).join("")}</tbody></table></div></div>`}catch(e){toast(e.message)}}
start();

document.addEventListener("click",e=>{
  if(e.target&&e.target.id==="refreshCaptcha"){newLoginCaptcha();$("loginCaptcha").value=""}
  if(e.target&&e.target.id==="forgotPassword"){
    toast("For security, password reset is handled by the hospital administrator. Contact your hospital admin.");
  }
});

window.addEventListener("DOMContentLoaded",()=>{
  bindLang();
  newLoginCaptcha();
  start();
});
