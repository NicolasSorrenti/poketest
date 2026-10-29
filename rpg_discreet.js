'use strict';
/* Client-only presentation preference: never store this in a campaign save. */
(function(){
 const path=window.location.pathname;
 const isOverworld=/\/rpg-overworld\.html$/.test(path);
 const isRpg=/\/(?:rpg|rpg\.html)$/.test(path)||isOverworld;
 const isRpgDuel=/\/classic_live\.html$/.test(path)
  &&new URLSearchParams(window.location.search).get('rpg')==='1';
 if(!isRpg&&!isRpgDuel)return;
 const key=isOverworld?'neoHarborOverworldChibiModeV1':'neoHarborRpgDiscreetV1';
 const root=document.documentElement;
 function fromStorage(){
  try{const saved=window.localStorage.getItem(key);return saved===null?isOverworld:saved==='1';}catch{return isOverworld;}
 }
 function refreshButton(){
  const button=document.getElementById('rpgDiscreetToggle');
  if(!button)return;
  const active=root.dataset.rpgDiscreet==='on';
  button.textContent=active?'◈ DISCREET ON':'◇ DISCREET OFF';
  button.setAttribute('aria-pressed',String(active));
  button.title=active?'Show character and event illustrations':'Hide character and event illustrations (no change to gameplay)';
 }
 function apply(value,save){
  root.dataset.rpgDiscreet=value?'on':'off';
  if(save){try{window.localStorage.setItem(key,value?'1':'0');}catch{/* Private browsing can block storage. */}}
  refreshButton();
  window.NeoRpgDiscreetAvatars?.refresh?.();
 }
 // Set the root attribute before page content renders to avoid a flash of art.
 apply(fromStorage(),false);
 window.addEventListener('DOMContentLoaded',()=>{
  const button=document.getElementById('rpgDiscreetToggle');
  if(button)button.addEventListener('click',()=>apply(root.dataset.rpgDiscreet!=='on',true));
  refreshButton();
 });
 window.addEventListener('storage',event=>{
  if(event.key===key)apply(event.newValue==='1',false);
 });
})();
