'use strict';
const assert=require('node:assert/strict');
const {server}=require('./server');
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const base=`http://127.0.0.1:${server.address().port}`;
  for(const file of ['classic_live.html','online.html','core_rules.js','duel_quick_ui.js','battle_decision_ui.js','duel_experience_ui.js','battle_presentation_ui.js','classic_live.js','online.js','classic_live.css']){
   const response=await fetch(`${base}/${file}`);assert.equal(response.status,200,`Missing served UI asset ${file}`);
   assert.ok((await response.text()).length>100);
  }
  for(const forbidden of ['server.js','headless_duel.js']){
   const response=await fetch(`${base}/${forbidden}`);assert.equal(response.status,404,`${forbidden} must stay private`);
  }
  console.log('PASS v0.36 HTTP assets: all shared UI scripts are served; server-only scripts remain blocked');
 }finally{await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}
})().catch(e=>{console.error(e);process.exitCode=1});
