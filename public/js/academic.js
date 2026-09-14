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
