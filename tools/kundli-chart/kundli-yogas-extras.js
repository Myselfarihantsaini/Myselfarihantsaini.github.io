/* =====================================================================
   kundli-yogas-extras.js  — drop-in: yoga detection + extra muhurtas
   Adds two sections: classical yogas (deterministic, with the standard
   caveats) and additional panchang (Brahma & Abhijit muhurta, planetary-hora
   table). Load as the last <script> before </body>. Research aid.
   ===================================================================== */
(function(){
'use strict';
function need(){return typeof planetTrop==='function'&&typeof DASHA_STATE!=='undefined'&&typeof RASHI!=='undefined';}
var D2R=Math.PI/180,R2D=180/Math.PI;
var P7=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
var SIGN_LORD=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
var EXS={Sun:0,Moon:1,Mars:9,Mercury:5,Jupiter:3,Venus:11,Saturn:6};   // exaltation sign
var DBS={Sun:6,Moon:7,Mars:3,Mercury:11,Jupiter:9,Venus:5,Saturn:0};   // debilitation sign
var OWN={Sun:[4],Moon:[3],Mars:[0,7],Mercury:[2,5],Jupiter:[8,11],Venus:[1,6],Saturn:[9,10]};
var MPN={Mars:'Ruchaka',Mercury:'Bhadra',Jupiter:'Hamsa',Venus:'Malavya',Saturn:'Sasa'};
var VLORD=(typeof VARA_LORD!=='undefined')?VARA_LORD:['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
var SEQ=['Sun','Venus','Mercury','Moon','Saturn','Jupiter','Mars'];
function pad(n){return String(n).padStart(2,'0');}
function jdTTof(jd){return jd+dT(jdToCal(jd).y)/86400;}
function sidLonAt(name,jd){var t=jdTTof(jd),A=ayan(t),x;if(name==='Sun')x=sunTrop(t);else if(name==='Moon')x=moonLon(t);else if(name==='Rahu')x=meanNode(t);else if(name==='Ketu')x=n360(meanNode(t)+180);else x=planetTrop(name,t);return n360(x-A);}

var CTX=null;
function gather(){
  if(!DASHA_STATE)return null;
  var jd=DASHA_STATE.jdUT,tz=DASHA_STATE.tz;
  var lat=parseFloat((document.getElementById('lat')||{}).value),lon=parseFloat((document.getElementById('lon')||{}).value);
  var dob=((document.getElementById('dob')||{}).value||'').split('-').map(Number);
  if(typeof NATAL_REF==='undefined'||NATAL_REF.lagnaSign==null)return null;
  var d1={},hL={},hM={};
  ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'].forEach(function(p){var s=Math.floor(sidLonAt(p,jd)/30);d1[p]=s;hL[p]=((s-NATAL_REF.lagnaSign+12)%12)+1;hM[p]=((s-NATAL_REF.moonSign+12)%12)+1;});
  return {jd:jd,tz:tz,lat:lat,lon:lon,by:dob[0],bm:dob[1],bd:dob[2],lag:NATAL_REF.lagnaSign,moon:NATAL_REF.moonSign,d1:d1,hL:hL,hM:hM};
}

/* ---------------- YOGAS ---------------- */
function detectYogas(){
  var C=CTX,d1=C.d1,hL=C.hL,hM=C.hM,out=[];
  var kendra=function(h){return [1,4,7,10].indexOf(h)>=0;};
  // Pancha Mahapurusha
  ['Mars','Mercury','Jupiter','Venus','Saturn'].forEach(function(p){
    var dignified=(OWN[p].indexOf(d1[p])>=0)||(d1[p]===EXS[p]);
    if(dignified&&kendra(hL[p]))out.push({n:MPN[p]+' Yoga',k:'good',d:p+' is in '+(d1[p]===EXS[p]?'exaltation':'its own sign')+' and in a kendra (house '+hL[p]+') — a Pancha Mahapurusha yoga.'});
  });
  // Gajakesari
  if(kendra(hM['Jupiter']))out.push({n:'Gajakesari Yoga',k:'good',d:'Jupiter is in a kendra (house '+hM['Jupiter']+') from the Moon.'});
  // Budha-Aditya
  if(d1['Sun']===d1['Mercury'])out.push({n:'Budha-Aditya Yoga',k:'good',d:'Sun and Mercury share '+RASHI[d1['Sun']]+' (weigh Mercury\u2019s combustion).'});
  // Chandra-Mangala
  if(d1['Moon']===d1['Mars'])out.push({n:'Chandra-Mangala Yoga',k:'mix',d:'Moon and Mars share '+RASHI[d1['Moon']]+'.'});
  // Kemadruma (simplified)
  var occ2=false,occ12=false;
  P7.forEach(function(p){if(p==='Moon')return;var h=hM[p];if(h===2)occ2=true;if(h===12)occ12=true;});
  if(!occ2&&!occ12)out.push({n:'Kemadruma Yoga',k:'bad',d:'No planet occupies the 2nd or 12th from the Moon (basic form — many classical cancellations apply, e.g. a planet in a kendra from the Moon or the Moon itself well-aspected).'});
  // Neecha-bhanga (flag)
  P7.forEach(function(p){
    if(d1[p]===DBS[p]){
      var disp=SIGN_LORD[d1[p]];
      var canc=kendra(hL[disp])||kendra(hM[disp])||(d1[disp]===EXS[disp]);
      out.push({n:'Debilitation: '+p,k:canc?'mix':'bad',d:p+' is debilitated in '+RASHI[d1[p]]+'. '+(canc?'A basic Neecha-bhanga (cancellation) condition is met (its dispositor '+disp+' is in a kendra or exalted) — strength may be restored.':'No basic cancellation found here.')});
    }
  });
  // Raja-yoga: kendra-lord & trikona-lord conjunction
  var kenLords={},triLords={};
  [1,4,7,10].forEach(function(h){kenLords[SIGN_LORD[(C.lag+h-1)%12]]=h;});
  [1,5,9].forEach(function(h){triLords[SIGN_LORD[(C.lag+h-1)%12]]=h;});
  var rk=[];
  P7.forEach(function(a){P7.forEach(function(b){if(a>=b)return;if(((kenLords[a]&&triLords[b])||(kenLords[b]&&triLords[a]))&&d1[a]===d1[b]){rk.push(a+'+'+b+' in '+RASHI[d1[a]]);}});});
  if(rk.length)out.push({n:'Raja Yoga',k:'good',d:'Kendra- and trikona-lords conjoined: '+rk.join('; ')+'.'});
  // Dhana-yoga: 2nd & 11th lords conjoined
  var l2=SIGN_LORD[(C.lag+1)%12],l11=SIGN_LORD[(C.lag+10)%12];
  if(l2!==l11&&d1[l2]===d1[l11])out.push({n:'Dhana Yoga',k:'good',d:'The 2nd-lord ('+l2+') and 11th-lord ('+l11+') are conjoined in '+RASHI[d1[l2]]+'.'});
  return out;
}
function renderYogas(){
  var box=document.getElementById('ky-y-body');if(!box||!CTX)return;
  var y=detectYogas();
  var body=y.length?y.map(function(o){return '<div class="ky-yoga ky-'+o.k+'"><div class="ky-yn">'+o.n+'</div><div class="ky-yd">'+o.d+'</div></div>';}).join(''):'<div class="ky-note">None of the checked yogas are present on the basic conditions used here.</div>';
  box.innerHTML='<div class="ky-sub">Common classical yogas detected from the Rashi chart. These are flagged on their basic defining conditions; classical practice weighs strength (Shadbala), dignity, aspects and the many traditional cancellations before drawing conclusions.</div>'+body+
    '<div class="ky-note">A yoga present by placement is not automatically a result; an afflicted or weak yoga-forming planet mutes it, and conditional yogas (Kemadruma, debilitation) carry well-known cancellations. Treat this as a checklist, not a verdict.</div>';
}

/* ---------------- EXTRA MUHURTAS ---------------- */
function sunAlt(jd,lat,lon){return sunAltDeg(jd,lat,lon);}
function findSet(y,mo,da,lat,lon,tz){var jd0=toJD(y,mo,da,-tz),step=2/1440,prev=sunAlt(jd0,lat,lon)+0.833,pj=jd0;for(var t=step;t<=1.0001;t+=step){var jd=jd0+t,cur=sunAlt(jd,lat,lon)+0.833;if(prev>=0&&cur<0){var a=pj,b=jd;for(var i=0;i<40;i++){var m=(a+b)/2;(sunAlt(m,lat,lon)+0.833>=0)?a=m:b=m;}return (a+b)/2;}prev=cur;pj=jd;}return null;}
function hm(jd,tz){if(jd==null)return'\u2014';var c=jdToCal(jd+tz/24);return pad(c.hh)+':'+pad(c.mm);}
function civWd(y,m,d){return (typeof civilWeekday==='function')?civilWeekday(y,m,d):0;}
function renderExtras(){
  var box=document.getElementById('ky-m-body');if(!box||!CTX)return;
  var C=CTX,tz=C.tz;
  var sr=(typeof findSunrise==='function')?findSunrise(C.by,C.bm,C.bd,C.lat,C.lon,tz):null;
  var ss=findSet(C.by,C.bm,C.bd,C.lat,C.lon,tz);
  var sr2=(typeof findSunrise==='function')?findSunrise(C.by,C.bm,C.bd+1,C.lat,C.lon,tz):null;
  if(sr==null||ss==null){box.innerHTML='<div class="ky-note">Sunrise/sunset could not be solved for this latitude and date.</div>';return;}
  if(sr2==null)sr2=ss+(ss-sr);
  var dayLen=ss-sr;
  var brahma=[sr-96/1440,sr-48/1440];
  var abhi=[sr+7*(dayLen/15),sr+8*(dayLen/15)];
  var wd=civWd(C.by,C.bm,C.bd),dayLord=VLORD[wd];
  var horaLen=(sr2-sr)/24, start=SEQ.indexOf(dayLord);
  var rows='';
  for(var k=0;k<24;k++){var lord=SEQ[(start+k)%7],a=sr+k*horaLen,b=sr+(k+1)*horaLen;var cur=(C.jd>=a&&C.jd<b);rows+='<tr'+(cur?' class="ky-active"':'')+'><td>'+(k+1)+'</td><td>'+lord+(cur?' \u2605':'')+'</td><td>'+hm(a,tz)+' \u2013 '+hm(b,tz)+'</td></tr>';}
  box.innerHTML=
    '<div class="ky-cards">'+
      '<div class="pcard"><div class="pk">Brahma Muhurta</div><div class="pv">'+hm(brahma[0],tz)+'\u2013'+hm(brahma[1],tz)+'</div><div class="px">pre-dawn, ideal for practice</div></div>'+
      '<div class="pcard"><div class="pk">Abhijit Muhurta</div><div class="pv">'+hm(abhi[0],tz)+'\u2013'+hm(abhi[1],tz)+'</div><div class="px">midday muhurta, broadly auspicious</div></div>'+
    '</div>'+
    '<details class="ky-det"><summary>Planetary hora table (birth day)</summary><div class="tablewrap"><table class="ky-tab"><thead><tr><th>#</th><th>Hora lord</th><th>Window</th></tr></thead><tbody>'+rows+'</tbody></table></div></details>'+
    '<div class="ky-note">Brahma muhurta is the ~48-minute window beginning ~96 minutes before sunrise; Abhijit is the 8th of fifteen day-muhurtas straddling local noon. Horas run from sunrise in the descending-Chaldean order, the day\u2019s first hora ruled by the weekday lord; the birth hora is starred.</div>';
}

/* ---------------- inject + hooks ---------------- */
function injectStyle(){
  if(document.getElementById('ky-style'))return;
  var css=
  '.ky-sec{margin-top:26px;border-top:1px solid var(--line);padding-top:18px}'+
  '.ky-sec .section-title{margin-bottom:10px}'+
  '.ky-sub{text-align:center;color:var(--muted);font-size:12.5px;margin:5px auto 12px;max-width:66ch;line-height:1.6}'+
  '.ky-yoga{border:1px solid var(--line);border-radius:11px;padding:10px 13px;margin:8px 0;background:rgba(0,0,0,.18)}'+
  '.ky-yn{font-family:var(--serif);font-size:17px;color:var(--gold-soft)}.ky-yd{font-size:12.5px;color:var(--ink);margin-top:3px;line-height:1.5}'+
  '.ky-good{box-shadow:inset 3px 0 0 #9fd0a0}.ky-bad{box-shadow:inset 3px 0 0 #e0a0a0}.ky-mix{box-shadow:inset 3px 0 0 var(--gold)}'+
  '.ky-note{margin-top:12px;font-size:12px;color:var(--muted);line-height:1.6;border-top:1px solid rgba(255,255,255,.06);padding-top:10px}'+
  '.ky-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:8px 0}@media(max-width:540px){.ky-cards{grid-template-columns:1fr}}'+
  '.ky-tab{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:4px}'+
  '.ky-tab th,.ky-tab td{text-align:left;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,.06);white-space:nowrap}'+
  '.ky-tab th{color:var(--gold);font-size:10px;text-transform:uppercase}.ky-tab tr.ky-active td{background:rgba(212,175,110,.13);color:var(--gold-soft)}'+
  '.ky-det{margin-top:10px}.ky-det summary{cursor:pointer;color:var(--gold);font-size:12px}';
  var st=document.createElement('style');st.id='ky-style';st.textContent=css;document.head.appendChild(st);
}
function injectSections(){
  var result=document.getElementById('result');if(!result||document.getElementById('ky-y'))return;
  var w=document.createElement('div');
  w.innerHTML='<div class="ky-sec" id="ky-y"><div class="section-title">Yogas</div><div id="ky-y-body"></div></div>'+
    '<div class="ky-sec" id="ky-m"><div class="section-title">More Muhurtas</div><div id="ky-m-body"></div></div>';
  var note=result.querySelector('.note');
  while(w.firstChild){note?result.insertBefore(w.firstChild,note):result.appendChild(w.firstChild);}
}
function onCalc(){if(!need())return;setTimeout(function(){CTX=gather();if(!CTX)return;injectStyle();injectSections();try{renderYogas();}catch(e){console.warn('yogas',e);}try{renderExtras();}catch(e){console.warn('muhurta',e);}},0);}
function init(){var b=document.getElementById('calc');if(b)b.addEventListener('click',onCalc);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
