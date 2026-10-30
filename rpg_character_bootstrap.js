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
 "/rpg_scene_cast.js?v=two-voice-window-20261029",
 "/rpg_event_invites.js?v=1",
 "/rpg_victory_presentation.js",
 "/rpg_tournament_presentation.js",
 "/rpg_tutorials.js?v=1",
 "/rpg_status.js?v=4",
 "/rpg_cloud_save.js?v=cloud-login-visible-20261030",
 "/rpg_outfits.js?v=1",
 "/rpg.js?v=rpg-duel-deck-recovery-20261030"
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
      // On Cloudflare Pages the authenticated /api routes may not exist.
      // Treat missing configuration as static hosting, not a fatal startup error.
      let config=null;
      try {
        let response=await fetch('/api/rpg-cloud/config',{cache:'no-store'}).catch(()=>null);
        if(response?.ok&&response.headers.get('content-type')?.includes('application/json'))config=await response.json();
        if(!config?.enabled){response=await fetch('/rpg-cloud-config.json',{cache:'no-store'}).catch(()=>null);if(response?.ok&&response.headers.get('content-type')?.includes('application/json'))config=await response.json();}
      }catch(error){console.warn('Cloud API config unavailable; checking public roster',error);}
      if(config?.enabled){
        const response=await fetch(config.url+'/auth/v1/token?grant_type=refresh_token',{
          method:'POST',headers:{'apikey':config.key,'Content-Type':'application/json'},
          body:JSON.stringify({refresh_token:cached.refresh_token})
        });
        if(response.ok){
          const refreshed=await response.json();
          token=refreshed.access_token;
          const data={...cached,...refreshed,expires_at:Date.now()+Math.max(0,Number(refreshed.expires_in||3600)-60)*1000};
          localStorage.setItem('neoRpgCloudSessionV1',JSON.stringify(data));
        }else token='';
      }
    }
    const headers=token?{Authorization:'Bearer '+token}:{};
    // Prefer server-verified entitlements when an API backend exists.
    // Static Cloudflare Pages has no /api/rpg/character-packs route: the build
    // publishes an explicitly filtered public roster, never the private packs.
    let data=null;
    try {
      const response=await fetch('/api/rpg/character-packs',{headers,cache:'no-store'});
      if(response.ok&&response.headers.get('content-type')?.includes('application/json')){
        data=await response.json();
      }else if(response.ok&&!response.headers.get('content-type')?.includes('application/json')){
        // Static Pages can return its HTML fallback with HTTP 200 for an
        // unimplemented API route. Use the filtered public JSON instead.
        console.warn('Character roster API returned non-JSON; using public roster');
      }else if(response.status!==404&&response.status!==405){
        throw Error('Character roster request failed (HTTP '+response.status+')');
      }
    }catch(error){
      if(!/Failed to fetch|NetworkError|fetch failed/i.test(String(error)))throw error;
      console.warn('Character roster API unreachable; checking filtered static roster',error);
    }
    if(!data){
      const response=await fetch('/rpg-character-packs.public.json',{cache:'no-store'});
      if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))throw Error('Character roster unavailable (public file HTTP '+response.status+')');
      data=await response.json();
    }
    if(!Array.isArray(data?.packs)||!data.packs.length)throw Error('Character roster unavailable (invalid public registry)');
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
  // Render restarts and intermittent mobile connections can fail a single
  // script request. Retry that dependency (not the entire campaign) in order.
  // A failed <script> did not execute, so removing it and retrying is safe.
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  async function loadScript(src,optional=false){
    const maxAttempts=optional?2:4;
    for(let attempt=1;attempt<=maxAttempts;attempt++){
      try{
        await new Promise((resolve,reject)=>{
          const script=document.createElement('script');
          script.async=false;
          if(optional)script.dataset.optionalScript='true';
          // Retry requests must bypass any cached transient 404/503 response.
          script.src=attempt===1?src:src+(src.includes('?')?'&':'?')+'retry='+attempt+'-'+Date.now();
          script.onload=()=>{script.onload=null;script.onerror=null;resolve();};
          script.onerror=()=>{
            script.onload=null;script.onerror=null;
            script.remove();
            reject(new Error('RPG script failed: '+src));
          };
          document.body.appendChild(script);
        });
        return;
      }catch(error){
        if(attempt===maxAttempts)throw new Error('RPG script failed after '+maxAttempts+' attempts: '+src,{cause:error});
        console.warn('Retrying RPG script after a loading error',src,'attempt',attempt);
        await wait(350*attempt);
      }
    }
  }
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
})().catch(error=>{
  window.NeoRpgErrorReport?.capture(error,{source:'startup',action:'load RPG scripts'});
  console.error('RPG startup failed',error);
  // A recoverable loading problem should not leave the player at a dead screen.
  // Reloading never clears the cloud/local save.
  if(document.getElementById('rpgScriptRetry'))return;
  const notice=document.createElement('div');
  notice.id='rpgScriptRetry';
  notice.setAttribute('role','alert');
  notice.style.cssText='position:fixed;z-index:2147483647;inset:auto 12px max(12px,env(safe-area-inset-bottom)) 12px;max-width:540px;margin:auto;border:1px solid #bc8aad;border-radius:14px;padding:16px;background:#17152a;color:white;box-shadow:0 12px 40px #0009;font:14px system-ui';
  const message=document.createElement('p');
  message.textContent='Neo Campus could not download a required game script. Your save is safe. Check your connection and try again.';
  const button=document.createElement('button');
  button.type='button';button.textContent='Retry loading Neo Campus';
  button.style.cssText='padding:10px 16px;border-radius:9px;border:1px solid #bf8fc3;background:#553763;color:white;font:700 14px system-ui';
  button.onclick=()=>location.reload();
  notice.append(message,button);
  document.body.appendChild(notice);
});
