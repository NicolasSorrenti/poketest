'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {server}=require('./server');
(async()=>{
 const html=fs.readFileSync('online.html','utf8');
 const js=fs.readFileSync('online.js','utf8');
 const css=fs.readFileSync('online_hand_tray.css','utf8');
 for(const id of ['handPanel','handToggle','handTray','handPeek','closeHand','powersToggle','powerDrawer','prizeChoicePanel','myBench','enemyBench']){
  assert.match(html,new RegExp('id="'+id+'"'),'Missing interactive element '+id);
 }
 assert.match(html,/href="online_hand_tray\.css"/,'Floating hand CSS is not loaded');
 assert.match(js,/finally\{busy=false;render\(\);\}/,'Busy-state reset must redraw and reenable Prize buttons after an attack');
 assert.match(js,/function choosePrize\(id\)/,'Prize clicks must submit authoritative decision option IDs');
 assert.match(js,/d\.options\?\.some\(o=>o\.id===id\)/,'Prize choice must be validated against server options');
 assert.match(js,/function renderPrizeFallback\(\)/,'Provide a separate accessible Prize-choice row');
 assert.match(css,/\.hand-tray-drawer/);
 assert.match(css,/\.bench-zone/);
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const base='http://127.0.0.1:'+server.address().port;
  for(const url of ['/online.html','/online.js','/online_compact.css','/online_hand_tray.css']){
   const response=await fetch(base+url);assert.equal(response.status,200,'Hosting must serve '+url);
  }
 }finally{await new Promise(resolve=>server.close(resolve));}
 console.log('PASS v0.39 floating tray, Prize recovery, authoritative choices and hosted UI assets');
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
