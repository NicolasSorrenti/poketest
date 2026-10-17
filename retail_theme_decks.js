'use strict';
// Printed English retail theme-deck recipes. Card IDs are stable set numbers.
// Sources: PokeBeach historical theme-deck articles and sealed Team Rocket deck
// checklists. Each row retains exact original printing, incl. Base Set 2 reprints.
// New Gym sets are curated deck cards, not blanket format legalization.
const recipes={
 bodyguard:[
 [4,'base3-57'],[2,'base3-34'],[4,'base3-48'],[1,'base3-13'],[4,'base3-51'],[2,'base1-44'],[3,'base3-47'],[2,'base3-37'],[1,'base1-56'],
 [4,'base1-94'],[2,'base1-90'],[1,'base1-85'],[2,'base1-88'],[16,'base1-99'],[12,'base1-97']],
 lockdown:[
 [3,'base1-60'],[3,'base1-68'],[2,'base3-39'],[4,'base3-51'],[2,'base3-38'],[4,'base3-49'],[2,'base3-42'],[1,'base3-10'],
 [1,'base3-59'],[1,'base3-60'],[1,'base1-82'],[2,'base1-90'],[2,'base1-94'],[2,'base1-95'],[2,'base1-91'],[14,'base1-98'],[14,'base1-102']],
 grass_chopper:[
 [4,'base4-66'],[2,'base4-64'],[3,'base4-82'],[1,'base4-53'],[2,'base4-83'],[4,'base4-78'],[2,'base4-49'],[4,'base4-91'],[1,'base4-6'],
 [3,'base4-122'],[1,'base4-120'],[2,'base4-113'],[1,'base4-117'],[1,'base4-108'],[1,'base4-119'],[14,'base4-127'],[14,'base4-125']],
 hot_water:[
 [4,'base4-88'],[2,'base4-57'],[1,'base4-15'],[3,'base4-76'],[3,'base4-69'],[1,'base4-35'],[2,'base4-51'],[3,'base4-72'],[1,'base4-37'],
 [1,'base4-120'],[3,'base4-119'],[2,'base4-121'],[3,'base4-122'],[2,'base4-110'],[1,'base4-106'],[15,'base4-130'],[13,'base4-126']],
 lightning_bug:[
 [4,'base4-68'],[1,'base4-81'],[4,'base4-100'],[2,'base4-47'],[1,'base4-21'],[4,'base4-87'],[3,'base4-79'],[1,'base4-3'],
 [3,'base4-118'],[2,'base4-120'],[1,'base4-123'],[2,'base4-110'],[2,'base4-109'],[1,'base4-113'],[1,'base4-115'],[16,'base4-127'],[12,'base4-128']],
 psych_out:[
 [3,'base4-95'],[1,'base4-94'],[1,'base4-61'],[4,'base4-93'],[1,'base4-63'],[3,'base4-65'],[1,'base4-46'],[2,'base4-73'],[2,'base4-45'],[3,'base4-77'],[1,'base4-19'],
 [3,'base4-120'],[2,'base4-123'],[2,'base4-109'],[1,'base4-122'],[1,'base4-117'],[1,'base4-101'],[15,'base4-130'],[13,'base4-129']],
 devastation:[
 [3,'base4-100'],[3,'base5-63'],[1,'base5-36'],[4,'base5-58'],[1,'base5-14'],[3,'base4-96'],[3,'base4-93'],[1,'base4-63'],[1,'base5-46'],[1,'base4-50'],[2,'base5-45'],[3,'base5-55'],
 [1,'base4-111'],[1,'base4-120'],[1,'base5-76'],[2,'base4-122'],[1,'base4-117'],[18,'base4-127'],[10,'base4-130']],
 trouble:[
 [2,'base4-65'],[2,'base5-49'],[1,'base4-46'],[2,'base5-39'],[2,'base4-75'],[1,'base4-43'],[3,'base5-54'],[1,'base4-45'],[2,'base4-100'],[4,'base5-56'],[1,'base5-2'],[2,'base5-62'],[2,'base4-40'],
 [1,'base4-118'],[1,'base4-120'],[2,'base4-122'],[1,'base4-123'],[1,'base5-73'],[18,'base4-129'],[10,'base4-127'],[1,'base5-81']],
 brock:[
 [3,'gym1-66'],[1,'gym1-40'],[3,'gym1-67'],[4,'gym1-69'],[3,'gym1-70'],[1,'gym1-2'],[2,'gym1-71'],[1,'gym1-72'],[1,'gym1-41'],
 [1,'base1-91'],[1,'gym1-98'],[2,'gym1-106'],[2,'base1-81'],[1,'base1-82'],[1,'gym1-115'],[2,'base1-94'],[3,'base1-95'],[28,'gym1-127']],
 misty:[
 [3,'gym1-85'],[4,'gym1-86'],[3,'gym1-87'],[1,'gym1-53'],[2,'gym1-54'],[4,'gym1-90'],[2,'gym1-56'],[2,'gym1-57'],[1,'gym1-10'],
 [1,'gym1-108'],[2,'base1-92'],[2,'base1-94'],[1,'gym1-102'],[3,'base2-64'],[1,'base1-95'],[28,'gym1-132']],
 surge:[
 [4,'gym1-80'],[1,'gym1-8'],[4,'gym1-81'],[3,'gym1-84'],[2,'gym1-52'],[2,'gym1-83'],[4,'gym1-82'],[2,'gym1-51'],
 [1,'base1-92'],[2,'base1-93'],[1,'gym1-101'],[1,'base1-84'],[2,'base1-94'],[2,'gym1-118'],[1,'gym1-120'],[28,'gym1-130']],
 erika:[
 [4,'gym1-76'],[2,'gym1-49'],[3,'gym1-77'],[1,'gym1-44'],[4,'gym1-78'],[1,'gym1-46'],[1,'gym1-45'],[1,'gym1-5'],[4,'gym1-79'],[1,'gym1-42'],
 [1,'gym1-107'],[1,'gym1-110'],[1,'gym1-100'],[2,'base2-64'],[2,'base1-94'],[3,'base1-95'],[22,'gym1-129'],[6,'gym1-131']],
 koga:[
 [4,'gym2-82'],[2,'gym2-47'],[1,'gym2-9'],[3,'gym2-77'],[3,'gym2-78'],[3,'gym2-79'],[1,'gym2-48'],[2,'gym2-50'],[3,'gym2-80'],
 [1,'base1-92'],[1,'gym2-114'],[1,'base1-82'],[2,'base1-93'],[1,'gym2-106'],[1,'base1-84'],[3,'base1-94'],[28,'gym2-129']],
 sabrina:[
 [2,'gym2-93'],[2,'gym2-94'],[2,'gym2-58'],[1,'gym2-16'],[3,'gym2-95'],[4,'gym2-96'],[2,'gym2-55'],[2,'gym2-57'],[3,'gym2-98'],
 [2,'base1-91'],[2,'base1-94'],[1,'gym2-110'],[2,'gym1-125'],[1,'gym2-121'],[1,'gym2-122'],[2,'base1-95'],[28,'gym2-131']],
 blaine:[
 [2,'gym1-62'],[2,'gym2-62'],[1,'gym2-1'],[3,'gym2-60'],[2,'gym2-31'],[2,'gym2-61'],[1,'gym2-32'],[4,'gym2-64'],[2,'gym2-33'],[2,'gym2-66'],
 [2,'base1-91'],[1,'gym2-100'],[1,'gym1-121'],[1,'gym2-113'],[1,'gym2-117'],[2,'base1-94'],[2,'gym2-124'],[1,'base1-90'],[28,'gym2-128']],
 giovanni:[
 [3,'gym2-75'],[1,'gym2-44'],[4,'gym2-76'],[2,'gym2-45'],[4,'gym2-72'],[2,'gym2-42'],[3,'gym2-74'],[1,'gym2-43'],[1,'gym2-8'],
 [2,'base1-91'],[2,'base1-92'],[1,'base1-82'],[1,'gym2-104'],[2,'base1-94'],[1,'gym2-123'],[2,'gym2-126'],[20,'gym2-129'],[8,'gym2-127']]
};
const meta={
 bodyguard:{name:'BodyGuard',set:'Fossil'},lockdown:{name:'LockDown',set:'Fossil'},
 grass_chopper:{name:'Grass Chopper',set:'Base Set 2'},hot_water:{name:'Hot Water',set:'Base Set 2'},lightning_bug:{name:'Lightning Bug',set:'Base Set 2'},psych_out:{name:'Psych Out',set:'Base Set 2'},
 devastation:{name:'Devastation',set:'Team Rocket'},trouble:{name:'Trouble',set:'Team Rocket'},
 brock:{name:'Brock',set:'Gym Heroes',gym:true},misty:{name:'Misty',set:'Gym Heroes',gym:true},surge:{name:'Lt. Surge',set:'Gym Heroes',gym:true},erika:{name:'Erika',set:'Gym Heroes',gym:true},
 koga:{name:'Koga',set:'Gym Challenge',gym:true},sabrina:{name:'Sabrina',set:'Gym Challenge',gym:true},blaine:{name:'Blaine',set:'Gym Challenge',gym:true},giovanni:{name:'Giovanni',set:'Gym Challenge',gym:true}
};
const expand=rows=>rows.flatMap(([count,id])=>Array(count).fill(id));
const list=key=>recipes[key]?expand(recipes[key]):null;
const entries=Object.keys(recipes).map(id=>({id,name:`${meta[id].name} · ${meta[id].set}`,set:meta[id].set,gym:Boolean(meta[id].gym)}));
const gymIds=Object.freeze([...new Set(entries.filter(e=>e.gym).flatMap(e=>list(e.id)).filter(id=>id.startsWith('gym')))]);
module.exports={recipes,meta,list,entries,gymIds};
