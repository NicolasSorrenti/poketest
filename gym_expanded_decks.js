'use strict';
// Two intentionally simple custom decks built primarily from formerly excluded
// Gym printings. Every attack currently compiles and neither deck requires a
// Pokémon Power. They are laboratory samples, not official retail decks.
const expand=rows=>rows.flatMap(([n,id])=>Array(n).fill(id));
const trainers=expand([[4,'base1-91'],[4,'base1-94'],[2,'base1-95'],[2,'base1-88'],[2,'base1-93'],[2,'base1-92']]);
const LAB={
 gym_new_garden:[...expand([[4,'gym1-22'],[3,'gym2-67'],[3,'gym2-68'],[4,'gym1-74'],[4,'gym1-75'],[4,'gym2-70'],[2,'gym1-36']]),...trainers,...expand([[11,'base1-97'],[9,'base1-99']])],
 gym_new_voltage:[...expand([[4,'gym1-35'],[4,'gym1-63'],[2,'gym1-73'],[2,'gym2-37'],[4,'gym2-84'],[4,'gym2-86'],[4,'gym1-36']]),...trainers,...expand([[12,'base1-98'],[8,'base1-100']])]
};
module.exports={LAB};
