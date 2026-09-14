(() => {
 const finder=document.querySelector('.page-finder');
 if(!finder)return;
 const input=finder.querySelector('input'),summary=finder.querySelector('summary');
 const links=[...finder.querySelectorAll('.finder-results a')];
 input.addEventListener('input',()=>{
   const terms=input.value.normalize('NFKC').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
   let count=0;
   for(const link of links){
     const text=link.textContent.normalize('NFKC').toLocaleLowerCase();
     link.hidden=!terms.every(term=>text.includes(term));
     if(!link.hidden)count++;
   }
   finder.querySelector('.finder-count').textContent=count+'개 바로가기';
   finder.querySelector('.finder-empty').hidden=count>0;
 });
 finder.addEventListener('toggle',()=>{if(finder.open)input.focus();});
 finder.addEventListener('keydown',event=>{
   if(event.key==='Escape'){event.stopPropagation();finder.open=false;summary.focus();}
 });
 document.addEventListener('click',event=>{if(!finder.contains(event.target))finder.open=false;});
 links.forEach(link=>link.addEventListener('click',()=>{finder.open=false;}));
})();
