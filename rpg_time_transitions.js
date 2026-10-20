'use strict';
/* Neo Harbor presentation-only calendar / period transitions.
 * The RPG owns time, event triggers and persistence; this layer never changes state. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.NeoRpgTimeTransitions=api;
})(typeof window==='undefined'?null:window,function(){
  const PERIODS=['MORNING','AFTERNOON','EVENING'];
  const WEEKDAYS=['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
  const MOTTO=['A FRESH START','THE TOWN COMES ALIVE','THE CITY LIGHTS UP'];
  const DURATIONS={period:680,day:1080,sleep:1120,season:1350};
  const number=(n)=>Number.isInteger(n)?n:null;
  const weekday=(day)=>WEEKDAYS[(day-1)%7];
  function plan(change){
    if(!change||number(change.beforeDay)===null||number(change.afterDay)===null||
       number(change.beforeSlot)===null||number(change.afterSlot)===null||
       change.beforeDay<1||change.afterDay<1||change.beforeSlot<0||change.beforeSlot>2||
       change.afterSlot<0||change.afterSlot>2)return null;
    const {beforeDay,afterDay,beforeSlot,afterSlot}=change;
    if(beforeDay===afterDay&&beforeSlot===afterSlot)return null;
    let kind='period';
    if(afterDay>90)kind='season';
    else if(afterDay>beforeDay)kind=change.source==='sleep'?'sleep':'day';
    const title=kind==='season'?'SEASON COMPLETE':kind==='sleep'?'A NEW MORNING':
      kind==='day'?'A NEW DAY':PERIODS[afterSlot];
    return Object.freeze({
      kind,period:PERIODS[afterSlot].toLowerCase(),title,
      eyebrow:kind==='season'?'THE 90-DAY JOURNEY':kind==='period'?'NEO HARBOR / TIME SHIFT':'NEO HARBOR / CALENDAR',
      beforeDay,afterDay,beforeSlot,afterSlot,oldDate:'DAY '+String(beforeDay).padStart(2,'0'),
      newDate:kind==='season'?'DAY 90 / 90':'DAY '+String(afterDay).padStart(2,'0')+' / 90',
      weekday:afterDay<=90?weekday(afterDay):'FINALE',
      subtitle:kind==='season'?'YOUR STORY CONTINUES':
        kind==='sleep'?'RISE AND SHINE':kind==='day'?'YOUR NEXT DAY BEGINS':MOTTO[afterSlot],
      durationMs:DURATIONS[kind]
    });
  }
  function planTravel(change){
    const from=typeof change?.from==='string'?change.from.trim():'';
    const to=typeof change?.to==='string'?change.to.trim():'';
    if(!from||!to||from===to)return null;
    return Object.freeze({
      kind:'travel',period:'travel',title:to.toUpperCase(),
      eyebrow:'NEO HARBOR / EXPLORATION',subtitle:'NOW ARRIVING',
      oldDate:'',newDate:'',weekday:'',durationMs:440
    });
  }
  function createPresenter(options={}){
    const doc=options.document||((typeof document!=='undefined')?document:null);
    const win=options.window||((typeof window!=='undefined')?window:null);
    const setTimer=options.setTimeout||setTimeout;
    const clearTimer=options.clearTimeout||clearTimeout;
    let current=null;
    const node=(tag,className,text)=>{
      const item=doc.createElement(tag);
      if(className)item.className=className;
      if(text!==undefined)item.textContent=text;
      return item;
    };
    function dismiss(){
      if(!current)return;
      const {element,timer,onKey,finishAnimation}=current;
      current=null;
      clearTimer(timer);
      if(doc.removeEventListener)doc.removeEventListener('keydown',onKey,true);
      element.removeEventListener('animationend',finishAnimation);
      element.remove();
    }
    function present(change){
      const result=change?.kind==='travel'?planTravel(change):plan(change);
      if(!result)return null;
      // An ordinary location reveal cannot replace a day/period transition.
      if(result.kind==='travel'&&current&&current.plan?.kind!=='travel')return null;
      dismiss(); // New transitions supersede old ones; no stale overlay or timer.
      if(!doc?.body||typeof doc.createElement!=='function')return result;
      const reduced=!!win?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      const element=node('div','neo-timefx neo-timefx--'+result.kind+' neo-timefx--'+result.period+(reduced?' neo-timefx--reduced':''));
      element.setAttribute('role','status');
      element.setAttribute('aria-live','polite');
      element.setAttribute('aria-atomic','true');
      element.setAttribute('aria-label',result.title+', '+result.newDate);
      element.style.setProperty('--neo-timefx-duration',Math.max(120,reduced?140:result.durationMs)+'ms');
      const graphic=node('div','neo-timefx__graphic');
      graphic.setAttribute('aria-hidden','true');
      const lines=node('div','neo-timefx__lines');
      lines.setAttribute('aria-hidden','true');
      const interior=node('div','neo-timefx__interior');
      const eyebrow=node('span','neo-timefx__eyebrow',result.eyebrow);
      const dates=node('div','neo-timefx__dates');
      dates.append(node('span','neo-timefx__old-day',result.oldDate),node('span','neo-timefx__arrow','➜'),node('span','neo-timefx__new-day',result.newDate));
      const heading=node('strong','neo-timefx__title',result.title);
      const sub=node('span','neo-timefx__subtitle',result.subtitle);
      const meta=node('span','neo-timefx__weekday',result.weekday);
      interior.append(eyebrow,heading,sub,dates,meta);
      const skip=node('button','neo-timefx__skip','SKIP ›');
      skip.type='button';skip.setAttribute('aria-label','Skip time transition');
      if(!reduced)interior.append(skip);
      element.append(graphic,lines,interior);
      const onKey=(event)=>{
        if(!['Escape','Enter',' ','Spacebar'].includes(event.key))return;
        event.preventDefault?.();
        event.stopImmediatePropagation?.();
        dismiss();
      };
      const finishAnimation=(event)=>{if(event.target===element)dismiss();};
      element.addEventListener('animationend',finishAnimation);
      element.addEventListener('click',dismiss);
      doc.addEventListener?.('keydown',onKey,true);
      doc.body.append(element);
      const timer=setTimer(dismiss,(reduced?140:result.durationMs)+100);
      current={element,timer,onKey,finishAnimation,plan:result};
      return result;
    }
    return {present,presentTravel:detail=>present({...detail,kind:'travel'}),dismiss,get active(){return !!current;}};
  }
  const defaultPresenter=createPresenter();
  return {plan,planTravel,createPresenter,present:detail=>defaultPresenter.present(detail),presentTravel:detail=>defaultPresenter.presentTravel(detail),dismiss:()=>defaultPresenter.dismiss()};
});