(() => {
 const button=document.querySelector('.academic-menu-toggle'),menu=document.getElementById('academicMenu');
 if(!button||!menu)return;
 const mobile=matchMedia('(max-width:600px)');
 function reset(){menu.hidden=mobile.matches;button.setAttribute('aria-expanded',String(!mobile.matches))}
 reset();mobile.addEventListener('change',reset);
 button.addEventListener('click',()=>{menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden))});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('.academic-tools[open]').forEach(d=>d.open=false);if(mobile.matches&&!menu.hidden){reset();button.focus()}}});
 document.addEventListener('click',e=>{document.querySelectorAll('.academic-tools[open]').forEach(d=>{if(!d.contains(e.target))d.open=false})});
})();
(() => {
 let footer=document.querySelector('.kim-footer');
 if(!footer){
  footer=document.createElement('footer');
  footer.className='kim-footer';
  footer.setAttribute('aria-label','방문 통계 안내');
  document.body.append(footer);
 }
 const note=document.createElement('p');
 note.className='kim-small';
 const privacy=document.createElement('a');
 privacy.href='/pages/privacy.html';
 privacy.textContent='방문 통계 안내';
 const source=document.createElement('a');
 source.href='https://db-ip.com';
 source.textContent='IP Geolocation by DB-IP';
 source.target='_blank';
 source.rel='noopener noreferrer';
 note.append(privacy,document.createTextNode(' · '),source);
 footer.append(note);
})();
