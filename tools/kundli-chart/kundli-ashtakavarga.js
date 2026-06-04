/* kundli-ashtakavarga.js - Bhinna & Sarva Ashtakavarga, Shambhavaa.
 * Prastara (raw) Ashtakavarga from standard Parashari benefic-point tables.
 * Each of the 7 planets receives a bindu in houses counted from 8 contributors
 * (the 7 planets + the Lagna). Bhinna totals are fixed: Sun 48, Moon 49, Mars 39,
 * Mercury 54, Jupiter 56, Venus 52, Saturn 39 -> Sarva 337. These invariants are
 * the built-in correctness check. Used here to weigh transits (gochar) the
 * classical way: a planet crossing a sign with more bindus tends to do better.
 * Note: this is raw Ashtakavarga; the Trikona/Ekadhipatya reductions (Shodhya
 * Pinda) are a further refinement not applied here.
 */
(function(){
'use strict';

var PCODE=['SU','MO','MA','ME','JU','VE','SA'];
var CONTRIB=['SU','MO','MA','ME','JU','VE','SA','LG'];
var PNAME={SU:'Sun',MO:'Moon',MA:'Mars',ME:'Mercury',JU:'Jupiter',VE:'Venus',SA:'Saturn',LG:'Lagna'};
var SHORT=['Ari','Tau','Gem','Can','Leo','Vir','Lib','Sco','Sag','Cap','Aqu','Pis'];

/* Benefic places: BEN[planet][contributor] = house numbers (1..12) counted from
 * the contributor's sign, in which `planet` gains one bindu.
 */
var BEN={
 SU:{SU:[1,2,4,7,8,9,10,11],MO:[3,6,10,11],MA:[1,2,4,7,8,9,10,11],ME:[3,5,6,9,10,11,12],JU:[5,6,9,11],VE:[6,7,12],SA:[1,2,4,7,8,9,10,11],LG:[3,4,6,10,11,12]},
 MO:{SU:[3,6,7,8,10,11],MO:[1,3,6,7,10,11],MA:[2,3,5,6,9,10,11],ME:[1,3,4,5,7,8,10,11],JU:[1,4,7,8,10,11,12],VE:[3,4,5,7,9,10,11],SA:[3,5,6,11],LG:[3,6,10,11]},
 MA:{SU:[3,5,6,10,11],MO:[3,6,11],MA:[1,2,4,7,8,10,11],ME:[3,5,6,11],JU:[6,10,11,12],VE:[6,8,11,12],SA:[1,4,7,8,9,10,11],LG:[1,3,6,10,11]},
 ME:{SU:[5,6,9,11,12],MO:[2,4,6,8,10,11],MA:[1,2,4,7,8,9,10,11],ME:[1,3,5,6,9,10,11,12],JU:[6,8,11,12],VE:[1,2,3,4,5,8,9,11],SA:[1,2,4,7,8,9,10,11],LG:[1,2,4,6,8,10,11]},
 JU:{SU:[1,2,3,4,7,8,9,10,11],MO:[2,5,7,9,11],MA:[1,2,4,7,8,10,11],ME:[1,2,4,5,6,9,10,11],JU:[1,2,3,4,7,8,10,11],VE:[2,5,6,9,10,11],SA:[3,5,6,12],LG:[1,2,4,5,6,7,9,10,11]},
 VE:{SU:[8,11,12],MO:[1,2,3,4,5,8,9,11,12],MA:[3,5,6,9,11,12],ME:[3,5,6,9,11],JU:[5,8,9,10,11],VE:[1,2,3,4,5,8,9,10,11],SA:[3,4,5,8,9,10,11],LG:[1,2,3,4,5,8,9,11]},
 SA:{SU:[1,2,4,7,8,10,11],MO:[3,6,11],MA:[3,5,6,10,11,12],ME:[6,8,9,10,11,12],JU:[5,6,11,12],VE:[6,11,12],SA:[3,5,6,11],LG:[1,3,4,6,10,11]}
};

function compute(signs){
  var bav={}, sav=[0,0,0,0,0,0,0,0,0,0,0,0], totals={}, sarva=0;
  PCODE.forEach(function(P){
    var arr=[0,0,0,0,0,0,0,0,0,0,0,0];
    CONTRIB.forEach(function(C){
      var base=signs[C]; if(base==null)return;
      BEN[P][C].forEach(function(h){ arr[(base+h-1)%12]++; });
    });
    bav[P]=arr;
    var t=arr.reduce(function(a,b){return a+b;},0);
    totals[P]=t; sarva+=t;
    for(var i=0;i<12;i++)sav[i]+=arr[i];
  });
  return {bav:bav,sav:sav,totals:totals,sarva:sarva};
}

function transitGrade(bindus){
  if(bindus>=5)return {tag:'favourable',cls:'av-good'};
  if(bindus===4)return {tag:'mixed',cls:'av-mid'};
  return {tag:'testing',cls:'av-weak'};
}

function savBand(v){
  if(v>=30)return 'av-strong';
  if(v>=25)return 'av-okay';
  return 'av-low';
}

function renderTable(R,lagnaSign){
  var L=(lagnaSign||0)%12;
  var h='<div class="av-tw"><table class="av-tab"><thead><tr><th>Graha</th>';
  for(var c=0;c<12;c++){var sg=(L+c)%12; h+='<th><span class="av-hn">H'+(c+1)+'</span><br>'+SHORT[sg]+'</th>';}
  h+='<th>Total</th></tr></thead><tbody>';
  PCODE.forEach(function(P){
    h+='<tr><td class="av-pl">'+PNAME[P]+'</td>';
    for(var c=0;c<12;c++){var sg=(L+c)%12; var v=R.bav[P][sg];
      h+='<td'+(v>=5?' class="av-hi"':(v===0?' class="av-z"':''))+'>'+v+'</td>';}
    h+='<td class="av-tot">'+R.totals[P]+'</td></tr>';
  });
  h+='</tbody><tfoot><tr><td class="av-pl">Sarva (SAV)</td>';
  for(var c2=0;c2<12;c2++){var sg2=(L+c2)%12; var sv=R.sav[sg2];
    h+='<td class="'+savBand(sv)+'">'+sv+'</td>';}
  h+='<td class="av-tot">'+R.sarva+'</td></tr></tfoot></table></div>';
  h+='<p class="av-leg">Columns are houses 1-12 from the Lagna. Each planet&rsquo;s row is its Bhinna Ashtakavarga (own bindus per sign); the foot row is the Sarvashtakavarga (all seven summed, 337 total). '+
     'For a sign: <b class="av-strong">30+</b> strong, <b class="av-okay">25-29</b> moderate, <b class="av-low">under 25</b> weaker. '+
     'A planet transiting a sign with <b>5+</b> of its own bindus tends to give better results there; <b>4</b> is mixed, fewer is more testing.</p>';
  return h;
}

window.KundliAshtaka={compute:compute,transitGrade:transitGrade,savBand:savBand,
  renderTable:renderTable,PCODE:PCODE,PNAME:PNAME};
})();
