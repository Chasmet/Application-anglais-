const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..');
const source=file=>fs.readFileSync(path.join(root,file),'utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function page(t,file,options={}){
  const errors=[],console=new VirtualConsole();console.on('jsdomError',error=>errors.push(error.message));
  const dom=new JSDOM(source(file),{url:'https://example.test/'+file+(options.query||''),runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:console});
  const w=dom.window;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.alert=()=>{};
  for(const [key,value]of Object.entries(options.storage||{}))w.localStorage.setItem(key,value);
  const calls=[];w.AndroidTTS={stop(){calls.push({stop:true});},speakRequest(text,rate,language,id){calls.push({text,rate,language,id});if(!options.manualAudio)queueMicrotask(()=>w.onNativeTtsFinished?.(id,'done'));},preload(){}};
  w.addEventListener('error',event=>errors.push(event.message));
  t.after(()=>{w.close();assert.deepEqual(errors,[],file+' runtime errors');});
  for(const script of w.document.querySelectorAll('script')){const text=script.src?source(new URL(script.src).pathname.slice(1)):script.textContent;if(text)w.eval(text);}
  await tick();return{w,d:w.document,calls,storage:()=>Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)]))};
}
for(const file of fs.readdirSync(root).filter(x=>x.endsWith('.html')))test('startup: '+file,async t=>{await page(t,file);});
test('oral grading preserves negation, numbers and word order',()=>{
  const grade=require('../speech-evaluation.js').evaluate;
  assert.equal(grade("I’m not allergic to peanuts.",{expected:'I am not allergic to peanuts.'}).score,100);
  assert.ok(grade('I am allergic to peanuts',{expected:'I am not allergic to peanuts'}).score<=25);
  assert.ok(grade('Peanuts to allergic am I',{expected:'I am allergic to peanuts'}).score<100);
  assert.ok(grade('I need two tickets',{expected:'I need three tickets'}).score<=40);
  assert.equal(grade('Thanks',{expected:'Thank you.',accepted:['Thanks.']}).accepted,true);
});
test('one audio request: late callbacks cannot end the next phrase',async t=>{
  const {w,calls}=await page(t,'settings.html',{manualAudio:true});
  const a=w.LearningAudio.speak('First'),first=calls.at(-1).id;
  const b=w.LearningAudio.speak('Second'),second=calls.at(-1).id;
  assert.equal(await a,'cancelled');w.onNativeTtsFinished(first);assert.equal(w.LearningAudio.isBusy(),true);
  w.onNativeTtsFinished(second);assert.equal(await b,'done');assert.equal(w.LearningAudio.isBusy(),false);
});
test('backup round trip preserves all profiles and rejects foreign keys before mutation',async t=>{
  const {w}=await page(t,'settings.html');const store=w.LearningStore;
  w.localStorage.setItem('qa3_stats_Yvane','{"xp":80}');w.localStorage.setItem('qa3_stats_Nelvyn','{"xp":55}');w.localStorage.setItem('unrelated','untouched');
  const backup=store.exportData();store.write('qa3_stats_Yvane',{xp:0});store.importData(backup);
  assert.equal(store.read('qa3_stats_Yvane',{}).xp,80);assert.equal(store.read('qa3_stats_Nelvyn',{}).xp,55);
  const bad=JSON.parse(backup);bad.entries.unrelated='changed';assert.throws(()=>store.importData(JSON.stringify(bad)));assert.equal(w.localStorage.getItem('unrelated'),'untouched');
  assert.throws(()=>store.importData('{bad'));assert.throws(()=>store.importData(JSON.stringify({...bad,schema:2})));
});
test('backup rolls back a partial write failure',async t=>{
  const {w}=await page(t,'settings.html');const proto=w.Storage.prototype,original=proto.setItem;
  w.localStorage.setItem('adultXp','20');let fail=true;
  proto.setItem=function(key,value){if(key==='adultDone'&&fail){fail=false;throw new Error('quota');}return original.call(this,key,value);};
  assert.throws(()=>w.LearningStore.importData(JSON.stringify({app:'AnglaisPlus',schema:1,entries:{adultXp:'99',adultDone:'3'}})));
  assert.equal(w.localStorage.getItem('adultXp'),'20');assert.equal(w.localStorage.getItem('adultDone'),null);proto.setItem=original;
});
test('daily awards only once and sessions remain separate for each profile',async t=>{
  const {w}=await page(t,'settings.html'),s=w.LearningStore;
  s.setProfile('Yvane');assert.equal(s.markActivity('lesson:one'),true);assert.equal(s.markActivity('lesson:one'),false);s.saveSession('quiz',{index:3});
  s.setProfile('Nelvyn');assert.equal(s.getSession('quiz'),null);s.saveSession('quiz',{index:1});s.setProfile('Yvane');assert.equal(s.getSession('quiz').index,3);
});
test('quiz reload after Continue does not skip an unanswered question',async t=>{
  const p=await page(t,'quiz.html');p.d.getElementById('grammarBtn').click();p.d.querySelector('.answer').click();p.d.getElementById('validate').click();p.d.getElementById('validate').click();
  const saved=p.w.LearningStore.getSession('quiz');assert.equal(saved.index,1);assert.equal(saved.validated,false);
  const q=await page(t,'quiz.html',{storage:p.storage(),query:'?resume=1'});assert.match(q.d.getElementById('questionMeta').textContent,/Question 2 sur/);
});
test('quiz reload after validation keeps the score and moves forward once',async t=>{
  const p=await page(t,'quiz.html');p.d.getElementById('grammarBtn').click();p.d.querySelector('.answer').click();p.d.getElementById('validate').click();
  const saved=p.w.LearningStore.getSession('quiz'),q=await page(t,'quiz.html',{storage:p.storage(),query:'?resume=1'});
  assert.equal(q.w.LearningStore.getSession('quiz').score,saved.score);assert.match(q.d.getElementById('questionMeta').textContent,/Question 2 sur/);
});
test('profile selection persists into the quiz',async t=>{
  const p=await page(t,'quiz.html');p.d.querySelector('[data-profile="Nelvyn"]').click();const q=await page(t,'quiz.html',{storage:p.storage()});assert.equal(q.d.querySelector('[data-profile].selected').dataset.profile,'Nelvyn');
});
test('guided answers have equal hints before choosing; feedback waits for Continue',async t=>{
  const p=await page(t,'adult-conversation.html');p.d.querySelector('.scenarioCard').click();const buttons=[...p.d.querySelectorAll('#answerGrid .answerBtn')];
  assert.ok(buttons.length>1);assert.ok(buttons.every(b=>!b.querySelector('.pron,.fr')));
  buttons[0].click();assert.equal(p.d.querySelector('#answerGrid button').textContent,'Continuer');assert.equal(p.w.LearningStore.getSession('adultConversation').step,1);
  const q=await page(t,'adult-conversation.html',{storage:p.storage(),query:'?resume=1'});assert.match(q.d.getElementById('stepLabel').textContent,/Étape 2/);
});
test('training resumes with its existing order and skips only a validated question',async t=>{
  const p=await page(t,'adult-training.html');p.d.querySelector('#ta button').click();const saved=p.w.LearningStore.getSession('adultTraining');
  const q=await page(t,'adult-training.html',{storage:p.storage(),query:'?resume=1'});assert.match(q.d.getElementById('trainStep').textContent,/Question 2/);assert.deepEqual(Array.from(q.w.LearningStore.getSession('adultTraining').order),Array.from(saved.order));
});
test('oral content is contextual English, 160 entries and paginated by 24',async t=>{
  const p=await page(t,'adult-oral.html');const scenarios=p.w.ADULT_ORAL_SCENARIOS;
  assert.equal(scenarios.length,160);assert.equal(new Set(scenarios.map(s=>s.id)).size,160);
  for(const s of scenarios)for(const turn of s.turns){assert.ok(turn.npc&&turn.expected&&turn.fr);assert.doesNotMatch(turn.npc+' '+turn.expected,/[éàêèçù]/i);}
  assert.ok(new Set(scenarios.flatMap(s=>s.turns.map(t=>t.expected))).size>150);
  assert.equal(p.d.querySelectorAll('.oralScenario').length,24);p.d.getElementById('oralMore').click();assert.equal(p.d.querySelectorAll('.oralScenario').length,48);
  p.d.querySelector('.oralScenario').click();p.d.getElementById('oralTyped').value=scenarios[0].turns[0].expected;p.d.getElementById('submitTyped').click();assert.match(p.d.getElementById('coachScore').textContent,/reconnue/);
});
test('passive pause cancels native audio; a late completion cannot continue',async t=>{
  const p=await page(t,'passive-oral.html',{manualAudio:true});assert.equal(p.d.getElementById('programTotal').textContent,'60');p.d.getElementById('play').click();const first=p.calls.at(-1).id;
  p.d.getElementById('pause').click();assert.equal(p.calls.at(-1).stop,true);p.w.onNativeTtsFinished(first);await tick();assert.equal(p.calls.filter(c=>c.id).length,1);
  p.d.getElementById('play').click();assert.equal(p.calls.filter(c=>c.id).length,2);p.d.getElementById('next').click();await tick();assert.equal(p.calls.filter(c=>c.id).length,3);
});
test('web settings finish immediately without a native updater',async t=>{
  const {d}=await page(t,'settings.html');assert.equal(d.getElementById('checkUpdate').disabled,true);assert.match(d.getElementById('updateStatus').textContent,/version web/);
});
test('decimal number input is rejected instead of silently truncated',async t=>{
  const {d}=await page(t,'chiffres.html');d.getElementById('numberInput').value='12.5';d.getElementById('convertNumber').click();assert.match(d.getElementById('numberEn').textContent,/non pris en charge/);
});
test('all local HTML dependencies exist and are packaged for Android',()=>{
  const gradle=source('android/app/build.gradle');
  for(const file of fs.readdirSync(root).filter(x=>x.endsWith('.html'))){const dom=new JSDOM(source(file));for(const el of dom.window.document.querySelectorAll('script[src],link[rel="stylesheet"]')){const asset=(el.getAttribute('src')||el.getAttribute('href')).split('?')[0];if(/^https?:/.test(asset))continue;assert.ok(fs.existsSync(path.join(root,asset)),asset);assert.ok(gradle.includes("'"+asset+"'"),'Android asset missing: '+asset);}dom.window.close();}
});
test('oral completion can be followed by interruption and navigation without errors',async t=>{
  const p=await page(t,'adult-oral.html');p.d.querySelector('.oralScenario').click();const scenario=p.w.ADULT_ORAL_SCENARIOS[0];
  for(const turn of scenario.turns){p.d.getElementById('oralTyped').value=turn.expected;p.d.getElementById('submitTyped').click();p.d.getElementById('continueOral').click();}
  assert.match(p.d.getElementById('oralSession').textContent,/Discussion terminée/);
  p.w.dispatchEvent(new p.w.Event('learning-interrupted'));p.w.dispatchEvent(new p.w.Event('pagehide'));assert.equal(p.w.LearningStore.getSession('adultOral'),null);
});
test('typing correction treats user markup as text',async t=>{
  const p=await page(t,'quiz.html');p.w.LearningStore.saveSession('quiz',{profile:'Yvane',level:'debutant',mission:{id:'test'},rounds:[{type:'typing',item:{en:'Good morning.',fr:'Bonjour.'}}],index:0,score:0,hearts:5,xpEarned:0,validated:false});
  const q=await page(t,'quiz.html',{storage:p.storage(),query:'?resume=1'});const input=q.d.getElementById('typingInput');input.value='<img src=x onerror=alert(1)>';input.dispatchEvent(new q.w.Event('input'));q.d.getElementById('validate').click();await tick();assert.equal(q.d.querySelectorAll('#feedback img,#reveal img,#correctionPlus img').length,0);assert.equal(q.d.querySelectorAll('[onerror]').length,0);
});

test('classic menu keeps the original training and adds reading type 2',async t=>{
  const p=await page(t,'classic.html');
  assert.equal(p.d.querySelector('a[href="quiz.html"] strong').textContent,'Entraînement');
  assert.equal(p.d.querySelector('a[href="training-reading.html"] strong').textContent,'Entraînement type 2');
});
test('reading type 2 completes a varied session with no audio or microphone',async t=>{
  const p=await page(t,'training-reading.html');
  p.w.SpeechRecognition=p.w.webkitSpeechRecognition=function(){throw new Error('Microphone forbidden in reading mode');};
  p.w.LearningAudio.speak=()=>{throw new Error('Audio forbidden in reading mode');};
  p.d.querySelector('[data-quick="10"]').click();
  const rounds=p.w.LearningStore.getSession('quizReading').rounds;
  assert.ok(rounds.some(q=>q.type==='reading'));assert.ok(rounds.some(q=>q.type==='sentence'));assert.ok(rounds.some(q=>q.type==='dialogue'));
  assert.ok(rounds.every(q=>!['audio','listenEnglish','typing'].includes(q.type)));
  for(const q of rounds){
    assert.equal(p.d.querySelectorAll('.audioPanel,#speakNormal,#speakSlow').length,0);
    assert.doesNotMatch(p.d.getElementById('instruction').textContent,/entendue|écoute/i);
    if(q.type==='pairs'){
      for(const en of p.d.querySelectorAll('.pairBtn[data-side="en"]')){en.click();p.d.querySelector(`.pairBtn[data-side="fr"][data-pair="${en.dataset.pair}"]`).click();}
    }else if(q.type==='sentence'){
      assert.ok(p.d.getElementById('exercise').textContent.includes(q.item.fr));
      for(const token of p.d.querySelectorAll('#tokenBank .token'))token.click();
    }else{
      if(q.type==='reading')assert.equal(p.d.querySelector('.promptCard').textContent,q.item.en);
      p.d.querySelector('.answer,.trueBtn').click();
    }
    assert.equal(p.d.getElementById('validate').disabled,false);p.d.getElementById('validate').click();
    await new Promise(r=>setTimeout(r,45));
    assert.equal(p.d.querySelector('#correctionSpeak'),null);assert.ok(p.d.getElementById('reveal').classList.contains('show'));
    p.d.getElementById('validate').click();
  }
  assert.ok(p.d.getElementById('result').classList.contains('active'));
  assert.equal(p.w.LearningStore.getSession('quizReading'),null);
  assert.equal(p.calls.filter(c=>c.id).length,0);
});
test('reading progress and resume are independent from the original training',async t=>{
  const p=await page(t,'quiz.html');p.d.querySelector('[data-quick="5"]').click();
  const original=p.w.LearningStore.getSession('quiz'),storage=p.storage();
  storage.qa3_stats_Yvane=JSON.stringify({xp:230,best:90});
  const reading=await page(t,'training-reading.html',{storage});reading.d.querySelector('[data-quick="5"]').click();
  reading.d.querySelector('.answer').click();reading.d.getElementById('validate').click();
  const resumed=await page(t,'training-reading.html',{storage:reading.storage(),query:'?resume=1'});
  assert.match(resumed.d.getElementById('questionMeta').textContent,/Question 2 sur 5/);
  assert.deepEqual(JSON.parse(JSON.stringify(resumed.w.LearningStore.getSession('quiz'))),JSON.parse(JSON.stringify(original)));
  assert.equal(resumed.w.localStorage.getItem('qa3_stats_Yvane'),storage.qa3_stats_Yvane);
  const backup=JSON.parse(resumed.w.LearningStore.exportData());assert.ok(backup.entries.learning_session_quizReading_Yvane);assert.ok(backup.entries.qa3_reading_mastery_Yvane);
  const home=await page(t,'index.html',{storage:resumed.storage()});home.d.dispatchEvent(new home.w.Event('DOMContentLoaded'));
  assert.equal(home.d.getElementById('resumeLearning').getAttribute('href'),'training-reading.html?resume=1');
  const originalAgain=await page(t,'quiz.html',{storage:resumed.storage(),query:'?resume=1'});
  assert.match(originalAgain.d.getElementById('questionMeta').textContent,/Question 1 sur 5/);assert.ok(originalAgain.d.getElementById('speakNormal'));assert.ok(originalAgain.calls.some(c=>c.id));
});
test('reading type 2 daily, level test, review, themes and roadmap stay silent',async t=>{
  for(const level of ['debutant','moyen','confirme']){
    const p=await page(t,'training-reading.html');p.w.LearningAudio.speak=()=>{throw new Error('Unexpected audio');};
    p.d.querySelector(`[data-level="${level}"]`).click();
    assert.doesNotMatch(p.d.getElementById('missions').textContent,/écoute|dictée/i);
    for(const start of [()=>p.d.getElementById('dailyBtn').click(),()=>p.d.getElementById('placementBtn').click(),()=>p.d.getElementById('grammarBtn').click(),()=>p.d.querySelector('[data-theme]').click(),()=>{p.d.querySelector('.mission').click();p.d.getElementById('startMission').click();}]){
      start();const rounds=p.w.LearningStore.getSession('quizReading').rounds;assert.ok(rounds.every(q=>!['audio','listenEnglish','typing'].includes(q.type)));
      p.d.getElementById('backBtn').click();
    }
    p.w.LearningStore.write(`qa3_reading_mistakes_Yvane`,[{id:'reading:cat',type:'reading',item:{en:'cat',fr:'chat',level},level}]);
    p.d.getElementById('backBtn').click();p.d.getElementById('reviewBtn').click();assert.equal(p.d.querySelector('.promptCard').textContent,'cat');
    assert.equal(p.calls.filter(c=>c.id).length,0);
  }
});
