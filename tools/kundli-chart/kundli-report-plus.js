/* =====================================================================
   kundli-report-plus.js — include add-on sections in the printable report.
   It clones the rendered on-page timing, varshaphal, strength, chalit,
   panchang, yoga and muhurta sections into #report before printing.
   ===================================================================== */
(function(){
'use strict';
var SECTION_IDS=['kt-timeline','kt-windows','kt-varsha','kt2-sb','kt2-ch','kt2-px','ky-y','ky-m'];

function injectPrintStyle(){
  if(document.getElementById('kt-print-style'))return;
  var css=
  '.kt-print{--ink:#23201a;--gold:#8a6d2f;--gold-soft:#5e4a1f;--muted:#6b6660;--line:#d8cdb5;--panel:#fff;--bg2:#fff;--bg:#fff;color:#23201a}'+
  '.kt-print .kt-sec,.kt-print .kt2-sec,.kt-print .ky-sec{border-top:1px solid #d8cdb5;margin-top:12px;padding-top:8px;page-break-inside:auto}'+
  '.kt-print .section-title{font-family:Georgia,serif;font-size:15px;color:#5e4a1f;text-align:left;margin:10px 0 4px;page-break-after:avoid}'+
  '.kt-print .kt-h,.kt-print .kt2-h{color:#8a6d2f;border-color:#e4dcc8;font-size:10px;margin:10px 0 5px}'+
  '.kt-print table{font-size:9.5px;width:100%;border-collapse:collapse}'+
  '.kt-print th{background:#f4efe2;color:#5e4a1f;text-transform:uppercase;font-size:8px}'+
  '.kt-print th,.kt-print td{border:1px solid #e4dcc8;padding:3px 5px}'+
  '.kt-print tr.kt-active td,.kt-print tr.kt2-shift td,.kt-print tr.ky-active td{background:#faf3df}'+
  '.kt-print svg{width:215px;height:215px;background:#fff;border:1px solid #d8cdb5;border-radius:6px}'+
  '.kt-print .frame{stroke:#8a6d2f}.kt-print .chartline{stroke:#d2c6ac}.kt-print .signnum{fill:#9b9486}.kt-print .planet{fill:#5e4a1f}.kt-print .lagna{fill:#8a6d2f}'+
  '.kt-print .kt-sub,.kt-print .kt2-sub,.kt-print .ky-sub,.kt-print .kt-note,.kt-print .kt2-note,.kt-print .ky-note,.kt-print .px{color:#6b6660;font-size:9px}'+
  '.kt-print .kt-sub b,.kt-print .kt2-sub b,.kt-print .pcard .pv,.kt-print .kt-win-date,.kt-print .rd-pname{color:#5e4a1f}'+
  '.kt-print .kt-g,.kt-print .kt2-g,.kt-print .ky-good{color:#1f7a3a}.kt-print .kt-w,.kt-print .kt2-w,.kt-print .ky-bad{color:#a23b1e}.kt-print .kt-m,.kt-print .kt2-m,.kt-print .ky-mix{color:#7a5b1e}'+
  '.kt-print .kt-win,.kt-print .pcard,.kt-print .pr-card,.kt-print .ky-yoga{border:1px solid #e4dcc8;background:#faf8f1;border-radius:6px;padding:6px;margin:5px 0}'+
  '.kt-print .kt-pan,.kt-print .kt2-pan,.kt-print .ky-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}'+
  '.kt-print .kt-tag.good{background:#e7cf9f;color:#3a2c12}.kt-print .kt-tag{border:1px solid #d8cdb5;color:#5e4a1f}'+
  '.kt-print .charts{display:flex;gap:14px;justify-content:flex-start;flex-wrap:wrap}'+
  '.kt-print figcaption{font-size:8px;color:#8a6d2f;text-transform:uppercase;letter-spacing:.12em;margin-bottom:3px}'+
  '.kt-print .kt-why,.kt-print .kt-read,.kt-print .ky-yd{font-size:9px;color:#23201a}'+
  '.kt-print .ky-yn{font-family:Georgia,serif;font-size:12px;color:#5e4a1f}'+
  '.kt-print details{margin-top:6px}.kt-print summary{display:none}'+
  '@media print{.kt-print details{display:block}.kt-print details>*{display:revert}}';
  var st=document.createElement('style');st.id='kt-print-style';st.textContent=css;document.head.appendChild(st);
}

function appendToReport(){
  var report=document.getElementById('report');if(!report)return;
  var old=report.querySelector('.kt-print');if(old)old.remove();
  var holder=document.createElement('div');holder.className='kt-print';
  var any=false;
  SECTION_IDS.forEach(function(id){
    var sec=document.getElementById(id);if(!sec)return;
    var clone=sec.cloneNode(true);
    clone.querySelectorAll('[id]').forEach(function(n){n.removeAttribute('id');});
    clone.querySelectorAll('.kt-ctrl,.kt2-ctrl,.rd-controls,.dctrl,select,button').forEach(function(n){n.remove();});
    clone.querySelectorAll('details').forEach(function(d){d.setAttribute('open','');});
    holder.appendChild(clone);any=true;
  });
  if(any)report.appendChild(holder);
}

function onReportBuilt(){
  injectPrintStyle();
  appendToReport();
}
function onDownload(){
  injectPrintStyle();
  setTimeout(appendToReport,0);
}
function init(){
  document.addEventListener('kundli-report-built',onReportBuilt);
  var btn=document.getElementById('dlReport');
  if(btn)btn.addEventListener('click',onDownload);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
