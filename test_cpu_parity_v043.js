'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {server}=require('./server');
const html=fs.readFileSync('classic_live.html','utf8'),css=fs.readFileSync('cpu_parity.css','utf8'),js=fs.readFileSync('classic_live.js','utf8');
new vm.Script(js,{filename:'classic_live.js'});
for(const sheet of ['classic_live.css','online_compact.css','online_hand_tray.css','cpu_parity.css'])assert.ok(html.includes('href="'+sheet+'"'),'Missing shared styles: '+sheet);
for(const id of ['myBench','enemyBench','myActive','enemyActive','handToggle','handTray','handPeek','closeHand','powersToggle','powerDrawer','closePowers','myDeckCount','oppDeckCount','myDiscardBtn','oppDiscardBtn','pileModal','closePile','prizeChoicePanel','logToggle','logDrawer','closeLog','coinFx','koFx'])assert.ok(html.includes('id="'+id+'"'),'Missing shared CPU control: '+id);
for(const handler of ['setHandVisible','setPowersOpen','setLogOpen','renderHandPeek','pendingPrizeChoice','choosePrize','renderPrizeFallback','openDiscard','renderCoin','renderKnockOut','renderCPULog'])assert.match(js,new RegExp('function '+handler+'\\('));
assert.match(js,/finally\{busy=false;render\(\);\}/,'Prize choices must be enabled after in-flight action');
assert.match(js,/function choosePrize\(id\)\{[^\n]*d\.options\?\.some\(o=>o\.id===id\)/,'Prize options must be server validated');
assert.match(css,/\.log-drawer|#logDrawer/);
assert.doesNotMatch(html,/src="engine\.js"/,'Local CPU mode cannot load legacy engine');
(async()=>{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{const base='http://127.0.0.1:'+server.address().port;
 for(const url of ['/classic_live.html','/classic_live.js','/online_compact.css','/online_hand_tray.css','/cpu_parity.css','/online.html']){const r=await fetch(base+url);assert.equal(r.status,200,'Static host must serve '+url);}
 }finally{await new Promise(resolve=>server.close(resolve));}
 console.log('PASS v0.43 CPU and online field parity: common assets, floating hand, powers, piles, prizes and log');
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
