'use strict';
// Exact printed signatures from retail Gym Heroes, Gym Challenge and Neo Destiny
// theme decks. These are executable programs (not plain-damage fallbacks).
const {list:retail,entries:retailEntries}=require('./retail_theme_decks');
const {list:destiny,entries:destinyEntries}=require('./neo_destiny_decks');
const catalog=new Map(['gym1','gym2','neo1','neo2','neo3','neo4'].flatMap(set=>require('./cards/'+set+'.json')).map(c=>[c.id,c]));
const mapping={
 'gym1-66|Call for Friend':'call-brock','gym1-53|Rapids':'rapids',
 'gym1-54|Call for Friend':'call-misty','gym1-57|Crystal Beam':'crystal-beam',
 'gym1-82|Focus Energy':'focus','gym1-45|Magic Pollen':'magic-pollen',
 'gym2-9|Hyper Needle':'hyper-needle','gym2-78|Sludge Grip':'sludge-grip',
 'gym2-48|Obscuring Gas':'obscuring-gas','gym2-58|Life Drain':'life-drain',
 'gym2-96|Fade Out':'fade-out','gym2-55|Shadow Attack':'shadow-attack',
 'gym2-57|Helping Hand':'helping-hand','gym2-60|Fire Tail Slap':'fire-tail',
 'gym2-31|Bonfire':'bonfire','gym2-64|Hind Kick':'hind-kick',
 'gym2-33|Stamp':'stamp','gym2-66|Call Will-o\'-the-wisp':'will-o-wisp',
 'gym2-43|False Charity':'false-charity',
 'neo4-39|Incinerate':'incinerate','neo4-39|Rushing Magma':'rushing-magma',
 'neo4-10|Rushing Flames':'rushing-flames','neo3-33|Lava Flow':'lava-flow',
 'neo4-18|Ball of Flame':'ball-of-flame','neo4-36|Call Back':'call-back',
 'neo4-36|Surround':'surround','neo4-49|Return Home':'return-home',
 'neo4-49|Gentle Kick':'gentle-kick','neo4-25|Beatdown':'beatdown',
 'neo4-13|Bubble Jump':'bubble-jump','neo4-45|Freezing Breath':'freezing-breath',
 'neo4-45|Ice Pillar':'ice-pillar'
};
const signatures=new Map();
for(const id of new Set([
 ...retailEntries.filter(e=>e.gym).flatMap(e=>retail(e.id)),
 ...destinyEntries.flatMap(e=>destiny(e.id))])){
 const c=catalog.get(id);if(!c)continue;
 for(const a of c.attacks||[]){const key=id+'|'+a.name,effect=mapping[key];if(!effect)continue;
  signatures.set(JSON.stringify([a.name,a.damage||'',a.text||'']),Object.freeze({kind:'theme:'+effect,effect,damage:parseInt(a.damage,10)||0,owner:id}));
 }
}
const compile=a=>signatures.get(JSON.stringify([a.name,a.damage||'',a.text||'']))||null;
function resolve(p,flip,c={}){
 const effect=p.effect,flips=[];const roll=()=>{const b=Boolean(flip());flips.push(b);return b;};
 let damage=p.damage;
 if(['call-brock','call-misty','rapids','crystal-beam','magic-pollen','hyper-needle','sludge-grip','obscuring-gas','life-drain','shadow-attack','false-charity','fire-tail','hind-kick','ball-of-flame','surround','bubble-jump','freezing-breath'].includes(effect))roll();
 if(effect==='beatdown'&&c.darkDefender)roll();
 if(effect==='bonfire'||effect==='will-o-wisp')for(let i=0;i<3;i++)roll();
 if(effect==='stamp') {if(roll())damage+=10;}
 if(effect==='gentle-kick')damage=c.defenderCounters>0?20:40;
 if(effect==='beatdown'&&c.darkDefender&&flips[0])damage=100;
 if(effect==='freezing-breath')return {damage,status:flips[0]?'Paralyzed':'Asleep',flips};
 if(effect==='surround')return {damage,status:flips[0]?'Asleep':null,noRetreat:!flips[0],flips};
 if(effect==='rushing-magma')damage=20*(c.topFiveEnergyCount||0);
 if(effect==='rushing-flames')damage=40*(c.flameHeads||0);
 if(effect==='lava-flow')damage+=20*(c.discardAmount||0);
 if(effect==='life-drain')damage=flips[0]?Math.max(0,(c.enemyRemainingHP||0)-10):0;
 if(effect==='hyper-needle'&&!flips[0])damage=0;
 return {damage,flips};
}
module.exports={compile,resolve};
