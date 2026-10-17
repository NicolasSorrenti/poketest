import asyncio, json, copy, os
from playwright.async_api import async_playwright

base='http://127.0.0.1:8315'

def player(name, active, bench):
    unit=lambda id: {'id':id,'damage':0,'energies':[],'attachedTrainers':[],'under':[],'playedTurn':0}
    return {'name':name, 'active':unit(active),'bench':[unit(x) for x in bench], 'hand':[],'handCount':0,'deckCount':35,'discard':[],'prizeCount':6}

p0=player('You','base1-15',['base1-2','base1-9'])
p1=player('Opponent','base1-4',['base1-14','base1-1'])
# Get card names from archive
cards={c['id']:c for c in json.load(open(os.path.join(os.path.dirname(__file__), 'cards/base1.json')))}

def fixture(kind,player_side=0):
    pa=[copy.deepcopy(p0),copy.deepcopy(p1)]
    if kind=='gust':
        opts=[{'id':'bench:0','label':cards['base1-14']['name']}]
        label='Choose opponent replacement';minimum=maximum=1
    elif kind=='potion':
        opts=[{'id':'slot:-1','label':'Active: '+cards['base1-15']['name']},{'id':'slot:0','label':'Bench: '+cards['base1-2']['name']}]
        label='Choose one of your Pokémon';minimum=maximum=1
    elif kind=='modal':
        opts=[{'id':'energy:0','label':'Fire Energy'},{'id':'energy:1','label':'Water Energy'}]
        label='Choose attached Energy to discard';minimum=maximum=1
    elif kind=='multi':
        opts=[{'id':'bench:0','label':cards['base1-2']['name']},{'id':'bench:1','label':cards['base1-9']['name']}]
        label='Choose 2 of your Benched Pokémon';minimum=maximum=2
    elif kind=='online':
        opts=[{'id':'slot:-1','label':'Active: '+cards['base1-4']['name']},{'id':'slot:0','label':'Bench: '+cards['base1-14']['name']}]
        label='Choose one of your Pokémon';minimum=maximum=1
    else:raise Exception(kind)
    if player_side==1 and kind=='online':
        # Player 1 is the choosing online guest; own Pokémon are on player 1's field.
        pass
    d={'id':kind+'-decision','actor':player_side,'kind':'pokemon-target' if kind!='modal' else 'energy-discard','label':label,'min':minimum,'max':maximum,'optional':False,'options':opts}
    state={'revision':2,'view':{'phase':'game','turn':player_side,'round':4,'over':False,'players':pa,'pendingDecision':d,'messages':[]},'winner':None,'turnSerial':9,'activity':[]}
    return state

async def main():
    import re
    root=os.path.dirname(os.path.abspath(__file__))+'/'
    catalogs={setname:json.load(open(root+'cards/'+setname+'.json')) for setname in ['base1','base2','base3','base4','base5','gym1','gym2','neo1','neo2','neo3','neo4']}
    async with async_playwright() as pw:
      browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
      try:
        for kind in ['gust','potion','modal','multi','online','mobile']:
          is_online=kind=='online';scenario='modal' if kind=='mobile' else kind
          state=fixture(scenario,1 if is_online else 0)
          page=await browser.new_page(viewport={'width':390 if kind=='mobile' else 1100,'height':780})
          errors=[]
          page.on('pageerror',lambda err:errors.append(str(err)))
          html=open(root+('online.html' if is_online else 'classic_live.html')).read()
          html=re.sub(r'<script\s+src="[^"]+"[^>]*></script>','',html)
          html=re.sub(r'<link\s+rel="stylesheet"[^>]*>','',html)
          await page.set_content(html)
          await page.add_style_tag(content=open(root+'classic_live.css').read())
          await page.evaluate('''(data)=>{
            const cache={};
            Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>cache[k]??null,setItem:(k,v)=>cache[k]=v,removeItem:k=>delete cache[k]}});
            const session={};
            Object.defineProperty(window,'sessionStorage',{configurable:true,value:{getItem:k=>session[k]??null,setItem:(k,v)=>session[k]=v,removeItem:k=>delete session[k]}});
            window.__recorded=[];window.__game=data.state;window.__online=data.isOnline;window.__cards=data.cards;
            window.fetch=async (url,options={})=>{
              let answer=null;url=String(url);
              if(url.startsWith('/cards/'))answer=window.__cards[url.split('/').pop().replace('.json','')];
              else if(url.endsWith('/decks'))answer={decks:[{id:'blackout',name:'Blackout'},{id:'brushfire',name:'Brushfire'}]};
              else if(url.endsWith('/create'))answer=window.__online?{
                ...window.__game,token:'mock',code:'ABCD12',you:1,started:true,joined:true,
                players:[{name:'Host',ready:true},{name:'Guest',ready:true}],me:{energyUsed:false}
              }:{...window.__game,token:'mock',you:{energyUsed:false}};
              else if(url.includes('/state'))answer={...window.__game,you:1,started:true,players:[{name:'Host'},{name:'Guest'}],code:'ABCD12',chatSeq:0,chatMessages:[]};
              else if(url.endsWith('/action')){
                const parsed=JSON.parse(options.body||'{}');window.__recorded.push(parsed.command);
                answer=JSON.parse(JSON.stringify(window.__game));answer.revision++;
                answer.view.pendingDecision=null;window.__game=answer;
                answer=window.__online?{...answer,you:1,me:{energyUsed:false},code:'ABCD12',started:true,players:[{name:'Host'},{name:'Guest'}]}:{...answer,you:{energyUsed:false}};
              }
              return {ok:answer!==null,status:answer===null?404:200,json:async()=>answer};
            };
          }''',{'state':state,'cards':catalogs,'isOnline':is_online})
          for src in ['core_rules.js','duel_quick_ui.js','battle_decision_ui.js','online.js' if is_online else 'classic_live.js']:
            await page.add_script_tag(content=open(root+src).read())
          await page.wait_for_timeout(250)
          await page.locator('#createRoom' if is_online else '#newDuel').click()
          await page.wait_for_timeout(200)
          assert not errors,errors
          assert await page.locator('#duel').is_visible(),(kind,await page.locator('#startupError').inner_text())
          if kind=='gust':
            assert await page.locator('#enemyBench .decision-target').count()==1
            assert await page.locator('#myBench .decision-target').count()==0
            assert not await page.locator('#choiceModal').is_visible()
            await page.locator('#enemyBench .decision-target').click()
            assert (await page.evaluate('window.__recorded')).pop()['payload']['selected']==['bench:0']
          elif kind=='potion':
            assert await page.locator('#myActive .decision-target').count()==1
            assert await page.locator('#myBench .decision-target').count()==1
            assert not await page.locator('#choiceModal').is_visible()
            await page.locator('#myActive .decision-target').click()
            assert (await page.evaluate('window.__recorded')).pop()['payload']['selected']==['slot:-1']
          elif kind=='modal':
            assert await page.locator('#choiceModal').is_visible()
            assert await page.locator('#choiceModalContent').evaluate('(el)=>{const x=el.getBoundingClientRect();return Math.abs((x.left+x.width/2)-(innerWidth/2))<5}')
            await page.locator('#choiceModal .choice-list input').first.check()
            await page.locator('#choiceModal button.primary').click()
            assert (await page.evaluate('window.__recorded')).pop()['payload']['selected']==['energy:0']
          elif kind=='multi':
            assert await page.locator('#myBench .decision-target').count()==2
            await page.locator('#myBench .decision-target').nth(0).click()
            await page.locator('#myBench .decision-target').nth(1).click()
            assert await page.locator('#myBench .chosen').count()==2
            await page.locator('#fieldChoiceBar button.primary').click()
            assert set((await page.evaluate('window.__recorded')).pop()['payload']['selected'])=={'bench:0','bench:1'}
          elif kind=='online':
            assert await page.locator('#myActive .decision-target').count()==1
            assert await page.locator('#enemyActive .decision-target').count()==0
            await page.locator('#myActive .decision-target').click()
            assert (await page.evaluate('window.__recorded')).pop()['payload']['selected']==['slot:-1']
          elif kind=='mobile':
            assert await page.locator('#choiceModal').is_visible()
            assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth+3')
          print('PASS browser',kind,'UI renders and interactions work')
          await page.close()
      finally:await browser.close()
asyncio.run(main())
