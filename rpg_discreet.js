'use strict';
/* Client-only presentation preference: never store this in a campaign save. */
(function(){
 const path=window.location.pathname;
 const isOverworld=/\/rpg-overworld(?:\.html)?\/?$/.test(path);
 const isRpg=/\/(?:rpg|rpg\.html)$/.test(path)||isOverworld;
 const isRpgDuel=/\/classic_live(?:\.html)?\/?$/.test(path)
  &&new URLSearchParams(window.location.search).get('rpg')==='1';
 if(!isRpg&&!isRpgDuel)return;
 const overworldKey='neoHarborOverworldChibiModeV1';
 const rpgKey='neoHarborRpgDiscreetV1';
 const root=document.documentElement;
 function fromStorage(){
  try{
   // The overworld chibi switch and RPG battle switch are one preference.
   // Prefer the overworld value so an existing chibi selection carries into duels.
   const saved=window.localStorage.getItem(overworldKey)??window.localStorage.getItem(rpgKey);
   return saved===null?isOverworld:saved==='1';
  }catch{return isOverworld;}
 }
 function refreshButton(){
  const active=root.dataset.rpgDiscreet==='on';
  const button=document.getElementById('rpgDiscreetToggle');
  if(button){
   const label=active?'◈ DISCREET ON':'◇ DISCREET OFF';
   if(button.textContent!==label)button.textContent=label;
   button.setAttribute('aria-pressed',String(active));
   button.title=active?'Show character and event illustrations':'Hide character and event illustrations (no change to gameplay)';
  }
  document.querySelectorAll('.rpg-discreet-popup-toggle').forEach(control=>{
   const label=active?'◈ Discreet on':'◇ Discreet off';
   if(control.textContent!==label)control.textContent=label;
   control.setAttribute('aria-pressed',String(active));
   control.title=active?'Show character and event illustrations':'Hide character and event illustrations throughout the game';
  });
 }
 function apply(value,save){
  root.dataset.rpgDiscreet=value?'on':'off';
  if(save){try{const stored=value?'1':'0';window.localStorage.setItem(overworldKey,stored);window.localStorage.setItem(rpgKey,stored);}catch{/* Private browsing can block storage. */}}
  refreshButton();
  window.NeoRpgDiscreetAvatars?.refresh?.();
 }
 // Expose one authoritative control so overlays can toggle the preference without
 // depending on a synthetic click reaching the original toolbar button.
 window.NeoRpgDiscreet={
  set(value){apply(Boolean(value),true);return root.dataset.rpgDiscreet==='on';},
  toggle(){apply(root.dataset.rpgDiscreet!=='on',true);return root.dataset.rpgDiscreet==='on';},
  isEnabled(){return root.dataset.rpgDiscreet==='on';}
 };
 // Set the root attribute before page content renders to avoid a flash of art.
 apply(fromStorage(),false);
 function bindButton(){
  const button=document.getElementById('rpgDiscreetToggle');
  if(button&&button.dataset.rpgDiscreetBound!=='1'){
   button.dataset.rpgDiscreetBound='1';
   button.addEventListener('click',()=>apply(root.dataset.rpgDiscreet!=='on',true));
  }
  bindPopupButtons();
  refreshButton();
 }
 function bindPopupButtons(){
  const addControl=host=>{
   if(!host||host.querySelector(':scope > .rpg-discreet-popup-toggle'))return;
   const button=document.createElement('button');
   button.type='button';button.className='rpg-discreet-popup-toggle';
   button.setAttribute('aria-label','Toggle discreet mode for the whole game');
   button.addEventListener('click',event=>{
    event.preventDefault();event.stopPropagation();
    window.NeoRpgDiscreet?.toggle();
   });
   host.append(button);
  };
  document.querySelectorAll('dialog[open]').forEach(dialog=>{
   addControl(dialog.querySelector('.modal-heading,.cg-viewer-bar,.rpg-status-header,.rpg-drawer-header')||dialog.firstElementChild);
  });
  const eventPanel=document.querySelector('#neoOverworldEvents:not([hidden])');
  if(eventPanel)addControl(eventPanel.firstElementChild);
  document.querySelectorAll('#neoOverworldStoryDock:not([hidden]) #dialogue .dialogue-title').forEach(addControl);
 }
 // The RPG duel toolbar can reveal or insert this control after initial page load.
 if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',bindButton,{once:true});
 else bindButton();
 new MutationObserver(bindButton).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['open','hidden']});
 window.addEventListener('storage',event=>{
  if(event.key===overworldKey||event.key===rpgKey)apply(fromStorage(),false);
 });
})();
