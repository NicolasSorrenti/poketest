'use strict';
// Purpose-built, non-retail test decks. The original six named theme decks remain
// available unchanged; these make Fossil and Team Rocket mechanics accessible
// from the authoritative duel UI without introducing a deck editor yet.
const expand=groups=>groups.flatMap(([amount,id])=>Array(amount).fill(id));
const LAB={
 'rocket_lab':expand([
 [4,'base5-57'],[2,'base5-41'],[3,'base5-47'],[2,'base5-25'],
 [3,'base5-70'],[2,'base5-24'],[3,'base5-58'],[2,'base5-31'],
 [2,'base5-66'],[2,'base5-51'],
 [8,'base1-99'],[8,'base1-102'],[4,'base1-96'],
 [3,'base1-91'],[2,'base1-94'],[2,'base1-93'],[2,'base1-95'],[2,'base1-92'],
 [2,'base5-73'],[2,'base5-77']
 ]),
 'fossil_lab':expand([
 [4,'base3-33'],[3,'base3-21'],[2,'base3-20'],
 [4,'base3-48'],[2,'base3-28'],[3,'base3-55'],[2,'base3-43'],
 [2,'base3-18'],[2,'base3-25'],
 [12,'base1-101'],[8,'base1-102'],
 [3,'base1-91'],[3,'base1-94'],[2,'base1-93'],[2,'base1-95'],
 [2,'base1-92'],[2,'base3-58'],[2,'base3-59']
 ])
};
module.exports={LAB,expand};
