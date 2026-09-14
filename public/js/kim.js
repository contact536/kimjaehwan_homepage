const intro=document.getElementById('intro');
if(intro)setTimeout(()=>intro.classList.add('kim-done','hidden'),1600);
const canvas=document.getElementById('particleCanvas');
if(canvas&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 const ctx=canvas.getContext('2d');let w=0,h=0;const dots=Array.from({length:65},()=>({x:Math.random(),y:Math.random(),v:.00007+Math.random()*.00008}));
 const resize=()=>{w=canvas.width=canvas.clientWidth;h=canvas.height=canvas.clientHeight};resize();addEventListener('resize',resize);
 function frame(){ctx.clearRect(0,0,w,h);ctx.fillStyle='rgba(139,131,255,.45)';for(const d of dots){d.y=(d.y+d.v)%1;ctx.beginPath();ctx.arc(d.x*w,d.y*h,1.3,0,Math.PI*2);ctx.fill()}if(!document.hidden)requestAnimationFrame(frame)}frame();document.addEventListener('visibilitychange',()=>{if(!document.hidden)frame()});
}
