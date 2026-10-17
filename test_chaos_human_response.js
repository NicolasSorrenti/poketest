'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const ctx={console,Math,window:{NeoCardCorrections:{}},document:{getElementById:()=>({classList:{add(){},remove(){}},style:{},appendChild(){},querySelectorAll(){return []}}),querySelector:()=>null},setTimeout(){},clearTimeout(){},innerWidth:1600};
vm.createContext(ctx);
const root=__dirname;
vm.runInContext(fs.readFileSync(path.join(root,'engine.js'),'utf8').split('async function load()')[0].replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();'),ctx);
for(const file of ['trainer_rules_v058.js','trainer_rules_v059.js','trainer_rules_v060.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
for(const file of fs.readdirSync(path.join(root,'cards')).filter(x=>x.endsWith('.json')))for(const card of JSON.parse(fs.readFileSync(path.join(root,'cards',file),'utf8')))vm.runInContext('lookup',ctx).set(card.id,card);
const game=vm.runInContext('engine',ctx),state=vm.runInContext('statePlayer',ctx),mk=vm.runInContext('unit',ctx);
function reset(){game.players=[state('You',[]),state('Rival',[])];game.turn=1;game.round=3;game.phase='game';game.over=false;game.players[0].active=mk('base1-58');game.players[1].active=mk('base1-50');game.players[1].hand=['base1-91'];game.players[0].deck=['base1-97','base1-98'];game.stadium={id:'gym2-102',owner:0};}
vm.runInContext('coin=()=>false',ctx);
reset();assert.equal(game.trainer(0),true);let req=vm.runInContext('deckSearchRequest',ctx);assert.equal(req.defenderPrompt,true);assert.equal(game.players[0].hand.length,0);assert.equal(req.execute(0),true);assert.equal(game.players[0].hand.length,0);assert.equal(game.turn,1);
reset();assert.equal(game.trainer(0),true);req=vm.runInContext('deckSearchRequest',ctx);assert.equal(req.execute(1),true);assert.equal(game.players[0].hand.length,2);assert.equal(game.turn,1);assert.equal(game.players[1].discard.includes('base1-91'),true);
console.log('PASS Chaos Gym CPU-turn redirected Bill offers the human accept/decline choices');
