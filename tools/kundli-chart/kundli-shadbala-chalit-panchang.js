/* =====================================================================
   kundli-shadbala-chalit-panchang.js  — drop-in for the Shambhavaa Kundli page
   Adds three sections: classical Shadbala (six-fold strength), Bhava Chalit
   with Sripati house cusps, and Panchang extras (Rahu Kalam, Gulika, Yamaganda,
   Choghadiya, sunset, moonrise). Load as the last <script> before </body>,
   after the page's inline script:
       <script src="kundli-shadbala-chalit-panchang.js"></script>
   Selectable ayanamsa is NOT here — it must edit the core; see the patch notes.
   Conventions are Parashari/Raman; documented inline and labelled a research aid.
   ===================================================================== */
(function(){
'use strict';
function need(){return typeof planetTrop==='function'&&typeof DASHA_STATE!=='undefined'&&typeof RASHI!=='undefined';}
var D2R=Math.PI/180,R2D=180/Math.PI;
var P7=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
var P9=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
var SIGN_LORD=['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fold180(x){var a=((x%360)+360)%360;return a>180?360-a:a;}
function pad(n){return String(n).padStart(2,'0');}
function epsAt(jd){var T=(jd-2451545)/36525;return (23.439291-0.0130042*T)*D2R;}
function jdTTof(jd){return jd+dT(jdToCal(jd).y)/86400;}
function sidLonAt(name,jd){var t=jdTTof(jd),A=ayan(t),x;if(name==='Sun')x=sunTrop(t);else if(name==='Moon')x=moonLon(t);else if(name==='Rahu')x=meanNode(t);else if(name==='Ketu')x=n360(meanNode(t)+180);else x=planetTrop(name,t);return n360(x-A);}
function tropLonAt(name,jd){var t=jdTTof(jd);if(name==='Sun')return sunTrop(t);if(name==='Moon')return moonLon(t);return planetTrop(name,t);}
function meanLong(name,jd){var T=(jd-2451545)/36525,e0=ELEM[name];return n360(e0[3]+e0[9]*T);}
function moonLatAt(jd){var T=(jdTTof(jd)-2451545)/36525,F=n360(93.272095+483202.0175233*T)*D2R;return 5.128*Math.sin(F);}
function ascMC(jd,lat,lon){var T=(jd-2451545)/36525;var gmst=n360(280.46061837+360.98564736629*(jd-2451545)+0.000387933*T*T-T*T*T/38710000);var lst=n360(gmst+lon),A=ayan(jdTTof(jd)),eps=epsAt(jd),th=lst*D2R,ph=lat*D2R;var asc=n360(Math.atan2(Math.cos(th),-(Math.sin(eps)*Math.tan(ph)+Math.cos(eps)*Math.sin(th)))*R2D);var mc=n360(Math.atan2(Math.sin(th),Math.cos(th)*Math.cos(eps))*R2D);return{asc:n360(asc-A),mc:n360(mc-A)};}
function vargaSign(sign,deg,D){sign=((sign%12)+12)%12;if(deg<0)deg=0;if(deg>=30)deg=29.9999;var part,start,odd=(sign%2===0);switch(D){case 1:return sign;case 2:{var h=Math.floor(deg/15);return odd?(h===0?4:3):(h===0?3:4);}case 3:{part=Math.floor(deg/10);return (sign+4*part)%12;}case 7:{part=Math.floor(deg/(30/7));start=odd?sign:(sign+6)%12;return (start+part)%12;}case 9:{part=Math.floor(deg/(30/9));start=[0,9,6,3][sign%4];return (start+part)%12;}case 12:{part=Math.floor(deg/2.5);return (sign+part)%12;}case 30:{if(odd){if(deg<5)return 0;if(deg<10)return 10;if(deg<18)return 8;if(deg<25)return 2;return 6;}else{if(deg<5)return 1;if(deg<12)return 5;if(deg<20)return 11;if(deg<25)return 9;return 7;}}default:return sign;}}

/* ---- rise/set (reuse page sunAltDeg; add sunset + moonrise) ---- */
function sunAlt(jd,lat,lon){return (typeof sunAltDeg==='function')?sunAltDeg(jd,lat,lon):_sunAlt(jd,lat,lon);}
function _sunAlt(jd,lat,lon){var T=(jd-2451545)/36525,eps=epsAt(jd),lam=sunTrop(jdTTof(jd))*D2R;var dec=Math.asin(Math.sin(eps)*Math.sin(lam)),ra=Math.atan2(Math.cos(eps)*Math.sin(lam),Math.cos(lam));var gmst=n360(280.46061837+360.98564736629*(jd-2451545)+0.000387933*T*T-T*T*T/38710000);var H=(n360(gmst+lon)-ra*R2D)*D2R,phi=lat*D2R;return Math.asin(Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.cos(H))*R2D;}
function moonAlt(jd,lat,lon){var T=(jd-2451545)/36525,eps=epsAt(jd),lam=moonLon(jdTTof(jd))*D2R,bet=moonLatAt(jd)*D2R;var dec=Math.asin(Math.sin(bet)*Math.cos(eps)+Math.cos(bet)*Math.sin(eps)*Math.sin(lam));var ra=Math.atan2(Math.sin(lam)*Math.cos(eps)-Math.tan(bet)*Math.sin(eps),Math.cos(lam));var gmst=n360(280.46061837+360.98564736629*(jd-2451545)+0.000387933*T*T-T*T*T/38710000);var H=(n360(gmst+lon)-ra*R2D)*D2R,phi=lat*D2R;return Math.asin(Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.cos(H))*R2D;}
function findCross(fn,jd0,h0,rising,lat,lon){var step=2/1440,prev=fn(jd0,lat,lon)-h0,pj=jd0;for(var t=step;t<=1.0001;t+=step){var jd=jd0+t,cur=fn(jd,lat,lon)-h0;if((rising&&prev<0&&cur>=0)||(!rising&&prev>=0&&cur<0)){var a=pj,b=jd;for(var i=0;i<40;i++){var m=(a+b)/2,v=fn(m,lat,lon)-h0;if(rising?(v<0):(v>=0))a=m;else b=m;}return (a+b)/2;}prev=cur;pj=jd;}return null;}
function riseSet(y,mo,da,lat,lon,tz,kind){var jd0=toJD(y,mo,da,-tz);if(kind==='sunrise')return findCross(sunAlt,jd0,-0.833,true,lat,lon);if(kind==='sunset')return findCross(sunAlt,jd0,-0.833,false,lat,lon);if(kind==='moonrise')return findCross(moonAlt,jd0,0.125,true,lat,lon);}
function hm(jd,tz){if(jd==null)return'\u2014';var c=jdToCal(jd+tz/24);return pad(c.hh)+':'+pad(c.mm);}
function civWd(y,m,d){if(typeof civilWeekday==='function')return civilWeekday(y,m,d);var a=Math.floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3;var jdn=d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;return (jdn+1)%7;}

var CTX=null;
function gatherCTX(){
  if(typeof DASHA_STATE==='undefined'||!DASHA_STATE)return null;
  var jd=DASHA_STATE.jdUT,tz=DASHA_STATE.tz;
  var lat=parseFloat((document.getElementById('lat')||{}).value),lon=parseFloat((document.getElementById('lon')||{}).value);
  if(isNaN(lat)||isNaN(lon))return null;
  var dob=((document.getElementById('dob')||{}).value||'').split('-').map(Number);
  var sid={},trop={},d1={};
  P9.forEach(function(p){sid[p]=sidLonAt(p,jd);d1[p]=Math.floor(sid[p]/30);});
  P7.forEach(function(p){trop[p]=tropLonAt(p,jd);});
  var am=ascMC(jd,lat,lon),lagnaSign=Math.floor(am.asc/30);
  return {jd:jd,tz:tz,lat:lat,lon:lon,by:dob[0],bm:dob[1],bd:dob[2],
    sid:sid,trop:trop,d1:d1,asc:am.asc,mc:am.mc,lagnaSign:lagnaSign,
    elong:fold180(trop['Moon']-trop['Sun'])};
}

/* ===================== SHADBALA ===================== */
var EXALT={Sun:10,Moon:33,Mars:298,Mercury:165,Jupiter:95,Venus:357,Saturn:200};
var MT={Sun:4,Moon:1,Mars:0,Mercury:5,Jupiter:8,Venus:6,Saturn:10};
var OWN={Sun:[4],Moon:[3],Mars:[0,7],Mercury:[2,5],Jupiter:[8,11],Venus:[1,6],Saturn:[9,10]};
var NAT={Sun:{F:['Moon','Mars','Jupiter'],E:['Venus','Saturn']},Moon:{F:['Sun','Mercury'],E:[]},Mars:{F:['Sun','Moon','Jupiter'],E:['Mercury']},Mercury:{F:['Sun','Venus'],E:['Moon']},Jupiter:{F:['Sun','Moon','Mars'],E:['Mercury','Venus']},Venus:{F:['Mercury','Saturn'],E:['Sun','Moon']},Saturn:{F:['Mercury','Venus'],E:['Sun','Moon','Mars']}};
var NAIS={Sun:60,Moon:51.43,Mars:17.14,Mercury:25.71,Jupiter:34.29,Venus:42.86,Saturn:8.57};
var REQ={Sun:5,Moon:6,Mars:5,Mercury:7,Jupiter:6.5,Venus:5.5,Saturn:5};
var VARGAS=[1,2,3,7,9,12,30],RELSCORE={OWN:30,AF:22.5,F:15,N:7.5,E:3.75,AE:1.875};
var VARA_LORD=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
var SEQ=['Sun','Venus','Mercury','Moon','Saturn','Jupiter','Mars'];

function shadbala(){
  var C=CTX,sid=C.sid,trop=C.trop,d1=C.d1,lag=C.lagnaSign;
  var natRel=function(p,q){return NAT[p].F.indexOf(q)>=0?'F':NAT[p].E.indexOf(q)>=0?'E':'N';};
  var tempRel=function(p,q){return [2,3,4,10,11,12].indexOf(((d1[q]-d1[p]+12)%12)+1)>=0?'F':'E';};
  var compound=function(p,q){if(p===q)return'OWN';var nr=natRel(p,q),tr=tempRel(p,q);if(nr==='F')return tr==='F'?'AF':'N';if(nr==='E')return tr==='F'?'N':'AE';return tr==='F'?'F':'E';};
  var sapta=function(p){var s=0;VARGAS.forEach(function(D){var vs=vargaSign(d1[p],sid[p]%30,D);if(vs===MT[p]){s+=45;return;}if(OWN[p].indexOf(vs)>=0){s+=30;return;}s+=RELSCORE[compound(p,SIGN_LORD[vs])];});return s;};
  var uchcha=function(p){return fold180(sid[p]-n360(EXALT[p]+180))/3;};
  var ojha=function(p){var b=0,ev=(p==='Moon'||p==='Venus');[d1[p],vargaSign(d1[p],sid[p]%30,9)].forEach(function(s){if(ev===(s%2===1))b+=15;});return b;};
  var kendradi=function(p){var h=((d1[p]-lag+12)%12)+1;return [1,4,7,10].indexOf(h)>=0?60:[2,5,8,11].indexOf(h)>=0?30:15;};
  var drek=function(p){var deg=sid[p]%30,dk=deg<10?0:deg<20?1:2;if(dk===0&&['Sun','Jupiter','Mars'].indexOf(p)>=0)return 15;if(dk===1&&['Mercury','Saturn'].indexOf(p)>=0)return 15;if(dk===2&&['Moon','Venus'].indexOf(p)>=0)return 15;return 0;};
  var cusps=sripati(C.asc,C.mc);
  var digbala=function(p){var w;if(p==='Sun'||p==='Mars')w=cusps.m[3];else if(p==='Moon'||p==='Venus')w=cusps.m[9];else if(p==='Jupiter'||p==='Mercury')w=cusps.m[6];else w=cusps.m[0];return fold180(sid[p]-w)/3;};
  /* rise/set for the birth day */
  var sr=riseSet(C.by,C.bm,C.bd,C.lat,C.lon,C.tz,'sunrise'),ss=riseSet(C.by,C.bm,C.bd,C.lat,C.lon,C.tz,'sunset');
  var nx=C.bd+1,sr2=riseSet(C.by,C.bm,nx,C.lat,C.lon,C.tz,'sunrise');
  if(sr2==null)sr2=sr+1;
  var lsh=(C.jd-(sr!=null?sr:C.jd))*24; // approx hours after sunrise (for local solar)
  var localSolar=12+(C.lon-C.tz*15)/15; // birth clock unknown here; use solar-noon offset on the clock time
  /* reconstruct clock hour from jd */
  var bc=jdToCal(C.jd+C.tz/24);var clockH=bc.hh+bc.mm/60;
  localSolar=clockH+(C.lon-C.tz*15)/15;
  var nathonnata=function(p){var n=Math.abs(localSolar-12),dp=(12-n)/12;if(p==='Mercury')return 60;return ['Sun','Jupiter','Venus'].indexOf(p)>=0?60*dp:60*(1-dp);};
  var paksha=function(p){var b=['Moon','Mercury','Jupiter','Venus'].indexOf(p)>=0?C.elong/3:(180-C.elong)/3;if(p==='Moon')b*=2;return b;};
  var tribhaga=function(p){var lord,inDay=(sr!=null&&ss!=null&&C.jd>=sr&&C.jd<ss);if(inDay){var seg=Math.min(2,Math.floor((C.jd-sr)/((ss-sr)/3)));lord=['Mercury','Sun','Saturn'][seg];}else{var a=(ss!=null&&C.jd>=ss)?ss:(ss-(sr2-ss)),len=(sr2-ss)/3,seg2=Math.min(2,Math.max(0,Math.floor((C.jd-a)/len)));lord=['Moon','Venus','Mars'][seg2];}return p==='Jupiter'?60:(p===lord?60:0);};
  /* year/month lords via Sun ingress */
  var sunIngBefore=function(t){var jd=C.jd;for(var i=0;i<60;i++){var diff=((sidLonAt('Sun',jd)-t+540)%360)-180;jd-=diff/0.98565;if(Math.abs(diff)<1e-5)break;}while(jd>C.jd)jd-=365.2564;return jd;};
  var wdLord=function(jd){var c=jdToCal(jd+C.tz/24);return VARA_LORD[civWd(c.y,c.m,c.d)];};
  var wd=civWd(C.by,C.bm,C.bd);
  var abdaLord=wdLord(sunIngBefore(0)),masaLord=wdLord(sunIngBefore(d1['Sun']*30)),varaLord=VARA_LORD[wd];
  var horaIdx=(sr!=null)?Math.max(0,Math.floor((C.jd-sr)/((sr2-sr)/24))):0;
  var horaLord=SEQ[(SEQ.indexOf(varaLord)+horaIdx)%7];
  var kalaLord=function(p){var b=0;if(p===abdaLord)b+=15;if(p===masaLord)b+=30;if(p===varaLord)b+=45;if(p===horaLord)b+=60;return b;};
  var ayanaBala=function(p){var eps=epsAt(C.jd),dec=Math.asin(Math.sin(eps)*Math.sin(trop[p]*D2R))*R2D,north=['Sun','Mars','Jupiter','Venus','Mercury'].indexOf(p)>=0?1:-1,e=eps*R2D;return Math.max(0,Math.min(60,((e+north*dec)/(2*e))*60));};
  var kala=function(p){return nathonnata(p)+paksha(p)+tribhaga(p)+kalaLord(p)+ayanaBala(p);};
  var cheshta=function(p){if(p==='Sun')return ayanaBala('Sun');if(p==='Moon')return paksha('Moon');var jt=jdTTof(C.jd);return fold180(meanLong(p,jt)-(meanLong('Earth',jt)+180))/3;};
  var benefic=function(p){return ['Jupiter','Venus','Mercury'].indexOf(p)>=0?true:(p==='Moon'?C.elong>90:false);};
  var drik=function(t){var sum=0;P7.forEach(function(A){if(A===t)return;var h=((d1[t]-d1[A]+12)%12)+1,f=h===7?1:(h===4||h===8)?0.75:(h===5||h===9)?0.5:(h===3||h===10)?0.25:0;if(A==='Mars'&&(h===4||h===8))f=1;if(A==='Jupiter'&&(h===5||h===9))f=1;if(A==='Saturn'&&(h===3||h===10))f=1;sum+=f*60*(benefic(A)?1:-1);});return sum/4;};
  var rows=P7.map(function(p){var st=uchcha(p)+sapta(p)+ojha(p)+kendradi(p)+drek(p),dg=digbala(p),kl=kala(p),ch=cheshta(p),na=NAIS[p],dr=drik(p),T=st+dg+kl+ch+na+dr;
    return {p:p,st:st,dg:dg,kl:kl,ch:ch,na:na,dr:dr,T:T,rupa:T/60,req:REQ[p],ratio:(T/60)/REQ[p]};});
  return {rows:rows,lords:{abda:abdaLord,masa:masaLord,vara:varaLord,hora:horaLord},cusps:cusps};
}
function renderShadbala(){
  var box=document.getElementById('kt2-sb-body');if(!box||!CTX)return;
  var R=shadbala();
  var ranked=R.rows.slice().sort(function(a,b){return b.T-a.T;});
  var rk={};ranked.forEach(function(r,i){rk[r.p]=i+1;});
  var f1=function(x){return x.toFixed(1);};
  var rowsH=R.rows.map(function(r){
    var rc=r.ratio>=1?'g':r.ratio>=0.8?'m':'w';
    return '<tr><td>'+r.p+'</td><td>'+f1(r.st)+'</td><td>'+f1(r.dg)+'</td><td>'+f1(r.kl)+'</td><td>'+f1(r.ch)+'</td><td>'+f1(r.na)+'</td><td>'+f1(r.dr)+'</td>'+
      '<td><b>'+f1(r.T)+'</b></td><td>'+r.rupa.toFixed(2)+'</td><td>'+r.req+'</td><td class="kt2-'+rc+'">'+r.ratio.toFixed(2)+'</td><td>'+rk[r.p]+'</td></tr>';
  }).join('');
  box.innerHTML=
    '<div class="kt2-sub">The classical six-fold strength (in virupas; 60 virupas = 1 rupa). Sthana = positional (uchcha, saptavargaja, ojha-yugma, kendradi, drekkana); Dig = directional; Kala = temporal (nathonnata, paksha, tribhaga, year/month/day/hora lords, ayana); Cheshta = motional; Naisargika = natural; Drik = aspectual. Ratio = total \u00f7 the classical required minimum.</div>'+
    '<div class="tablewrap"><table class="kt2-tab"><thead><tr><th>Graha</th><th>Sthana</th><th>Dig</th><th>Kala</th><th>Cheshta</th><th>Naisarg</th><th>Drik</th><th>Total</th><th>Rupa</th><th>Req</th><th>Ratio</th><th>Rank</th></tr></thead><tbody>'+rowsH+'</tbody></table></div>'+
    '<div class="kt2-sub">Year-lord <b>'+R.lords.abda+'</b> \u00b7 month-lord <b>'+R.lords.masa+'</b> \u00b7 day-lord <b>'+R.lords.vara+'</b> \u00b7 hora-lord <b>'+R.lords.hora+'</b> (feed the Kala Bala).</div>'+
    '<div class="kt2-note">Drik Bala uses house-based (Parashari) aspect strengths rather than the degree-wise sphuta-drishti curve, and the year/month lords use the sidereal Sun ingress; sources differ slightly on Cheshta and Drik. Treat the totals and ranking as indicative of relative strength.</div>';
}

/* ===================== BHAVA CHALIT (Sripati) ===================== */
function sripati(asc,mc){var m=new Array(12);m[0]=asc;m[9]=mc;m[6]=n360(asc+180);m[3]=n360(mc+180);
  var tri=function(a,b){var d=n360(b-a);return[n360(a+d/3),n360(a+2*d/3)];};var s;
  s=tri(m[0],m[3]);m[1]=s[0];m[2]=s[1];s=tri(m[3],m[6]);m[4]=s[0];m[5]=s[1];
  s=tri(m[6],m[9]);m[7]=s[0];m[8]=s[1];s=tri(m[9],m[0]);m[10]=s[0];m[11]=s[1];
  var sa=new Array(12);for(var h=0;h<12;h++){var prev=m[(h+11)%12],d=n360(m[h]-prev);sa[h]=n360(prev+d/2);}
  return{m:m,sa:sa};}
function chalitHouse(ls,c){for(var h=0;h<12;h++){var a=c.sa[h],b=c.sa[(h+1)%12],d=n360(b-a),x=n360(ls-a);if(d===0||x<d)return h+1;}return 12;}
function drawChalit(svg,cusps){
  if(typeof HC==='undefined'){svg.innerHTML='';return;}
  var house=[];for(var h=1;h<=12;h++)house[h]=[];
  P9.forEach(function(p){var ch=chalitHouse(CTX.sid[p],cusps);house[ch].push(PL_ABBR[p]);});
  var g='<rect x="1" y="1" width="298" height="298" rx="6" class="frame"/>'+
    '<line x1="1" y1="1" x2="299" y2="299" class="chartline"/><line x1="299" y1="1" x2="1" y2="299" class="chartline"/>'+
    '<polygon points="150,1 299,150 150,299 1,150" class="chartline"/>';
  for(var hh=1;hh<=12;hh++){var sgn=Math.floor(cusps.m[hh-1]/30),c=HC[hh];
    g+='<text x="'+c[0]+'" y="'+c[1]+'" text-anchor="middle" class="signnum">'+(sgn+1)+'</text>';
    var pls=house[hh].slice();if(hh===1)pls.unshift('La');
    for(var i=0;i<pls.length;i+=3){g+='<text x="'+c[0]+'" y="'+(c[1]+15+(i/3)*14)+'" text-anchor="middle" class="'+(hh===1&&i===0?'lagna':'planet')+'">'+pls.slice(i,i+3).join('  ')+'</text>';}}
  svg.innerHTML=g;
}
function dmsShort(x){var d=Math.floor(x),m=Math.round((x-d)*60);if(m===60){m=0;d++;}return d+'\u00b0'+pad(m)+"'";}
function renderChalit(){
  var box=document.getElementById('kt2-ch-body');if(!box||!CTX)return;
  var cusps=sripati(CTX.asc,CTX.mc);
  var shift=0;
  var rows=P9.map(function(p){var ls=CTX.sid[p],ws=((Math.floor(ls/30)-CTX.lagnaSign+12)%12)+1,ch=chalitHouse(ls,cusps),sh=ws!==ch;if(sh)shift++;
    return '<tr'+(sh?' class="kt2-shift"':'')+'><td>'+p+'</td><td>'+RASHI_SHORT[Math.floor(ls/30)]+' '+dmsShort(ls%30)+'</td><td>'+ws+'</td><td>'+ch+(sh?' \u2192':'')+'</td></tr>';}).join('');
  var cuspRows='';for(var h=0;h<12;h++){cuspRows+='<tr><td>'+(h+1)+'</td><td>'+RASHI_SHORT[Math.floor(cusps.m[h]/30)]+' '+dmsShort(cusps.m[h]%30)+'</td><td>'+RASHI_SHORT[Math.floor(cusps.sa[h]/30)]+' '+dmsShort(cusps.sa[h]%30)+'</td></tr>';}
  box.innerHTML=
    '<div class="kt2-sub">Sripati (Porphyry) house cusps: the Ascendant and Midheaven anchor the four angles, and the quadrants are trisected in longitude. A planet near a bhava junction (sandhi) can sit in a different house than its whole-sign one.'+(shift?' <b>'+shift+'</b> body'+(shift>1?'ies':'y')+' shift here.':' No body shifts house in this chart.')+'</div>'+
    '<div class="charts"><figure class="chartblock"><figcaption>Bhava Chalit \u00b7 by house cusp</figcaption><svg id="kt2-ch-svg" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bhava Chalit chart"></svg></figure></div>'+
    '<div class="tablewrap"><table class="kt2-tab"><thead><tr><th>Graha</th><th>Longitude</th><th>Whole-sign</th><th>Chalit</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<details class="kt2-det"><summary>House cusps (madhya &amp; sandhi)</summary><div class="tablewrap"><table class="kt2-tab"><thead><tr><th>Bhava</th><th>Madhya (mid)</th><th>Sandhi (start)</th></tr></thead><tbody>'+cuspRows+'</tbody></table></div></details>';
  var svg=document.getElementById('kt2-ch-svg');if(svg)drawChalit(svg,cusps);
}

/* ===================== PANCHANG EXTRAS ===================== */
var CHO=['Udveg','Char','Labh','Amrit','Kaal','Shubh','Rog'];
var CHO_NAT={Udveg:'bad',Char:'neutral',Labh:'good',Amrit:'good',Kaal:'bad',Shubh:'good',Rog:'bad'};
var DAYSTART=[0,3,6,2,5,1,4],NIGHTSTART=[5,1,4,0,3,6,2];
var RAHU=[8,2,7,5,6,4,3],YAMA=[5,4,3,2,1,7,6],GULI=[7,6,5,4,3,2,1];
var WD_EN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
function renderPanchangX(){
  var box=document.getElementById('kt2-px-body');if(!box||!CTX)return;
  var C=CTX,tz=C.tz;
  var sr=riseSet(C.by,C.bm,C.bd,C.lat,C.lon,tz,'sunrise'),ss=riseSet(C.by,C.bm,C.bd,C.lat,C.lon,tz,'sunset');
  var sr2=riseSet(C.by,C.bm,C.bd+1,C.lat,C.lon,tz,'sunrise'),mr=riseSet(C.by,C.bm,C.bd,C.lat,C.lon,tz,'moonrise');
  if(sr==null||ss==null){box.innerHTML='<div class="kt2-note">Sunrise/sunset could not be solved for this latitude and date (polar day or night).</div>';return;}
  var wd=civWd(C.by,C.bm,C.bd),dayLen=ss-sr,dpart=dayLen/8;
  if(sr2==null)sr2=ss+(ss-sr);var nightLen=sr2-ss,npart=nightLen/8;
  var slot=function(i){return hm(sr+(i-1)*dpart,tz)+' \u2013 '+hm(sr+i*dpart,tz);};
  var topcards=
    card('Sunrise',hm(sr,tz),WD_EN[wd])+
    card('Sunset',hm(ss,tz),(dayLen*24).toFixed(1)+' h day')+
    card('Moonrise',mr==null?'\u2014':hm(mr,tz),'approx (\u00b1 a few min)');
  var kalams='<div class="tablewrap"><table class="kt2-tab"><thead><tr><th>Inauspicious kalam</th><th>Window (birthplace local)</th></tr></thead><tbody>'+
    '<tr class="kt2-shift"><td>Rahu Kalam</td><td>'+slot(RAHU[wd])+'</td></tr>'+
    '<tr><td>Yamaganda</td><td>'+slot(YAMA[wd])+'</td></tr>'+
    '<tr><td>Gulika Kalam</td><td>'+slot(GULI[wd])+'</td></tr></tbody></table></div>';
  var ds=DAYSTART[wd],ns=NIGHTSTART[wd],dayCho='',nightCho='';
  for(var k=0;k<8;k++){var nm=CHO[(ds+k)%7],nat=CHO_NAT[nm];dayCho+=choRow(nm,nat,hm(sr+k*dpart,tz),hm(sr+(k+1)*dpart,tz));}
  for(var j=0;j<8;j++){var nm2=CHO[(ns+j)%7],nat2=CHO_NAT[nm2];nightCho+=choRow(nm2,nat2,hm(ss+j*npart,tz),hm(ss+(j+1)*npart,tz));}
  box.innerHTML=
    '<div class="kt2-sub">Day-part muhurtas for the birth day, computed from the actual sunrise/sunset at the birthplace.</div>'+
    '<div class="kt2-pan">'+topcards+'</div>'+kalams+
    '<div class="kt2-h">Choghadiya \u2014 day</div><div class="tablewrap"><table class="kt2-tab"><thead><tr><th>Choghadiya</th><th>Nature</th><th>Window</th></tr></thead><tbody>'+dayCho+'</tbody></table></div>'+
    '<div class="kt2-h">Choghadiya \u2014 night</div><div class="tablewrap"><table class="kt2-tab"><thead><tr><th>Choghadiya</th><th>Nature</th><th>Window</th></tr></thead><tbody>'+nightCho+'</tbody></table></div>'+
    '<div class="kt2-note">Rahu Kalam, Yamaganda and Gulika are the fixed 1/8 day-parts by weekday; Choghadiya cycles the seven lords from the weekday\u2019s start. Moonrise ignores fine lunar latitude terms, so it is approximate.</div>';
}
function card(k,v,x){return '<div class="pcard"><div class="pk">'+k+'</div><div class="pv">'+v+'</div><div class="px">'+(x||'')+'</div></div>';}
function choRow(nm,nat,a,b){var cls=nat==='good'?'kt2-g':nat==='bad'?'kt2-w':'kt2-m';return '<tr><td>'+nm+'</td><td class="'+cls+'">'+nat+'</td><td>'+a+' \u2013 '+b+'</td></tr>';}

/* ===================== injection + hooks ===================== */
function injectStyle(){
  if(document.getElementById('kt2-style'))return;
  var css=
  '.kt2-sec{margin-top:26px;border-top:1px solid var(--line);padding-top:18px}'+
  '.kt2-sec .section-title{margin-bottom:10px}'+
  '.kt2-sub{text-align:center;color:var(--muted);font-size:12.5px;margin:5px auto 12px;max-width:66ch;line-height:1.6}.kt2-sub b{color:var(--gold-soft)}'+
  '.kt2-h{font-family:var(--sans);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);font-weight:500;margin:16px 0 8px;border-bottom:1px solid rgba(255,255,255,.06);padding-bottom:5px}'+
  '.kt2-tab{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:4px}'+
  '.kt2-tab th,.kt2-tab td{text-align:left;padding:7px 8px;border-bottom:1px solid rgba(255,255,255,.06);white-space:nowrap}'+
  '.kt2-tab th{color:var(--gold);font-weight:500;font-size:10px;text-transform:uppercase;letter-spacing:.05em}'+
  '.kt2-tab tr.kt2-shift td{background:rgba(212,175,110,.13)}'+
  '.kt2-g{color:#9fd0a0}.kt2-m{color:var(--gold-soft)}.kt2-w{color:#e0a0a0}'+
  '.kt2-note{margin-top:12px;font-size:12px;color:var(--muted);line-height:1.6;border-top:1px solid rgba(255,255,255,.06);padding-top:10px}'+
  '.kt2-pan{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:8px 0}@media(max-width:540px){.kt2-pan{grid-template-columns:1fr 1fr}}'+
  '.kt2-det{margin-top:12px}.kt2-det summary{cursor:pointer;color:var(--gold);font-size:12px;letter-spacing:.04em}';
  var st=document.createElement('style');st.id='kt2-style';st.textContent=css;document.head.appendChild(st);
}
function injectSections(){
  var result=document.getElementById('result');if(!result||document.getElementById('kt2-sb'))return;
  var wrap=document.createElement('div');
  wrap.innerHTML=
    '<div class="kt2-sec" id="kt2-sb"><div class="section-title">Shadbala \u2014 Six-fold Strength</div><div id="kt2-sb-body"></div></div>'+
    '<div class="kt2-sec" id="kt2-ch"><div class="section-title">Bhava Chalit &amp; House Cusps</div><div id="kt2-ch-body"></div></div>'+
    '<div class="kt2-sec" id="kt2-px"><div class="section-title">Panchang \u2014 Day-part Muhurtas</div><div id="kt2-px-body"></div></div>';
  var note=result.querySelector('.note');
  while(wrap.firstChild){note?result.insertBefore(wrap.firstChild,note):result.appendChild(wrap.firstChild);}
}
function onCalc(){
  if(!need())return;
  setTimeout(function(){
    CTX=gatherCTX();if(!CTX)return;
    injectStyle();injectSections();
    try{renderShadbala();}catch(e){console.warn('shadbala',e);}
    try{renderChalit();}catch(e){console.warn('chalit',e);}
    try{renderPanchangX();}catch(e){console.warn('panchang-x',e);}
  },0);
}
function init(){var b=document.getElementById('calc');if(b)b.addEventListener('click',onCalc);
  var yl=document.getElementById('ylen');if(yl)yl.addEventListener('change',function(){if(CTX)try{renderShadbala();}catch(e){}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
