/* =====================================================================
   kundli-ephemeris-plus.js — precision upgrade for the Kundli page.
   Replaces the older two-body planetary model with the JPL approximate
   Keplerian element set, including Jupiter/Saturn great-inequality terms.
   ===================================================================== */
(function(){
'use strict';
if(typeof n360!=='function'||typeof prec!=='function'){
  if(typeof window.n360!=='function')window.n360=function(x){x%=360;return x<0?x+360:x;};
  if(typeof window.prec!=='function')window.prec=function(T){return 1.396971*T+0.0003086*T*T;};
}
var D2R=Math.PI/180,R2D=180/Math.PI;
var EL={
 Mercury:[0.38709843,0.20563661,7.00559432,252.25166724,77.45771895,48.33961819,0.00000000,0.00002123,-0.00590158,149472.67486623,0.15940013,-0.12214182,0,0,0,0],
 Venus:[0.72332102,0.00676399,3.39777545,181.97970850,131.76755713,76.67261496,-0.00000026,-0.00005107,0.00043494,58517.81560260,0.05679648,-0.27274174,0,0,0,0],
 Earth:[1.00000018,0.01673163,-0.00054346,100.46691572,102.93005885,-5.11260389,-0.00000003,-0.00003661,-0.01337178,35999.37306329,0.31795260,-0.24123856,0,0,0,0],
 Mars:[1.52371243,0.09336511,1.85181869,-4.56813164,-23.91744784,49.71320984,0.00000097,0.00009149,-0.00724757,19140.29934243,0.45223625,-0.26852431,0,0,0,0],
 Jupiter:[5.20248019,0.04853590,1.29861416,34.33479152,14.27495244,100.29282654,-0.00002864,0.00018026,-0.00322699,3034.90371757,0.18199196,0.13024619,-0.00012452,0.06064060,-0.35635438,38.35125000],
 Saturn:[9.54149883,0.05550825,2.49424102,50.07571329,92.86136063,113.63998702,-0.00003065,-0.00032044,0.00451969,1222.11494724,0.54179478,-0.25015002,0.00025899,-0.13434469,0.87320147,38.35125000]
};
function helio(name,T){
  var e0=EL[name];
  var a=e0[0]+e0[6]*T,e=e0[1]+e0[7]*T,I=(e0[2]+e0[8]*T)*D2R,
      L=e0[3]+e0[9]*T,wbar=e0[4]+e0[10]*T,Om=(e0[5]+e0[11]*T)*D2R;
  var w=wbar*D2R-Om;
  var M=L-wbar+e0[12]*T*T+e0[13]*Math.cos(e0[15]*T*D2R)+e0[14]*Math.sin(e0[15]*T*D2R);
  M=((M%360)+360)%360;if(M>180)M-=360;M*=D2R;
  var E=M+e*Math.sin(M);
  for(var i=0;i<10;i++)E=E-(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));
  var xp=a*(Math.cos(E)-e),yp=a*Math.sqrt(1-e*e)*Math.sin(E);
  var cw=Math.cos(w),sw=Math.sin(w),cO=Math.cos(Om),sO=Math.sin(Om),cI=Math.cos(I),sI=Math.sin(I);
  return [(cw*cO-sw*sO*cI)*xp+(-sw*cO-cw*sO*cI)*yp,
          (cw*sO+sw*cO*cI)*xp+(-sw*sO+cw*cO*cI)*yp,
          (sw*sI)*xp+(cw*sI)*yp];
}
function plusPlanetTrop(name,jd){
  var T=(jd-2451545)/36525,p=helio(name,T),e=helio('Earth',T);
  return n360(Math.atan2(p[1]-e[1],p[0]-e[0])*R2D+prec(T));
}
function plusSunTrop(jd){
  var T=(jd-2451545)/36525,e=helio('Earth',T);
  return n360(Math.atan2(e[1],e[0])*R2D+180+prec(T));
}
window.KundliEphemerisPlus={planetTrop:plusPlanetTrop,sunTrop:plusSunTrop};
window.planetTrop=plusPlanetTrop;
window.sunTrop=plusSunTrop;
})();
