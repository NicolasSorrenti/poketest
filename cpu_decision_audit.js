'use strict';
// Post-match decision-quality report based on legal, visible opportunities
// recorded by driveSide before each action.
function summarize(commands){
 const turns=new Map();
 for(const item of commands||[]){
  if(!Number.isInteger(item.turnSerial)||!item.command)continue;
  const key=item.side+':'+item.turnSerial;
  if(!turns.has(key))turns.set(key,{side:item.side,turnSerial:item.turnSerial,
   attachmentOpportunity:false,attached:false,ended:false,attacked:false,wonGame:false});
  const t=turns.get(key);
  if(item.attachmentOpportunity)t.attachmentOpportunity=true;
  if(item.wonGame)t.wonGame=true;
  if(item.command.type==='attach_energy')t.attached=true;
  if(item.command.type==='attack')t.attacked=true;
  if(item.command.type==='end_turn'||item.command.type==='attack')t.ended=true;
 }
 const finished=[...turns.values()].filter(t=>t.ended);
 // An immediate terminal win is better than spending an irrelevant Energy.
 const winning=finished.filter(t=>t.attachmentOpportunity&&!t.attached&&t.wonGame);
 const missed=finished.filter(t=>t.attachmentOpportunity&&!t.attached&&!t.wonGame);
 return {turns:finished.length,opportunities:finished.filter(t=>t.attachmentOpportunity).length,
  attachments:finished.filter(t=>t.attached).length,
  missedUsefulAttachments:missed.length,
  justifiedWinningSkips:winning.length,
  missedTurns:missed.map(t=>({side:t.side,turnSerial:t.turnSerial,attacked:t.attacked}))};
}
module.exports={summarize};
