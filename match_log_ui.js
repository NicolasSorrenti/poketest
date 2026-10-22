'use strict';
// Full match history, based only on public server activity and visible messages.
(function(root){
 const shared=typeof module==='object'&&module.exports?require('./duel_quick_ui'):root.NeoDuelUI;
 function entries(activity,getCard,opponent='Opponent'){
  return (Array.isArray(activity)?activity:[]).filter(e=>e&&Number.isSafeInteger(e.seq))
   .sort((a,b)=>a.seq-b.seq).map(e=>{
    const mine=e.side===0,who=mine?'You':opponent;
    const description=shared.actionDescription(e,getCard,who);
    return {seq:e.seq,side:e.side,type:e.type,kind:description.kind,icon:description.icon,
      text:description.text.replace(mine?'their turn':'\u0000',mine?'your turn':'\u0000')};
   });
 }
 function render({list,activity,messages,getCard,opponent='Opponent'}){
  if(!list)return;
  const history=entries(activity,getCard,opponent);
  const notes=Array.isArray(messages)?messages.filter(x=>typeof x==='string'&&x.trim()):[];
  const signature=JSON.stringify([history,notes]);
  if(list.dataset.signature===signature)return;
  list.dataset.signature=signature;
  const scroll=list.closest('.log-scroll'),atBottom=scroll&&scroll.scrollHeight-scroll.scrollTop-scroll.clientHeight<48;
  list.replaceChildren();
  const doc=list.ownerDocument;
  const heading=(label,cls)=>{const li=doc.createElement('li');li.className='match-log-heading '+cls;li.textContent=label;list.append(li);};
  if(history.length){
   heading('ACTIONS · '+history.length,'match-log-section');
   let previousSide=null;
   for(const item of history){
    if(item.side!==previousSide){heading(item.side===0?'YOUR ACTIONS':'OPPONENT ACTIONS','match-log-side');previousSide=item.side;}
    const row=doc.createElement('li');row.className='timeline-entry '+item.kind+' match-log-event '+(item.side===0?'mine':'theirs');
    const ico=doc.createElement('span');ico.className='timeline-icon';ico.textContent=item.icon||'•';
    const body=doc.createElement('span');body.className='match-log-copy';body.textContent=item.text;
    const seq=doc.createElement('small');seq.className='match-log-seq';seq.textContent='#'+item.seq;
    row.append(ico,body,seq);list.append(row);
   }
  }
  if(notes.length){
   const group=doc.createElement('li');group.className='match-log-details';
   const details=doc.createElement('details');details.open=!history.length;
   const summary=doc.createElement('summary');summary.textContent='Detailed game messages ('+notes.length+')';
   const ol=doc.createElement('ol');ol.className='match-log-message-list';
   for(const note of notes){const row=doc.createElement('li');row.textContent=note;ol.append(row);}
   details.append(summary,ol);group.append(details);list.append(group);
  }
  if(!history.length&&!notes.length){const row=doc.createElement('li');row.className='timeline-empty';row.textContent='Actions, card effects and game messages will appear here.';list.append(row);}
  if(scroll&&atBottom)scroll.scrollTop=scroll.scrollHeight;
 }
 root.NeoMatchLog={entries,render};
 if(typeof module==='object'&&module.exports)module.exports=root.NeoMatchLog;
})(typeof window==='undefined'?globalThis:window);
