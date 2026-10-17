'use strict';
// Never equate handler registration with historically verified implementation.
const fs=require('node:fs');
const trainer=JSON.parse(fs.readFileSync(__dirname+'/trainer_coverage.json'));
const pending=trainer.records.filter(record=>record.status!=='handler');
if(pending.length){
 console.error('Historical rules fidelity NOT certified. Open Trainer records:');
 pending.forEach(r=>console.error(`- ${r.id}: ${r.name} (${r.status})`));
 console.error('Additionally requires manual browser playthroughs and card-interaction verification.');
 process.exitCode=1;
}else{
 console.log('Trainer dispatch fully registered; manual and cross-effect verification is STILL required.');
 process.exitCode=1;
}
