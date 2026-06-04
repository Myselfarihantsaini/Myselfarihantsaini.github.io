/* =====================================================================
   kundli-timing-varsha.js  —  drop-in module for the Shambhavaa Kundli page
   Adds three sections beneath the existing chart output:
     1. Timeline (real dates) — Sade Sati phases + Saturn ingresses + upcoming
        Mahadasha / Antardasha change dates.
     2. Event-timing windows — marriage / career / property / children /
        education windows from the relevant significators' dasha periods crossed
        with Jupiter & Saturn transits.
     3. Varshaphal — the annual sidereal solar-return chart, with Muntha and a
        (transparently selected) year-lord, plus a deterministic yearly reading.

   It reuses the page's own astronomy (planetTrop, sunTrop, moonLon, meanNode,
   ayan, dT, toJD, jdToCal, NAK, RASHI, ORDER, drawNorthChart, subPeriodsOf,
   DASHA_STATE, DASHA_YEARS, VIM_ORDER, NATAL_REF …). Load it AFTER the page's
   inline script, i.e. as the last <script> before </body>:

       <script src="kundli-timing-varsha.js"></script>

   Everything is deterministic — a research aid, not a prediction service.
   ===================================================================== */
(function(){
'use strict';

/* ---- small guards so the file is harmless if dropped on the wrong page ---- */
function need(){return typeof planetTrop==='function'&&typeof DASHA_YEARS!=='undefined'&&typeof RASHI!=='undefined';}

var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var SIGN_LORD=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
var pad=function(n){return String(n).padStart(2,'0');};
function nowJD(){return Date.now()/86400000+2440587.5;}
function houseFrom(sign,ref){return ((sign-ref+12)%12)+1;}
function ord(n){var s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);}

/* ---- astronomy on top of the page's functions ---- */
function sidLonAt(name,jdUT){
  var jdTT=jdUT+dT(jdToCal(jdUT).y)/86400, A=ayan(jdTT), trop;
  if(name==='Sun')trop=sunTrop(jdTT);
  else if(name==='Moon')trop=moonLon(jdTT);
  else if(name==='Rahu')trop=meanNode(jdTT);
  else if(name==='Ketu')trop=n360(meanNode(jdTT)+180);
  else trop=planetTrop(name,jdTT);
  return n360(trop-A);
}
function signAt(jdUT,name){return Math.floor(sidLonAt(name,jdUT)/30);}
function ascendantSid(jdUT,lat,lon){
  var T=(jdUT-2451545)/36525;
  var gmst=n360(280.46061837+360.98564736629*(jdUT-2451545)+0.000387933*T*T-T*T*T/38710000);
  var lst=n360(gmst+lon), jdTT=jdUT+dT(jdToCal(jdUT).y)/86400, A=ayan(jdTT);
  var eps=(23.439291-0.0130042*T)*Math.PI/180, th=lst*Math.PI/180, ph=lat*Math.PI/180;
  var ascTrop=n360(Math.atan2(Math.cos(th),-(Math.sin(eps)*Math.tan(ph)+Math.cos(eps)*Math.sin(th)))*180/Math.PI);
  return n360(ascTrop-A);
}
function retroAt(name,jdUT){
  if(name==='Sun'||name==='Moon')return false;
  if(name==='Rahu'||name==='Ketu')return true;
  var jdTT=jdUT+dT(jdToCal(jdUT).y)/86400;
  var l1=planetTrop(name,jdTT),l2=planetTrop(name,jdTT+0.6);
  var d=l2-l1;if(d>180)d-=360;if(d<-180)d+=360;return d<0;
}
/* first time at/after fromJD that `name` enters sign `target` */
function nextIngress(name,target,fromJD,maxYears){
  var step=3,prevJD=fromJD,prevSign=signAt(fromJD,name),end=fromJD+(maxYears||45)*365.25;
  for(var jd=fromJD+step;jd<=end;jd+=step){
    var s=signAt(jd,name);
    if(s!==prevSign&&s===target){
      var a=prevJD,b=jd;
      for(var i=0;i<40;i++){var m=(a+b)/2;(signAt(m,name)===target)?b=m:a=m;}
      return (a+b)/2;
    }
    prevJD=jd;prevSign=s;
  }
  return null;
}
/* sidereal solar return near guessJD (Newton on the Sun's longitude) */
function solarReturnJD(target,guessJD){
  var jd=guessJD;
  for(var i=0;i<40;i++){
    var diff=((sidLonAt('Sun',jd)-target+540)%360)-180;
    if(Math.abs(diff)<1e-6)break;
    jd-=diff/0.98565;
  }
  return jd;
}

/* ---- dasha periods rebuilt from the page's DASHA_STATE ---- */
function ydays(){var s=document.getElementById('ylen');return s?(parseFloat(s.value)||365.25):(typeof DASHA_YEAR_DAYS!=='undefined'?DASHA_YEAR_DAYS:365.25);}
function mahaList(){
  var s=DASHA_STATE,yd=ydays();
  var start0=s.jdUT-s.frac*DASHA_YEARS[s.firstLord]*yd, fi=VIM_ORDER.indexOf(s.firstLord), t=start0, out=[];
  for(var i=0;i<9;i++){var sl=VIM_ORDER[(fi+i)%9],d=DASHA_YEARS[sl]*yd;out.push({lord:sl,start:t,end:t+d});t+=d;}
  return out;
}
function antarList(){
  var out=[];
  mahaList().forEach(function(m){
    subPeriodsOf(m.lord,m.start,m.end-m.start).forEach(function(a){
      out.push({maha:m.lord,antar:a.lord,start:a.start,end:a.end});
    });
  });
  return out;
}
function dashaAt(jd){
  var found={maha:null,antar:null};
  var ms=mahaList();
  for(var i=0;i<ms.length;i++)if(jd>=ms[i].start&&jd<ms[i].end){found.maha=ms[i].lord;
    var subs=subPeriodsOf(ms[i].lord,ms[i].start,ms[i].end-ms[i].start);
    for(var j=0;j<subs.length;j++)if(jd>=subs[j].start&&jd<subs[j].end){found.antar=subs[j].lord;break;}
    break;}
  return found;
}

/* ---- date display (birthplace local time) ---- */
function dstr(jd,tz,withTime){var c=jdToCal(jd+(tz||0)/24);var s=c.d+' '+MON[c.m-1]+' '+c.y;if(withTime)s+=', '+pad(c.hh)+':'+pad(c.mm);return s;}

/* ===================================================================== *
 *  Module state, set on each "Generate Kundli"
 * ===================================================================== */
var CTX=null;

function gatherCTX(){
  if(typeof DASHA_STATE==='undefined'||!DASHA_STATE)return null;
  if(typeof NATAL_REF==='undefined'||NATAL_REF.lagnaSign==null)return null;
  var jdUT=DASHA_STATE.jdUT, tz=DASHA_STATE.tz;
  var lat=parseFloat((document.getElementById('lat')||{}).value),
      lon=parseFloat((document.getElementById('lon')||{}).value);
  var dob=(document.getElementById('dob')||{}).value||'';
  var p=dob.split('-').map(Number);
  var natalSign={},natalHouse={};
  ORDER.forEach(function(pn){var s=signAt(jdUT,pn);natalSign[pn]=s;natalHouse[pn]=houseFrom(s,NATAL_REF.lagnaSign);});
  return {
    jdUT:jdUT, tz:tz, lat:lat, lon:lon,
    by:p[0], bm:p[1], bd:p[2],
    name:((document.getElementById('name')||{}).value||'').trim(),
    place:((document.getElementById('place')||{}).value||'').trim(),
    lagnaSign:NATAL_REF.lagnaSign, moonSign:NATAL_REF.moonSign,
    sunSid:sidLonAt('Sun',jdUT),
    natalSign:natalSign, natalHouse:natalHouse
  };
}

/* ===================================================================== *
 *  1.  TIMELINE — Sade Sati + Saturn ingresses + dasha-change dates
 * ===================================================================== */
function sadeSatiCycle(moonSign){
  var P1=(moonSign+11)%12,P2=moonSign,P3=(moonSign+1)%12,EX=(moonSign+2)%12, now=nowJD();
  function build(from){
    var s=nextIngress('Saturn',P1,from,46); if(s==null)return null;
    var p=nextIngress('Saturn',P2,s+10,14);
    var t=nextIngress('Saturn',P3,(p||s)+10,14);
    var e=nextIngress('Saturn',EX,(t||p||s)+10,14);
    return {P1:P1,P2:P2,P3:P3,EX:EX,start:s,peak:p,setting:t,end:e};
  }
  var c=build(now-9*365.25);
  if(c&&c.end!=null&&c.end<now)c=build(now);       // current cycle already over → next one
  return c;
}
function renderTimeline(){
  var box=document.getElementById('kt-timeline-body'); if(!box||!CTX)return;
  var tz=CTX.tz, now=nowJD(), moonSign=CTX.moonSign;
  var satSign=signAt(now,'Saturn'), satHouse=houseFrom(satSign,moonSign);

  /* current Saturn status from the natal Moon */
  var status,cls;
  if(satHouse===12||satHouse===1||satHouse===2){
    var ph=satHouse===12?'rising (first) phase':satHouse===1?'peak (second) phase':'setting (third) phase';
    status='Sade Sati is <b>active</b> — Saturn is in the '+ord(satHouse)+' from the natal Moon, the '+ph+'.';cls='warn';
  }else if(satHouse===4||satHouse===8){
    status='A Dhaiya (small panoti) is <b>active</b> — Saturn is in the '+ord(satHouse)+' from the natal Moon.';cls='warn';
  }else{
    status='Saturn is in the '+ord(satHouse)+' from the natal Moon — <b>outside</b> Sade Sati and the 4th/8th Dhaiya.';cls='ok';
  }

  var cyc=sadeSatiCycle(moonSign);
  var phaseTbl='';
  if(cyc&&cyc.start!=null){
    var rows=[
      ['1st — rising',cyc.P1,cyc.start,cyc.peak],
      ['2nd — peak',cyc.P2,cyc.peak,cyc.setting],
      ['3rd — setting',cyc.P3,cyc.setting,cyc.end]
    ];
    var upcoming=cyc.start>now;
    phaseTbl='<div class="kt-sub">'+(upcoming?'The next':'The current / most recent')+
      ' Sade Sati passage (Saturn across the 12th \u2192 1st \u2192 2nd from the natal Moon):</div>'+
      '<div class="tablewrap"><table class="kt-tab"><thead><tr><th>Phase</th><th>Saturn in</th><th>From</th><th>To</th></tr></thead><tbody>';
    rows.forEach(function(r){
      var active=r[2]!=null&&r[3]!=null&&now>=r[2]&&now<r[3];
      phaseTbl+='<tr'+(active?' class="kt-active"':'')+'><td>'+r[0]+(active?' \u2605':'')+'</td><td>'+RASHI[r[1]]+
        '</td><td>'+(r[2]?dstr(r[2],tz):'\u2014')+'</td><td>'+(r[3]?dstr(r[3],tz):'\u2014')+'</td></tr>';
    });
    phaseTbl+='</tbody></table></div>';
  }

  /* next Saturn sign ingresses (general movement) */
  var ing='',f=now;
  for(var i=0;i<4;i++){
    var cur=signAt(f,'Saturn'),nxt=(cur+1)%12,g=nextIngress('Saturn',nxt,f,6);
    if(g==null)break;
    ing+='<span class="kt-chip">'+RASHI_SHORT[nxt]+' \u00b7 '+dstr(g,tz)+'</span>';
    f=g+30;
  }

  /* upcoming Mahadasha / Antardasha change dates */
  var antars=antarList().filter(function(a){return a.end>now;}).slice(0,9);
  var dRows='';
  antars.forEach(function(a){
    var begun=a.start<=now;
    var isMahaStart=(function(){var ms=mahaList();for(var k=0;k<ms.length;k++)if(Math.abs(ms[k].start-a.start)<0.5)return true;return false;})();
    dRows+='<tr'+(begun?' class="kt-active"':'')+'><td>'+dstr(a.start,tz)+'</td>'+
      '<td>'+a.maha+' '+(isMahaStart?'<span class="kt-tag good">Mahadasha begins</span>':'')+'</td>'+
      '<td>'+a.antar+'</td><td>'+(begun?'<span class="kt-now">running</span>':dstr(a.end,tz))+'</td></tr>';
  });
  var nextMaha=mahaList().filter(function(m){return m.start>now;})[0];
  var mahaLine=nextMaha?('Next Mahadasha change: <b>'+nextMaha.lord+'</b> begins '+dstr(nextMaha.start,tz)+'.'):'';

  box.innerHTML=
    '<div class="kt-status kt-'+cls+'">'+status+'</div>'+
    phaseTbl+
    '<div class="kt-h">Saturn\u2019s next sign changes</div><div class="kt-chips">'+ (ing||'\u2014') +'</div>'+
    '<div class="kt-h">Upcoming dasha changes</div>'+
    (mahaLine?'<div class="kt-sub">'+mahaLine+'</div>':'')+
    '<div class="tablewrap"><table class="kt-tab"><thead><tr><th>Begins</th><th>Mahadasha</th><th>Antardasha</th><th>Ends</th></tr></thead><tbody>'+dRows+'</tbody></table></div>'+
    '<div class="kt-note">Dates use whole-sign sidereal positions and the dasha-year length chosen above. Saturn retrogrades near a sign boundary, so an ingress can wobble by a few weeks across the actual crossing; the date shown is the first entry.</div>';
}

/* ===================================================================== *
 *  2.  EVENT-TIMING WINDOWS
 * ===================================================================== */
/* houses = the topic's bhavas (used for significators AND for the Jupiter
   "activation over the bhava from the Lagna" check). Transit *favourability*
   is judged from the Moon by classical gochar (see renderWindows), not from
   these houses — keeping it consistent with the Present-Transit section. */
var TOPIC_SIG={
  marriage :{label:'Marriage',  houses:[7,2,11], karakas:['Venus','Jupiter']},
  career   :{label:'Career',    houses:[10,6,11],karakas:['Sun','Saturn','Mercury']},
  property :{label:'Property / vehicles', houses:[4,11], karakas:['Mars','Venus','Saturn']},
  children :{label:'Children',  houses:[5,2,11], karakas:['Jupiter']},
  education:{label:'Education', houses:[4,5,9],  karakas:['Mercury','Jupiter']}
};
function significators(topic){
  var T=TOPIC_SIG[topic], set={}, why={};
  T.houses.forEach(function(h){
    var sgn=(CTX.lagnaSign+h-1)%12, lord=SIGN_LORD[sgn];
    set[lord]=1; why[lord]=(why[lord]?why[lord]+', ':'')+'lord of the '+ord(h);
  });
  T.karakas.forEach(function(k){set[k]=1; why[k]=(why[k]?why[k]+', ':'')+'natural significator';});
  ORDER.forEach(function(pn){ if(T.houses.indexOf(CTX.natalHouse[pn])>=0){set[pn]=1; why[pn]=(why[pn]?why[pn]+', ':'')+'placed in the '+ord(CTX.natalHouse[pn]);} });
  return {set:set, why:why, T:T};
}
function renderWindows(){
  var box=document.getElementById('kt-windows-body'); if(!box||!CTX)return;
  var topic=(document.getElementById('kt-topic')||{}).value||'marriage';
  var S=significators(topic), tz=CTX.tz, now=nowJD(), horizon=now+25*365.25;
  var sigNames=Object.keys(S.set);

  var wins=[];
  antarList().forEach(function(a){
    if(a.end<now||a.start>horizon)return;
    var score=0, reasons=[];
    if(S.set[a.maha]){score+=3; reasons.push('<b>'+a.maha+'</b> Mahadasha ('+S.why[a.maha]+')');}
    if(S.set[a.antar]){score+=2; reasons.push('<b>'+a.antar+'</b> Antardasha ('+S.why[a.antar]+')');}
    /* --- transit overlay ---
       Classical gochar reckons Jupiter & Saturn from the natal MOON (as the
       Present-Transit section does). Jupiter is favourable in the 2,5,7,9,11
       from the Moon; Saturn does well in the upachayas 3,6,11 from the Moon.
       Jupiter is sampled across the whole window (it can change sign within it).
       Separately, Jupiter passing the topic's own bhava FROM THE LAGNA activates
       the matter — labelled distinctly so the reference is never ambiguous. */
    var a0=Math.max(a.start,now), pts=[a0,(a0+a.end)/2,a.end];
    var jMoonHit=pts.filter(function(t){return [2,5,7,9,11].indexOf(houseFrom(signAt(t,'Jupiter'),CTX.moonSign))>=0;}).length;
    if(jMoonHit>0){
      var jMid=houseFrom(signAt(pts[1],'Jupiter'),CTX.moonSign);
      score+=(jMoonHit>=2?2:1);
      reasons.push('Jupiter in a supportive gochar from the Moon'+([2,5,7,9,11].indexOf(jMid)>=0?' (the '+ord(jMid)+')':'')+(jMoonHit<3?' for part of the window':''));
    }
    var sMoon=houseFrom(signAt((a0+a.end)/2,'Saturn'),CTX.moonSign);
    if([3,6,11].indexOf(sMoon)>=0){score+=1; reasons.push('Saturn in the '+ord(sMoon)+' from the Moon (an upachaya — supportive)');}
    var jLag=houseFrom(signAt((a0+a.end)/2,'Jupiter'),CTX.lagnaSign);
    if(S.T.houses.indexOf(jLag)>=0){score+=1; reasons.push('Jupiter transits the '+ord(jLag)+' from the Lagna (activates '+S.T.label.toLowerCase()+')');}
    if(score>=4)wins.push({a:a,score:score,reasons:reasons});
  });
  wins.sort(function(x,y){return x.a.start-y.a.start;});
  wins=wins.slice(0,7);

  var head='<div class="kt-sub">Significators weighed for <b>'+S.T.label.toLowerCase()+'</b>: '+
    sigNames.map(function(p){return '<span class="kt-chip">'+p+'</span>';}).join('')+
    '<br>Windows are Antardasha periods of those significators in the next 25 years, scored higher when Jupiter and Saturn hold a supportive gochar from the natal Moon (and Jupiter passes the relevant bhava from the Lagna) at the same time.</div>';

  if(!wins.length){
    box.innerHTML=head+'<div class="kt-note">No strongly-aligned window falls in the next 25 years for this theme on the dasha+transit criteria used here. That does not preclude the event — it means no period stacks several significators together. Weigh the divisional charts and a consultation.</div>';
    return;
  }
  var rows=wins.map(function(w){
    var strength=w.score>=7?['Strong','good']:w.score>=5?['Moderate','mid']:['Mild','soft'];
    var from=Math.max(w.a.start,now);
    return '<div class="kt-win"><div class="kt-win-top"><span class="kt-win-date">'+dstr(from,tz)+' \u2013 '+dstr(w.a.end,tz)+'</span>'+
      '<span class="kt-tag '+strength[1]+'">'+strength[0]+'</span></div>'+
      '<div class="kt-win-lords">'+w.a.maha+' / '+w.a.antar+'</div>'+
      '<ul class="kt-why">'+w.reasons.map(function(r){return '<li>'+r+'</li>';}).join('')+'</ul></div>';
  }).join('');
  box.innerHTML=head+rows+
    '<div class="kt-note">A heuristic timing aid, not a forecast of certainty. Classical timing also weighs the Navamsa, the planet\u2019s dignity and the Sade Sati / Dhaiya overlay shown above; treat these as the periods most worth attention.</div>';
}

/* ===================================================================== *
 *  3.  VARSHAPHAL — annual sidereal solar-return chart
 * ===================================================================== */
var MUNTHA_THEME=['',
 'the self, vitality and fresh initiatives — the year turns on personal effort',
 'family, savings, speech and accumulated resources',
 'courage, initiative, siblings and short journeys',
 'home, property, vehicles, the mother and inner contentment',
 'children, creativity, romance, learning and speculation',
 'work and service, health management, debts, rivals and daily routine',
 'marriage, partnerships, travel and public dealings',
 'change and turning-points, shared resources, research — guard the health',
 'fortune, dharma, mentors, long journeys and higher learning',
 'career, status, recognition and responsibility',
 'gains, income, fulfilment of desires and widening networks',
 'expenses, foreign matters, retreat, letting-go and spiritual life'];
var HOUSE_SIG=['','self & body','wealth & family','courage & siblings','home & property',
 'children & creativity','work, health & rivals','partnership & marriage','change & longevity',
 'fortune & dharma','career & status','gains & fulfilment','expenses & withdrawal'];

function currentAge(){return Math.max(1,Math.floor((nowJD()-CTX.jdUT)/365.2564));}

function buildVarshaSelect(){
  var sel=document.getElementById('kt-varsha-age'); if(!sel)return;
  if(sel.dataset.built==='1')return;            // already built — keep the user's selection
  var cur=currentAge(),html='';
  for(var A=1;A<=100;A++){html+='<option value="'+A+'">Year '+A+' \u00b7 age '+A+' (\u2248'+(CTX.by+A)+')</option>';}
  sel.innerHTML=html; sel.dataset.built='1'; sel.value=String(cur);
}
function renderVarshaphal(){
  var box=document.getElementById('kt-varsha-body'); if(!box||!CTX)return;
  if(isNaN(CTX.lat)||isNaN(CTX.lon)){box.innerHTML='<div class="kt-note">The annual chart needs the birth latitude and longitude (choose a place of birth above).</div>';return;}
  buildVarshaSelect();
  var A=parseInt((document.getElementById('kt-varsha-age')||{}).value,10)||currentAge();
  var tz=CTX.tz, lat=CTX.lat, lon=CTX.lon;

  var srJD=solarReturnJD(CTX.sunSid, CTX.jdUT+A*365.2564);
  var vLagnaSid=ascendantSid(srJD,lat,lon), vLagna=Math.floor(vLagnaSid/30);
  var vSign={}, vRetro={};
  ORDER.forEach(function(pn){vSign[pn]=signAt(srJD,pn);vRetro[pn]=retroAt(pn,srJD);});

  /* chart */
  var chartHTML='<svg id="kt-varsha-svg" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="North Indian Varshaphal chart"></svg>';

  /* Muntha */
  var munSign=(CTX.lagnaSign+A)%12, munHouse=houseFrom(munSign,vLagna), munLord=SIGN_LORD[munSign];

  /* Year-lord (Varshesh) — transparent five-office tally */
  var offices=[
    ['Lord of the Varsha Lagna', SIGN_LORD[vLagna]],
    ['Lord of the Muntha', munLord],
    ['Lord of the natal Lagna', SIGN_LORD[CTX.lagnaSign]],
    ['Lord of the Sun\u2019s sign (varsha)', SIGN_LORD[vSign['Sun']]],
    ['Lord of the Moon\u2019s sign (varsha)', SIGN_LORD[vSign['Moon']]]
  ];
  var votes={}; offices.forEach(function(o){votes[o[1]]=(votes[o[1]]||0)+1;});
  var priority=[munLord,SIGN_LORD[vLagna],SIGN_LORD[CTX.lagnaSign]];
  var varshesh=Object.keys(votes).sort(function(p,q){
    if(votes[q]!==votes[p])return votes[q]-votes[p];
    var pi=priority.indexOf(p), qi=priority.indexOf(q);
    pi=pi<0?9:pi; qi=qi<0?9:qi; return pi-qi;
  })[0];
  var vshHouse=houseFrom(vSign[varshesh],vLagna);

  /* planet table */
  var tb='';
  ORDER.forEach(function(pn){
    var s=vSign[pn], h=houseFrom(s,vLagna), ni=nakInfo(sidLonAt(pn,srJD));
    tb+='<tr><td>'+pn+(vRetro[pn]&&pn!=='Rahu'&&pn!=='Ketu'?' <span class="retro">\u211e</span>':'')+'</td><td>'+RASHI[s]+
        '</td><td class="deg">'+dms(sidLonAt(pn,srJD)%30)+'</td><td>'+h+'</td><td>'+ni.name+'</td></tr>';
  });
  tb+='<tr><td>Lagna</td><td>'+RASHI[vLagna]+'</td><td class="deg">'+dms(vLagnaSid%30)+'</td><td>1</td><td>'+nakInfo(vLagnaSid).name+'</td></tr>';

  /* yearly reading (deterministic) */
  var sat=dashaAt(srJD);
  var satH=houseFrom(signAt(srJD,'Saturn'),CTX.moonSign);
  var sade= (satH===12||satH===1||satH===2)?('During this year Saturn sits in the '+ord(satH)+' from the natal Moon — a Sade Sati phase.'):
            ((satH===4||satH===8)?('During this year Saturn is in the '+ord(satH)+'-from-Moon Dhaiya.'):'');
  var reading=
    '<div class="kt-h">This year at a glance</div>'+
    '<ul class="kt-read">'+
    '<li><b>Muntha</b> is in '+RASHI[munSign]+', falling in the <b>'+ord(munHouse)+' house</b> of the annual chart — the year leans toward '+MUNTHA_THEME[munHouse]+'. Its lord is '+munLord+'.</li>'+
    '<li><b>Year-lord (Varshesh): '+varshesh+'</b>, placed in the '+ord(vshHouse)+' of the annual chart — coloring the year with '+HOUSE_SIG[vshHouse]+'.</li>'+
    (sat.maha?'<li>The running birth-dasha through most of this year is <b>'+sat.maha+'</b>'+(sat.antar?' / <b>'+sat.antar+'</b>':'')+'.</li>':'')+
    (sade?'<li>'+sade+'</li>':'')+
    '</ul>';

  box.innerHTML=
    '<div class="kt-sub">Annual chart for year '+A+' (age '+A+'), cast for the moment the Sun returns to its natal sidereal longitude, at the birthplace.<br>'+
    'Solar return: <b>'+dstr(srJD,tz,true)+'</b> (birthplace local) \u00b7 Varsha Lagna <b>'+RASHI[vLagna]+'</b>.</div>'+
    '<div class="charts"><figure class="chartblock"><figcaption>Varsha Kundli \u00b7 solar return</figcaption>'+chartHTML+'</figure></div>'+
    '<div class="tablewrap"><table class="kt-tab"><thead><tr><th>Graha</th><th>Sign (Rashi)</th><th>Degree</th><th>House</th><th>Nakshatra</th></tr></thead><tbody>'+tb+'</tbody></table></div>'+
    '<div class="kt-pan">'+
      '<div class="pcard"><div class="pk">Muntha</div><div class="pv">'+RASHI_SHORT[munSign]+'</div><div class="px">'+ord(munHouse)+' house \u00b7 lord '+munLord+'</div></div>'+
      '<div class="pcard"><div class="pk">Year-lord</div><div class="pv">'+varshesh+'</div><div class="px">'+ord(vshHouse)+' house of varsha</div></div>'+
      '<div class="pcard"><div class="pk">Varsha Lagna</div><div class="pv">'+RASHI_SHORT[vLagna]+'</div><div class="px">'+nakInfo(vLagnaSid).name+'</div></div>'+
    '</div>'+
    reading+
    '<details class="kt-det"><summary>How the year-lord was chosen</summary>'+
      '<div class="kt-note">Classical Tajika selects the Varshesh from five office-bearers by Panchavargiya Bala. This shows the five offices and picks the planet holding the most of them (ties broken toward the Muntha lord); it does not compute the full strength tally, so treat it as indicative.</div>'+
      '<table class="kt-tab"><thead><tr><th>Office</th><th>Lord</th></tr></thead><tbody>'+
      offices.map(function(o){return '<tr'+(o[1]===varshesh?' class="kt-active"':'')+'><td>'+o[0]+'</td><td>'+o[1]+(o[1]===varshesh?' \u2605':'')+'</td></tr>';}).join('')+
      '</tbody></table></details>'+
    '<div class="kt-note">Muntha advances one sign per completed year from the natal Ascendant. The chart uses the sidereal solar return, so its date drifts a little later each year against the civil calendar. Varshaphal is read for the year only, alongside the birth chart.</div>';

  /* draw after the svg is in the DOM */
  var svg=document.getElementById('kt-varsha-svg');
  if(svg&&typeof drawNorthChart==='function')drawNorthChart(svg,vLagna,vSign);
}

/* ===================================================================== *
 *  Styling + section injection
 * ===================================================================== */
function injectStyle(){
  if(document.getElementById('kt-style'))return;
  var css=
  '.kt-sec{margin-top:26px;border-top:1px solid var(--line);padding-top:18px}'+
  '.kt-sec h3{font-family:var(--serif);font-size:24px;color:var(--gold-soft);text-align:center;font-weight:600}'+
  '.kt-sub{text-align:center;color:var(--muted);font-size:12.5px;margin:5px auto 14px;max-width:64ch;line-height:1.6}'+
  '.kt-h{font-family:var(--sans);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);font-weight:500;margin:18px 0 8px;border-bottom:1px solid rgba(255,255,255,.06);padding-bottom:5px}'+
  '.kt-status{font-size:13.5px;text-align:center;border-radius:11px;padding:11px 14px;margin-bottom:6px;line-height:1.5;border:1px solid var(--line);background:rgba(0,0,0,.18)}'+
  '.kt-status b{color:var(--gold-soft)} .kt-warn{box-shadow:inset 3px 0 0 #e0a0a0} .kt-ok{box-shadow:inset 3px 0 0 #9fd0a0}'+
  '.kt-tab{width:100%;border-collapse:collapse;font-size:13px;margin-top:4px}'+
  '.kt-tab th,.kt-tab td{text-align:left;padding:8px 9px;border-bottom:1px solid rgba(255,255,255,.06);white-space:nowrap}'+
  '.kt-tab th{color:var(--gold);font-weight:500;font-size:10px;text-transform:uppercase;letter-spacing:.06em}'+
  '.kt-tab tr.kt-active td{background:rgba(212,175,110,.13);color:var(--gold-soft)}'+
  '.kt-now{color:#9fd0a0;font-size:12px} .retro{color:#e0a06a}'+
  '.kt-chips{display:flex;flex-wrap:wrap;gap:6px} .kt-chip{font-size:11.5px;color:var(--ink);background:rgba(212,175,110,.12);border-radius:20px;padding:2px 10px;white-space:nowrap}'+
  '.kt-tag{font-size:10px;letter-spacing:.04em;text-transform:uppercase;border-radius:20px;padding:1px 8px;margin-left:6px;white-space:nowrap}'+
  '.kt-tag.good{color:#1a1305;background:var(--gold-soft)} .kt-tag.mid{color:#e7cf9f;border:1px solid var(--line)} .kt-tag.soft{color:var(--muted);border:1px solid var(--line)}'+
  '.kt-note{margin-top:12px;font-size:12px;color:var(--muted);line-height:1.6;border-top:1px solid rgba(255,255,255,.06);padding-top:10px}'+
  '.kt-win{border:1px solid var(--line);border-radius:11px;padding:11px 13px;margin:8px 0;background:rgba(0,0,0,.18)}'+
  '.kt-win-top{display:flex;justify-content:space-between;align-items:baseline;gap:8px}'+
  '.kt-win-date{font-family:var(--serif);font-size:16px;color:var(--gold-soft)} .kt-win-lords{font-size:12px;color:var(--gold);margin-top:2px}'+
  '.kt-why{list-style:none;margin:6px 0 0;padding:0;font-size:12.5px;color:var(--ink)} .kt-why li{padding:2px 0;line-height:1.45} .kt-why b{color:var(--gold-soft)}'+
  '.kt-read{list-style:none;margin:0;padding:0;font-size:13px} .kt-read li{padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05);line-height:1.55} .kt-read li:last-child{border-bottom:none} .kt-read b{color:var(--gold-soft)}'+
  '.kt-pan{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:10px 0 4px}'+
  '@media(max-width:540px){.kt-pan{grid-template-columns:1fr 1fr}}'+
  '.kt-det{margin-top:12px} .kt-det summary{cursor:pointer;color:var(--gold);font-size:12px;letter-spacing:.04em}'+
  '.kt-ctrl{display:flex;justify-content:center;align-items:center;gap:9px;margin-bottom:10px;flex-wrap:wrap}'+
  '.kt-ctrl label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}'+
  '.kt-ctrl select{width:auto;padding:8px 11px;font-size:13px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.09);border-radius:11px;color:var(--ink);font-family:var(--sans)}';
  var st=document.createElement('style');st.id='kt-style';st.textContent=css;document.head.appendChild(st);
}
function injectSections(){
  var result=document.getElementById('result'); if(!result||document.getElementById('kt-timeline'))return;
  var wrap=document.createElement('div');
  wrap.innerHTML=
   '<div class="kt-sec" id="kt-timeline"><h3>Timeline \u2014 Sade Sati &amp; Dasha (real dates)</h3>'+
     '<div id="kt-timeline-body"></div></div>'+
   '<div class="kt-sec" id="kt-windows"><h3>Event-timing Windows</h3>'+
     '<div class="kt-ctrl"><label for="kt-topic">Window for</label>'+
       '<select id="kt-topic"><option value="marriage">Marriage</option><option value="career">Career</option>'+
       '<option value="property">Property / vehicles</option><option value="children">Children</option>'+
       '<option value="education">Education</option></select></div>'+
     '<div id="kt-windows-body"></div></div>'+
   '<div class="kt-sec" id="kt-varsha"><h3>Varshaphal \u2014 Annual Chart</h3>'+
     '<div class="kt-ctrl"><label for="kt-varsha-age">Year of life</label>'+
       '<select id="kt-varsha-age"></select></div>'+
     '<div id="kt-varsha-body"></div></div>';
  var note=result.querySelector('.note');
  while(wrap.firstChild){ note?result.insertBefore(wrap.firstChild,note):result.appendChild(wrap.firstChild); }

  var t=document.getElementById('kt-topic'); if(t)t.addEventListener('change',renderWindows);
  var v=document.getElementById('kt-varsha-age'); if(v)v.addEventListener('change',renderVarshaphal);
  var yl=document.getElementById('ylen'); if(yl)yl.addEventListener('change',function(){if(CTX){renderTimeline();renderWindows();}});
}

/* ---- run after the page's own calc handler ---- */
function onCalc(){
  if(!need())return;
  setTimeout(function(){
    CTX=gatherCTX(); if(!CTX)return;
    injectStyle(); injectSections();
    var sel=document.getElementById('kt-varsha-age'); if(sel)sel.dataset.built='';  // rebuild age list per chart
    try{renderTimeline();}catch(e){console.warn('timeline',e);}
    try{renderWindows();}catch(e){console.warn('windows',e);}
    try{renderVarshaphal();}catch(e){console.warn('varshaphal',e);}
  },0);
}
function init(){
  var btn=document.getElementById('calc');
  if(btn)btn.addEventListener('click',onCalc);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init); else init();

})();
