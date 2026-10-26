'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const CG_SCENE=require('../rpg_cg_scene');

const entries=[
 {id:'fitting_01',trigger:'slice',title:'Fitting begins'},
 {id:'fitting_02',trigger:'slice',title:'Fitting continues'},
 {id:'hana_route_1',trigger:'story_milestone',sceneId:'hana_route_1',title:'Personal route'},
 {id:'reina_moment',trigger:'situation',situationId:'reina_moment',title:'A surprise'},
 {id:'meeting',trigger:'meet',title:'Meeting'}
];
const slice={byId:id=>id==='fitting'?{id,choices:[{label:'Help'}],cgSequence:['fitting_01','fitting_02']}:null};

test('a multi-CG slice begins with the first image and switches at its authored step',()=>{
 const state={activeSliceOfLife:{id:'fitting',step:0}};
 assert.equal(CG_SCENE.select(state,entries,slice,{}).entry.id,'fitting_01');
 state.activeSliceOfLife.step=3;
 assert.equal(CG_SCENE.select(state,entries,slice,{}).entry.id,'fitting_01');
 state.activeSliceOfLife.step=4;
 assert.equal(CG_SCENE.select(state,entries,slice,{}).entry.id,'fitting_02');
 state.activeSliceOfLife=null;
 assert.equal(CG_SCENE.select(state,entries,slice,{}),null);
});
test('story and surprise CGs preview during dialogue and brief memories end with dialogue',()=>{
 const story={activeStory:{id:'hana_route_1',phase:'lines',index:0}};
 assert.deepEqual(CG_SCENE.select(story,entries,slice,{}),{entry:entries[2],preview:true});
 const situation={activeSituation:{id:'reina_moment',phase:'choice'}};
 assert.deepEqual(CG_SCENE.select(situation,entries,slice,{}),{entry:entries[3],preview:true});
 const brief={sceneCgId:'meeting'};
 assert.equal(CG_SCENE.select(brief,entries,slice,{line:'Hello!'}).entry.id,'meeting');
 assert.equal(CG_SCENE.select(brief,entries,slice,{line:'',choices:[]}),null);
});
test('loading a new image retains the previous frame, then swaps; stale loads cannot restore it',()=>{
 const active=new Set(),loaders=[],image={hidden:true,src:'',alt:'',removeAttribute(){this.src='';}};
 const stage={classList:{add:x=>active.add(x),remove:x=>active.delete(x)}};
 const dom={createElement:()=>{const el={src:'',onload:null,onerror:null};loaders.push(el);return el;}};
 const presenter=CG_SCENE.create(stage,image,dom);
 let shown=0;
 presenter.show(entries[0],[{kind:'portrait',path:'/portrait.webp'},{kind:'event',path:'/first.webp'}],()=>shown++);
 assert.equal(loaders.length,1);
 assert.equal(image.hidden,true);
 loaders[0].onload();
 assert.equal(image.src,'/first.webp');
 assert.equal(shown,1);
 assert.equal(active.has('has-story-cg'),true);
 presenter.show(entries[1],[{kind:'event',path:'/second.webp'}],()=>shown++);
 assert.equal(image.src,'/first.webp');
 loaders[1].onload();
 assert.equal(image.src,'/second.webp');
 assert.equal(presenter.hasShown('fitting_01'),true);
 assert.equal(presenter.hasShown('fitting_02'),true);
 presenter.show(entries[0],[{kind:'event',path:'/late.webp'}],()=>shown++);
 presenter.clear();
 loaders[2].onload();
 assert.equal(shown,2);
 assert.equal(image.hidden,true);
 assert.equal(active.has('has-story-cg'),false);
});
test('missing CG files release the scene and restore normal portraits',()=>{
 const active=new Set(),loaders=[];
 const image={hidden:true,src:'',removeAttribute(){}};
 const scene={classList:{add:x=>active.add(x),remove:x=>active.delete(x)}};
 const presenter=CG_SCENE.create(scene,image,{createElement:()=>{const x={};loaders.push(x);return x;}});
 let missing=0;
 presenter.show(entries[0],[{kind:'event',path:'/not-installed.webp'}],null,()=>missing++);
 loaders[0].onerror();
 assert.equal(missing,1);
 assert.equal(presenter.visibleId,null);
 assert.equal(active.has('has-story-cg'),false);
 assert.equal(image.hidden,true);
});
