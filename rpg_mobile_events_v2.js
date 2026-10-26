(()=>{
 const init=()=>{
  const panel=document.getElementById('mobileEvents'),target=document.getElementById('mobileEventsContent'),sidebar=document.getElementById('rpgInfoPanel');
  if(!panel||!target||!sidebar)return;
  const planner=sidebar.querySelector('.planner-section');
  if(!planner)return;
  const marker=document.createComment('original planner location');
  planner.before(marker);
  const mq=matchMedia('(max-width:700px)');
  const sync=()=>{
   if(mq.matches){
    target.append(planner);
    panel.hidden=false;
    panel.querySelector('h2').textContent='✦ What Next?';
   }else{
    marker.after(planner);
    panel.hidden=true;
   }
  };
  mq.addEventListener?.('change',sync);sync();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();