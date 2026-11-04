'use strict';
// Presentational fallback for a pending duel that stops responding.
// The campaign controller owns timing, retry, abandonment and save changes.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgOverworldDuelRecovery=api;
})(typeof window==='undefined'?null:window,function(){
 function ensure(doc,onRetry,onAbandon){
  if(!doc)return null;
  const previous=doc.getElementById('battleRecovery');
  if(previous)return previous;
  const panel=doc.createElement('section');panel.id='battleRecovery';panel.hidden=true;
  panel.setAttribute('role','status');panel.setAttribute('aria-live','polite');
  panel.style.cssText='position:fixed;z-index:100;left:50%;bottom:20px;transform:translateX(-50%);width:min(560px,calc(100vw - 24px));padding:16px;border:1px solid #c59bd1;border-radius:14px;background:#17152af2;color:#fff;box-shadow:0 10px 40px #000b;text-align:center';
  const message=doc.createElement('p');
  message.textContent='The duel has not responded. You can retry loading it or return to your campaign.';
  message.style.margin='0 0 12px';
  const retry=doc.createElement('button');retry.type='button';retry.textContent='Retry duel';
  retry.style.margin='4px';retry.onclick=()=>onRetry?.();
  const abandon=doc.createElement('button');abandon.type='button';
  abandon.textContent='Return to campaign';abandon.style.margin='4px';
  abandon.onclick=()=>onAbandon?.();
  panel.append(message,retry,abandon);
  doc.body.append(panel);
  return panel;
 }
 return Object.freeze({ensure});
});
