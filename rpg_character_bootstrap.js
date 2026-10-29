'use strict';
// Load the authorized character roster BEFORE any RPG systems initialize.
// Do not trust localStorage email: the server verifies the bearer with Supabase.
(async function(){
  const scripts=[
 "/rpg_sol_character.js",
 "/rpg_narrative_pack.js",
 "/rpg_relationships.js",
 "/rpg_side_quests.js",
 "/rpg_bond_chapters.js",
 "/rpg_everyday_chats.js",
 "/rpg_character_chats.js",
 "/rpg_group_chats.js",
 "/rpg_dialogue_memory.js",
 "/rpg_conversations.js",
 "/rpg_legacy_scenes.js",
 "/rpg_story.js",
 "/rpg_schedules.js",
 "/rpg_world.js",
 "/rpg_rival_arc.js",
 "/rpg_tournaments.js",
 "/rpg_competitive_loop.js",
 "/rpg_community.js",
 "/rpg_consequences.js",
 "/rpg_reactivity.js",
 "/rpg_duel_bridge.js",
 "/rpg_epilogue.js",
 "/rpg_appointments.js",
 "/rpg_time_coordinator.js",
 "/rpg_intentions.js",
 "/rpg_encounter_director.js",
 "/rpg_akari_barb_event.js?v=20261026",
 "/rpg_cross_character_events.js?v=20261026-crossovers",
 "/rpg_daisy_event_additions.js?v=1",
 "/rpg_slice_of_life.js",
 "/rpg_cg_gallery.js?v=20261028-art-fallback-2",
 "/rpg_cg_scene.js?v=20261026-in-scene",
 "/rpg_daily_planner.js",
 "/rpg_social_activities.js",
 "/rpg_planned_dates.js",
 "/rpg_preduel.js?v=20261024-preduel-art",
 "/rpg_situations.js",
 "/rpg_season_journey.js",
 "/rpg_collection.js",
 "/rpg_dialogue.js",
 "/duel_playmats.js?v=2",
 "/rpg_bond_rewards.js",
 "/rpg_partner_decks.js",
 "/rpg_npc_deck_progression.js",
 "/rpg_mandatory_events.js",
 "/rpg_season_events.js",
 "/rpg_audio.js",
 "/rpg_time_transitions.js",
 "/rpg_render_perf.js",
 "/rpg_ui_motion.js",
 "/rpg_character_motion.js",
 "/rpg_scene_cast.js?v=1",
 "/rpg_event_invites.js?v=1",
 "/rpg_victory_presentation.js",
 "/rpg_tournament_presentation.js",
 "/rpg_tutorials.js?v=1",
 "/rpg_status.js?v=4",
 "/rpg_cloud_save.js?v=2",
 "/rpg_outfits.js?v=1",
 "/rpg.js?v=20261029-overworld-arrival-guard-1"
];
  function registry(packs){
    const cast={},looks={},schedules={},arrivals={},events=[],mandatoryEvents=[];
    for(const p of packs){
      cast[p.id]=p.cast;looks[p.id]=p.looks;schedules[p.id]=p.schedule;
      arrivals[p.id]=p.arrivalDay;
      events.push(...(p.events||[]));mandatoryEvents.push(...(p.mandatoryEvents||[]));
    }
    return Object.freeze({packs,cast,looks,schedules,arrivals,events,mandatoryEvents,byId:id=>packs.find(p=>p.id===id)||null});
  }
  try {
    const cached=JSON.parse(localStorage.getItem('neoRpgCloudSessionV1')||'null');
    let token=cached?.access_token||'';
    // Refresh stale sessions through the same Supabase identity provider as cloud saves.
    if(cached?.refresh_token && (!token||!Number.isFinite(Number(cached.expires_at))||Number(cached.expires_at)<=Date.now()+60000)){
      const config=await (await fetch('/api/rpg-cloud/config',{cache:'no-store'})).json();
      if(config.enabled){
        const response=await fetch(config.url+'/auth/v1/token?grant_type=refresh_token',{
          method:'POST',headers:{'apikey':config.key,'Content-Type':'application/json'},
          body:JSON.stringify({refresh_token:cached.refresh_token})
        });
        if(response.ok){
          const refreshed=await response.json();
          token=refreshed.access_token;
          const data={...cached,...refreshed,expires_at:Date.now()+Math.max(0,Number(refreshed.expires_in||3600)-60)*1000};
          localStorage.setItem('neoRpgCloudSessionV1',JSON.stringify(data));
        } else token='';
      }
    }
    const headers=token?{Authorization:'Bearer '+token}:{};
    const response=await fetch('/api/rpg/character-packs',{headers,cache:'no-store'});
    if(!response.ok)throw Error('Character roster unavailable');
    const data=await response.json();
    window.NeoRpgCharacterPacks=registry(data.packs||[]);
    window.NeoRpgExclusiveRosterLoaded=true;
  } catch(error) {
    // Fail closed: never load an unfiltered registry as a fallback.
    document.body.insertAdjacentHTML('beforeend','<p role="alert">Unable to load the RPG character roster. Reload to try again.</p>');
    window.NeoRpgErrorReport?.capture(error,{source:'startup',action:'load character roster'});
    console.error('RPG roster load failed',error);
    return;
  }
  // Browser downloads in parallel but run in insertion order (async=false).
  // Validate dependencies BEFORE launching rpg.js: a module can throw while
  // evaluating, yet its script still fires onload, leaving its global undefined.
  const loadScript=(src,optional=false)=>new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.async=false;
    if(optional)script.dataset.optionalScript='true';
    script.src=src;
    script.onload=resolve;
    script.onerror=()=>reject(Error('RPG script failed: '+src));
    document.body.appendChild(script);
  });
  // Each module may depend on globals established by an earlier script.
  // Await execution in declared order; parallel script insertion can race
  // module initialization and fail the required startup dependency checks.
  for(const src of scripts.slice(0,-1)) await loadScript(src);
  const dependencies={
    NeoRpgRelationships:'apply',NeoRpgEncounterDirector:'select',
    NeoRpgAkariBarbFitting:'event',NeoRpgCrossCharacterEvents:'events',NeoRpgSliceOfLife:'byId',
    NeoHarborStory:'resolve',NeoRpgEventInvites:'dialogue',
    NeoRpgCGGallery:'record',NeoRpgTimeCoordinator:'conflicts'
  };
  for(const [globalName,method] of Object.entries(dependencies)){
    const module=window[globalName];
    if(!module||!(method in module)){
      throw Error('Missing RPG dependency '+globalName+'.'+method+' before RPG startup');
    }
  }
  // Artwork inventory is optional: a stale Render deploy or missing static file
  // must never prevent the campaign from starting.
  window.NeoRpgArtManifest=[];
  await loadScript('/rpg_art_manifest.js?v=20261029-outfit-catalog-2',true).catch(error=>{
    console.warn('Optional RPG art inventory unavailable; continuing without additional gallery entries',error);
  });
  await loadScript(scripts.at(-1));
})().catch(error=>{window.NeoRpgErrorReport?.capture(error,{source:'startup',action:'load RPG scripts'});console.error('RPG startup failed',error);});
