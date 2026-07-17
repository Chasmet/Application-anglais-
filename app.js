(() => {
  const FALLBACK=[{en:'hello',fr:'bonjour',theme:'salutations',level:'debutant'},{en:'cat',fr:'chat',theme:'animaux',level:'debutant'},{en:'school',fr:'école',theme:'ecole',level:'debutant'},{en:'house',fr:'maison',theme:'maison',level:'debutant'}];
  const normaliseLevel=x=>x==='facile'?'debutant':x==='moyen'?'moyen':x==='confirme'?'confirme':'debutant';
  const dedupe=(items,keyFn)=>{const seen=new Set();return items.filter(x=>{const k=keyFn(x);if(!k||seen.has(k))return false;seen.add(k);return true})};
  const baseWords=Array.isArray(window.QUIZ_WORDS)?window.QUIZ_WORDS:FALLBACK;
  const WORDS=dedupe([...baseWords,...(window.QUIZ_EXTRA_WORDS||[])].map(x=>({...x,level:normaliseLevel(x.level),theme:x.theme==='mix'?'salutations':x.theme})),x=>String(x.en).toLowerCase());
  const basePhrases=Array.isArray(window.QUIZ_PHRASES)?window.QUIZ_PHRASES:[];
  const PHRASES=dedupe([...basePhrases,...(window.QUIZ_EXTRA_PHRASES||[])].map(x=>({...x,level:normaliseLevel(x.level),theme:x.theme||'actions'})),x=>String(x.en).toLowerCase());
  const DIALOGUES=Array.isArray(window.QUIZ_DIALOGUES)?window.QUIZ_DIALOGUES:[];
  const GRAMMAR=Array.isArray(window.QUIZ_GRAMMAR)?window.QUIZ_GRAMMAR:[];
  const LEVELS={debutant:{label:'Débutant',code:'A1',hearts:5},moyen:{label:'Moyen',code:'A2–B1',hearts:4},confirme:{label:'Confirmé',code:'B1–B2',hearts:3}};
  const ROADMAPS={
    debutant:[
      {id:'d1',title:'Premiers mots',count:5,modes:['audio','listenEnglish'],theme:'salutations'},
      {id:'d2',title:'Nombres et couleurs',count:6,modes:['reverse','pairs','truefalse'],theme:'nombres'},
      {id:'d3',title:'Famille et corps',count:7,modes:['audio','reverse','pairs'],theme:'famille'},
      {id:'d4',title:'Animaux',count:7,modes:['listenEnglish','pairs','truefalse'],theme:'animaux'},
      {id:'d5',title:'Maison et école',count:8,modes:['audio','reverse','grammar'],theme:'maison'},
      {id:'d6',title:'Nourriture',count:8,modes:['audio','sentence','cloze'],theme:'nourriture'},
      {id:'d7',title:'Actions simples',count:8,modes:['reverse','grammar','cloze'],theme:'actions'},
      {id:'d8',title:'Mini-dialogues',count:8,modes:['dialogue','listenEnglish','sentence'],theme:'all'},
      {id:'d9',title:'Révision intelligente',count:10,modes:['review','audio','reverse','grammar'],theme:'all'},
      {id:'d10',title:'Champion débutant',count:12,modes:['audio','listenEnglish','reverse','pairs','sentence','cloze','truefalse','dialogue','grammar'],theme:'all'}
    ],
    moyen:[
      {id:'m1',title:'Voyage et directions',count:7,modes:['audio','reverse','cloze'],theme:'voyage'},
      {id:'m2',title:'Météo et vêtements',count:8,modes:['listenEnglish','pairs','truefalse'],theme:'meteo'},
      {id:'m3',title:'Métiers et santé',count:8,modes:['audio','reverse','dialogue'],theme:'metiers'},
      {id:'m4',title:'Émotions et actions',count:9,modes:['cloze','sentence','grammar'],theme:'emotions'},
      {id:'m5',title:'Technologie',count:9,modes:['audio','typing','truefalse'],theme:'technologie'},
      {id:'m6',title:'Football+',count:9,modes:['pairs','listenEnglish','sentence'],theme:'football'},
      {id:'m7',title:'Grammaire pratique',count:10,modes:['grammar','cloze','typing'],theme:'all'},
      {id:'m8',title:'Conversations',count:10,modes:['dialogue','sentence','audio'],theme:'all'},
      {id:'m9',title:'Révision intelligente',count:10,modes:['review','audio','reverse','cloze'],theme:'all'},
      {id:'m10',title:'Champion moyen',count:14,modes:['audio','listenEnglish','reverse','pairs','sentence','cloze','truefalse','typing','dialogue','grammar'],theme:'all'}
    ],
    confirme:[
      {id:'c1',title:'Travail et projets',count:8,modes:['audio','reverse','cloze'],theme:'travail'},
      {id:'c2',title:'Société et opinions',count:9,modes:['truefalse','typing','sentence'],theme:'societe'},
      {id:'c3',title:'Environnement',count:9,modes:['listenEnglish','cloze','dialogue'],theme:'environnement'},
      {id:'c4',title:'Technologie avancée',count:10,modes:['audio','typing','grammar'],theme:'technologie'},
      {id:'c5',title:'Phrasal verbs',count:10,modes:['pairs','reverse','cloze'],theme:'phrasal'},
      {id:'c6',title:'Communication',count:10,modes:['dialogue','sentence','typing'],theme:'communication'},
      {id:'c7',title:'Grammaire confirmée',count:10,modes:['grammar','cloze','typing'],theme:'all'},
      {id:'c8',title:'Dictée et compréhension',count:11,modes:['audio','listenEnglish','typing','truefalse'],theme:'all'},
      {id:'c9',title:'Révision intelligente',count:12,modes:['review','grammar','cloze','typing'],theme:'all'},
      {id:'c10',title:'Champion confirmé',count:16,modes:['audio','listenEnglish','reverse','pairs','sentence','cloze','truefalse','typing','dialogue','grammar'],theme:'all'}
    ]
  };
  const THEME_LABELS={salutations:'👋 Salutations',nombres:'🔢 Nombres',couleurs:'🎨 Couleurs',famille:'👨‍👩‍👧 Famille',corps:'🧍 Corps',nourriture:'🍎 Nourriture',animaux:'🐯 Animaux',maison:'🏠 Maison',ecole:'📚 École',actions:'🏃 Actions',adjectifs:'✨ Adjectifs',sport:'⚽ Sport',temps:'🕐 Temps',ville:'🏙️ Ville',voyage:'✈️ Voyage',meteo:'🌦️ Météo',vetements:'👕 Vêtements',metiers:'🧑‍🔧 Métiers',sante:'🩺 Santé',emotions:'😊 Émotions',nature:'🌳 Nature',technologie:'💻 Technologie',football:'⚽ Football',commerce:'🛒 Commerce',travail:'💼 Travail',societe:'🌍 Société',environnement:'♻️ Environnement',abstrait:'🧠 Expressions',communication:'💬 Communication',phrasal:'🔗 Phrasal verbs',nuances:'🎯 Nuances'};
  const $=id=>document.getElementById(id),screens={home:$('home'),quiz:$('quiz'),result:$('result')};
  const state={profile:'Yvane',level:'debutant',mission:null,rounds:[],index:0,score:0,hearts:5,xpEarned:0,validated:false,selected:null,correct:null,pairFirst:null,pairMistakes:0,sentenceTokens:[],answerTokens:[],quick:false,special:null,recommended:null,installPrompt:null};

  function key(name){return `qa3_${name}_${state.profile}`}
  function read(name,def){try{return JSON.parse(localStorage.getItem(key(name)))??def}catch{return def}}
  function write(name,val){localStorage.setItem(key(name),JSON.stringify(val))}
  function levelKey(name){return `${name}_${state.level}`}
  function currentRoadmap(){return ROADMAPS[state.level]}
  function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
  function sample(a,n){return shuffle(a).slice(0,Math.min(n,a.length))}
  function show(name){Object.values(screens).forEach(s=>s.classList.remove('active'));screens[name].classList.add('active')}
  function starsText(n){return '★'.repeat(n)+'☆'.repeat(3-n)}
  function normalise(s){return String(s??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9' ]/g,'').replace(/\s+/g,' ').trim()}
  function escapeHtml(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]))}
  function vibrate(pattern){if(navigator.vibrate)navigator.vibrate(pattern)}
  function speak(text,rate=.82){if(window.AndroidTTS&&typeof window.AndroidTTS.speak==='function'){window.AndroidTTS.speak(String(text),Number(rate));return}if(!('speechSynthesis' in window))return;const u=new SpeechSynthesisUtterance(String(text));u.lang='en-US';u.rate=rate;u.pitch=1;window.speechSynthesis.cancel();window.speechSynthesis.speak(u)}
  function levelOf(x){return x?.level||'debutant'}
  function poolWords(level=state.level,theme='all'){let p=WORDS.filter(w=>level==='all'||levelOf(w)===level);if(theme!=='all'){const t=p.filter(w=>w.theme===theme);if(t.length>=4)p=t}return smartPool(p)}
  function poolPhrases(level=state.level,theme='all'){let p=PHRASES.filter(x=>level==='all'||levelOf(x)===level);if(theme!=='all'){const t=p.filter(x=>x.theme===theme);if(t.length>=2)p=t}return smartPool(p)}
  function poolDialogues(level=state.level){const p=DIALOGUES.filter(x=>level==='all'||levelOf(x)===level);return p.length?p:DIALOGUES}
  function poolGrammar(level=state.level){const p=GRAMMAR.filter(x=>level==='all'||levelOf(x)===level);return p.length?p:GRAMMAR}
  function smartPool(pool){const recent=read('recent',[]),fresh=pool.filter(x=>!recent.includes(x.en||x.question||x.prompt));return fresh.length>=8?fresh:pool}
  function rememberRounds(){const ids=state.rounds.flatMap(q=>q.type==='pairs'?q.item.map(x=>x.en):[q.item?.en||q.item?.question||q.item?.prompt]).filter(Boolean);write('recent',[...read('recent',[]),...ids].slice(-160))}
  function idFor(q){const x=q.item;return `${q.type}:${x?.en||x?.question||x?.prompt||'pairs'}`}
  function profileData(){return {stats:read('stats',{best:0,played:0,xp:0,streak:0,lastDay:'',dailyDay:''}),road:read(levelKey('road'),{}),mistakes:read('mistakes',[]),mastery:read('mastery',{})}}
  function saveMistake(q){const list=read('mistakes',[]),id=idFor(q);if(!list.some(x=>x.id===id)){list.push({id,type:q.type,item:q.item,level:state.level});write('mistakes',list.slice(-180))}}
  function removeMistake(q){const id=idFor(q);write('mistakes',read('mistakes',[]).filter(x=>x.id!==id))}
  function updateMastery(q,ok){if(q.type==='pairs'||q.type==='grammar'||q.type==='dialogue')return;const m=read('mastery',{}),id=idFor(q),old=m[id]||{right:0,wrong:0};if(ok)old.right++;else old.wrong++;m[id]=old;write('mastery',m)}
  function masteredCount(){return Object.values(read('mastery',{})).filter(x=>x.right>=3&&x.right>=x.wrong*2).length}
  function updateStreak(){const s=read('stats',{best:0,played:0,xp:0,streak:0,lastDay:'',dailyDay:''}),today=new Date().toISOString().slice(0,10);if(s.lastDay!==today){const y=new Date(Date.now()-86400000).toISOString().slice(0,10);s.streak=s.lastDay===y?(s.streak||0)+1:1;s.lastDay=today;write('stats',s)}}
  function modeLabel(m){return({audio:'écoute',listenEnglish:'écoute anglaise',reverse:'traduction',pairs:'paires',sentence:'phrase',cloze:'mot manquant',truefalse:'vrai/faux',typing:'dictée',dialogue:'dialogue',grammar:'grammaire',review:'révision'})[m]||m}
  function availableThemes(){const count={};WORDS.filter(w=>w.level===state.level).forEach(w=>count[w.theme]=(count[w.theme]||0)+1);return Object.entries(count).filter(([,n])=>n>=5).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([theme])=>theme)}

  function renderHome(){
    const d=profileData(),roadmap=currentRoadmap(),cycle=Number(localStorage.getItem(key(`cycle_${state.level}`))||1),total=roadmap.reduce((n,m)=>n+(d.road[m.id]?.stars||0),0),complete=roadmap.every(m=>d.road[m.id]?.passed);
    const wc=WORDS.filter(x=>x.level===state.level).length,pc=PHRASES.filter(x=>x.level===state.level).length,dc=DIALOGUES.filter(x=>x.level===state.level).length,gc=GRAMMAR.filter(x=>x.level===state.level).length;
    $('homeIntro').textContent=`${LEVELS[state.level].label} ${LEVELS[state.level].code} • parcours ${cycle}`;$('contentCount').textContent=`${wc} mots • ${pc} phrases • ${dc} dialogues • ${gc} quiz`;
    $('best').textContent=(d.stats.best||0)+'%';$('streak').textContent=d.stats.streak||0;$('mastered').textContent=masteredCount();$('reviewCount').textContent=d.mistakes.length;$('xpTop').textContent=d.stats.xp||0;$('roadTitle').textContent=`Roadmap ${LEVELS[state.level].label}`;$('roadStars').textContent=`${total}/${roadmap.length*3} ⭐`;$('reviewBtn').disabled=!d.mistakes.length;
    document.querySelectorAll('[data-level]').forEach(b=>b.classList.toggle('selected',b.dataset.level===state.level));
    $('themes').innerHTML=availableThemes().map(t=>`<button class="themeBtn" data-theme="${escapeHtml(t)}">${escapeHtml(THEME_LABELS[t]||t)}</button>`).join('');document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>startTheme(b.dataset.theme));
    $('missions').innerHTML='';roadmap.forEach((m,i)=>{const prev=i===0?{passed:true}:d.road[roadmap[i-1].id],p=d.road[m.id]||{stars:0,passed:false,best:0},locked=i>0&&!prev?.passed,b=document.createElement('button');b.className='mission'+(locked?' locked':'')+(state.mission?.id===m.id?' selected':'');b.disabled=locked||complete;b.innerHTML=`<div class="missionTop"><div class="missionTitle">Série ${i+1} — ${m.title}</div><div class="stars">${starsText(p.stars||0)}</div></div><div class="missionMeta">${m.count} activités • ${m.modes.map(modeLabel).join(' • ')}</div><div class="missionState">${locked?'🔒 Bloquée':p.passed?`✅ Validée • ${p.best}%`:'À faire • plus de 50%'}</div>`;b.onclick=()=>{state.mission={...m,level:state.level};state.quick=false;state.special=null;$('startMission').disabled=false;$('startMission').textContent='COMMENCER LA SÉRIE';renderHome()};$('missions').appendChild(b)});
    $('finishBox').classList.toggle('show',complete);if(complete){$('startMission').disabled=true;$('startMission').textContent='ROADMAP TERMINÉE'}
  }

  function makeRounds(mission,countOverride){
    const count=countOverride||mission.count,rounds=[],wp=shuffle(poolWords(mission.level||state.level,mission.theme||'all')),pp=shuffle(poolPhrases(mission.level||state.level,mission.theme||'all')),dp=shuffle(poolDialogues(mission.level||state.level)),gp=shuffle(poolGrammar(mission.level||state.level));
    for(let i=0;i<count;i++){
      let type=mission.modes[i%mission.modes.length];
      if(type==='review'){const mistakes=read('mistakes',[]);if(mistakes.length){const x=mistakes[i%mistakes.length];rounds.push({type:x.type,item:x.item,review:true});continue}type='audio'}
      if(type==='pairs'){rounds.push({type,item:sample(wp,4)});continue}
      if(type==='sentence'||type==='cloze'||type==='typing'){rounds.push({type,item:pp[i%Math.max(pp.length,1)]||PHRASES[0]});continue}
      if(type==='dialogue'){rounds.push({type,item:dp[i%Math.max(dp.length,1)]||DIALOGUES[0]});continue}
      if(type==='grammar'){rounds.push({type,item:gp[i%Math.max(gp.length,1)]||GRAMMAR[0]});continue}
      rounds.push({type,item:wp[i%Math.max(wp.length,1)]||WORDS[0]})
    }
    return rounds
  }
  function startSession(mission,countOverride){state.mission=mission;state.rounds=makeRounds(mission,countOverride);state.index=0;state.score=0;state.hearts=mission.special==='placement'?5:LEVELS[state.level].hearts;state.xpEarned=0;state.validated=false;state.selected=null;state.special=mission.special||null;state.recommended=null;rememberRounds();show('quiz');renderRound()}
  function startTheme(theme){state.quick=true;state.special='theme';startSession({id:'theme',title:THEME_LABELS[theme]||theme,count:8,modes:['audio','listenEnglish','reverse','pairs','truefalse','cloze'],theme,level:state.level,special:'theme'})}
  function current(){return state.rounds[state.index]}
  function renderRound(){state.validated=false;state.selected=null;state.correct=null;state.pairFirst=null;state.pairMistakes=0;state.answerTokens=[];$('feedback').className='feedback';$('reveal').className='reveal';$('validate').disabled=true;$('validate').textContent='VALIDER';$('profileLabel').textContent=`${state.profile} • ${LEVELS[state.level].label}`;$('scoreLabel').textContent=`${state.score}/${state.rounds.length}`;$('hearts').textContent='❤'.repeat(state.hearts)+'♡'.repeat(Math.max(0,5-state.hearts));$('progress').style.width=(state.index/state.rounds.length*100)+'%';$('questionMeta').textContent=`Question ${state.index+1} sur ${state.rounds.length} • ${modeLabel(current().type)}`;const q=current();({audio:renderAudio,listenEnglish:renderListenEnglish,reverse:renderReverse,pairs:renderPairs,sentence:renderSentence,cloze:renderCloze,truefalse:renderTrueFalse,typing:renderTyping,dialogue:renderDialogue,grammar:renderGrammar}[q.type]||renderAudio)(q.item)}
  function audioPanel(text){return `<div class="audioPanel"><button class="audioMain" id="speakNormal">🔊</button><span class="wave">▁▂▃▄▅▆▅▄▃▂▁</span><button class="audioSlow" id="speakSlow">🐢 Lent</button></div>`}
  function bindAudio(text){$('speakNormal').onclick=()=>speak(text,.82);$('speakSlow').onclick=()=>speak(text,.53);setTimeout(()=>speak(text,.82),220)}
  function bindAnswers(correct){state.correct=correct;document.querySelectorAll('.answer').forEach(b=>b.onclick=()=>{if(state.validated)return;document.querySelectorAll('.answer').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');state.selected=b.dataset.value??b.textContent;$('validate').disabled=false})}
  function renderAudio(item){$('instruction').textContent='Appuie sur la traduction entendue';const wrong=sample(WORDS.filter(w=>w.fr!==item.fr&&w.level===item.level),3).map(w=>w.fr),opts=shuffle([item.fr,...wrong]);$('exercise').innerHTML=audioPanel(item.en)+`<div class="answers">${opts.map(x=>`<button class="answer" data-value="${escapeHtml(x)}">${escapeHtml(x)}</button>`).join('')}</div>`;bindAudio(item.en);bindAnswers(item.fr)}
  function renderListenEnglish(item){$('instruction').textContent='Appuie sur le mot anglais entendu';const wrong=sample(WORDS.filter(w=>w.en!==item.en&&w.level===item.level),3).map(w=>w.en),opts=shuffle([item.en,...wrong]);$('exercise').innerHTML=audioPanel(item.en)+`<div class="answers">${opts.map(x=>`<button class="answer" data-value="${escapeHtml(x)}">${escapeHtml(x)}</button>`).join('')}</div>`;bindAudio(item.en);bindAnswers(item.en)}
  function renderReverse(item){$('instruction').textContent='Trouve le mot anglais';const wrong=sample(WORDS.filter(w=>w.en!==item.en&&w.level===item.level),3).map(w=>w.en),opts=shuffle([item.en,...wrong]);$('exercise').innerHTML=`<div class="promptCard">${escapeHtml(item.fr)}</div><div class="answers">${opts.map(x=>`<button class="answer" data-value="${escapeHtml(x)}">${escapeHtml(x)}</button>`).join('')}</div>`;bindAnswers(item.en)}
  function renderPairs(items){$('instruction').textContent='Appuie sur les paires';const cards=[];items.forEach((w,i)=>cards.push({side:'en',pair:i,text:w.en},{side:'fr',pair:i,text:w.fr}));$('exercise').innerHTML=`<div class="pairGrid">${shuffle(cards).map(c=>`<button class="pairBtn" data-pair="${c.pair}" data-side="${c.side}">${escapeHtml(c.text)}</button>`).join('')}</div>`;document.querySelectorAll('.pairBtn').forEach(b=>b.onclick=()=>pairClick(b));$('validate').textContent='TERMINE LES PAIRES'}
  function pairClick(btn){if(btn.classList.contains('matched'))return;if(!state.pairFirst){state.pairFirst=btn;btn.classList.add('active');return}const first=state.pairFirst;if(first===btn)return;const ok=first.dataset.pair===btn.dataset.pair&&first.dataset.side!==btn.dataset.side;if(ok){first.classList.remove('active');first.classList.add('matched');btn.classList.add('matched');state.pairFirst=null;if(document.querySelectorAll('.pairBtn.matched').length===document.querySelectorAll('.pairBtn').length){$('validate').disabled=false;$('validate').textContent='VALIDER LES PAIRES'}}else{state.pairMistakes++;first.classList.add('bad');btn.classList.add('bad');vibrate(80);setTimeout(()=>{first.classList.remove('active','bad');btn.classList.remove('bad')},300);state.pairFirst=null}}
  function renderSentence(item){$('instruction').textContent='Construis la phrase entendue';const tokens=item.en.replace(/[?!.]/g,'').split(/\s+/);state.sentenceTokens=shuffle(tokens.map((t,i)=>({id:i,text:t,used:false})));$('exercise').innerHTML=audioPanel(item.en)+`<div class="sentenceBox" id="sentenceBox"></div><div class="tokenBank" id="tokenBank"></div>`;bindAudio(item.en);renderTokens();$('validate').textContent='VALIDER LA PHRASE'}
  function renderTokens(){const box=$('sentenceBox'),bank=$('tokenBank');box.innerHTML=state.answerTokens.map((t,i)=>`<button class="token placed" data-answer="${i}">${escapeHtml(t.text)}</button>`).join('');bank.innerHTML=state.sentenceTokens.map((t,i)=>`<button class="token ${t.used?'used':''}" data-token="${i}">${escapeHtml(t.text)}</button>`).join('');box.querySelectorAll('.token').forEach(b=>b.onclick=()=>{const t=state.answerTokens.splice(Number(b.dataset.answer),1)[0],o=state.sentenceTokens.find(x=>x.id===t.id);if(o)o.used=false;renderTokens()});bank.querySelectorAll('.token').forEach(b=>b.onclick=()=>{const t=state.sentenceTokens[Number(b.dataset.token)];if(t.used)return;t.used=true;state.answerTokens.push({...t});renderTokens()});$('validate').disabled=!state.answerTokens.length}
  function clozeData(item){const tokens=item.en.replace(/[?!.]/g,'').split(/\s+/),stops=['i','a','an','the','is','are','am','to','of','in','on','and','my','your','we','you','he','she','it'];let indexes=tokens.map((t,i)=>({t,i})).filter(x=>!stops.includes(x.t.toLowerCase())&&x.t.length>2);if(!indexes.length)indexes=tokens.map((t,i)=>({t,i}));const chosen=indexes[Math.floor(Math.random()*indexes.length)],display=tokens.map((t,i)=>i===chosen.i?'_____':t).join(' ');return{correct:chosen.t,display}}
  function renderCloze(item){$('instruction').textContent='Choisis le mot manquant';const c=clozeData(item),wrong=sample(WORDS.filter(w=>normalise(w.en)!==normalise(c.correct)&&w.level===item.level),3).map(w=>w.en),opts=shuffle([c.correct,...wrong]);$('exercise').innerHTML=`<div class="promptCard"><span class="blank">${escapeHtml(c.display)}</span><small>${escapeHtml(item.fr)}</small></div><div class="answers">${opts.map(x=>`<button class="answer" data-value="${escapeHtml(x)}">${escapeHtml(x)}</button>`).join('')}</div>`;bindAnswers(c.correct)}
  function renderTrueFalse(item){$('instruction').textContent='Cette traduction est-elle correcte ?';const correct=Math.random()>.45,wrong=sample(WORDS.filter(w=>w.fr!==item.fr&&w.level===item.level),1)[0]?.fr||'autre réponse',shown=correct?item.fr:wrong;state.correct=correct?'vrai':'faux';$('exercise').innerHTML=`<div class="promptCard">${escapeHtml(item.en)}<small>${escapeHtml(shown)}</small></div><div class="answers"><button class="trueBtn" data-value="vrai">✅ VRAI</button><button class="trueBtn" data-value="faux">❌ FAUX</button></div>`;document.querySelectorAll('.trueBtn').forEach(b=>b.onclick=()=>{document.querySelectorAll('.trueBtn').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');state.selected=b.dataset.value;$('validate').disabled=false})}
  function renderTyping(item){$('instruction').textContent='Écris la phrase en anglais';state.correct=item.en;$('exercise').innerHTML=`<div class="promptCard">${escapeHtml(item.fr)}<small>Écris sans te soucier des majuscules ni de la ponctuation.</small></div><input id="typingInput" class="typing" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="Ta réponse en anglais" />`;$('typingInput').oninput=e=>{state.selected=e.target.value;$('validate').disabled=!e.target.value.trim()};setTimeout(()=>$('typingInput').focus(),150)}
  function renderDialogue(item){$('instruction').textContent='Choisis la meilleure réponse';const wrong=sample(DIALOGUES.filter(x=>x.answer!==item.answer&&x.level===item.level),3).map(x=>x.answer),opts=shuffle([item.answer,...wrong]);$('exercise').innerHTML=`<div class="dialogueBubble">💬 ${escapeHtml(item.prompt)}</div><div class="answers">${opts.map(x=>`<button class="answer" data-value="${escapeHtml(x)}">${escapeHtml(x)}</button>`).join('')}</div>`;speak(item.prompt,.82);bindAnswers(item.answer)}
  function renderGrammar(item){$('instruction').textContent='Complète la phrase';state.correct=item.answer;const opts=shuffle(item.choices);$('exercise').innerHTML=`<div class="promptCard">${escapeHtml(item.question)}</div><div class="answers">${opts.map(x=>`<button class="answer" data-value="${escapeHtml(x)}">${escapeHtml(x)}</button>`).join('')}</div>`;bindAnswers(item.answer)}

  function validateRound(){
    if(state.validated){nextRound();return}const q=current();let ok=false;
    if(['audio','listenEnglish','reverse','cloze','truefalse','dialogue','grammar'].includes(q.type)){ok=normalise(state.selected)===normalise(state.correct);document.querySelectorAll('.answer,.trueBtn').forEach(b=>{b.classList.add('locked');if(normalise(b.dataset.value)===normalise(state.correct))b.classList.add('correct');if(b.classList.contains('selected')&&!ok)b.classList.add('wrong')})}
    else if(q.type==='pairs'){ok=state.pairMistakes<=1;document.querySelectorAll('.pairBtn').forEach(b=>b.classList.add('locked'))}
    else if(q.type==='sentence'){ok=normalise(state.answerTokens.map(t=>t.text).join(' '))===normalise(q.item.en);document.querySelectorAll('.token').forEach(b=>b.classList.add('locked'))}
    else if(q.type==='typing'){ok=normalise(state.selected)===normalise(q.item.en);$('typingInput').disabled=true;$('typingInput').style.borderColor=ok?'var(--green)':'var(--red)'}
    state.validated=true;updateMastery(q,ok);if(ok){state.score++;state.xpEarned+=state.level==='confirme'?15:state.level==='moyen'?12:10;$('feedback').textContent='Bonne réponse !';$('feedback').className='feedback show good';removeMistake(q);speak('Good job',.85);vibrate(40)}else{state.hearts=Math.max(0,state.hearts-1);$('feedback').textContent='À revoir. Regarde la bonne réponse.';$('feedback').className='feedback show bad';saveMistake(q);speak('Try again',.85);vibrate([80,50,80])}showReveal(q);$('scoreLabel').textContent=`${state.score}/${state.rounds.length}`;$('hearts').textContent='❤'.repeat(state.hearts)+'♡'.repeat(Math.max(0,5-state.hearts));$('validate').textContent='CONTINUER';$('validate').disabled=false;$('progress').style.width=((state.index+1)/state.rounds.length*100)+'%'
  }
  function showReveal(q){let title='Réponse anglaise',en='',fr='';if(q.type==='pairs'){en='Paires terminées';fr='Anglais ↔ Français'}else if(q.type==='grammar'){title='Règle';en=q.item.question.replace('___',q.item.answer);fr=q.item.explanation}else if(q.type==='dialogue'){title='Bonne réponse';en=q.item.answer;fr=q.item.answerFr}else{en=q.item.en;fr=q.item.fr}$('reveal').innerHTML=`<small>${escapeHtml(title)}</small><strong>${escapeHtml(en)}</strong><span>${escapeHtml(fr)}</span>`;$('reveal').className='reveal show'}
  function nextRound(){state.index++;if(state.index>=state.rounds.length){finishSession();return}renderRound()}
  function finishSession(){
    const total=state.rounds.length,percent=Math.round(state.score/Math.max(total,1)*100),starCount=percent===100?3:percent>=70?2:percent>50?1:0,passed=starCount>0;updateStreak();const stats=read('stats',{best:0,played:0,xp:0,streak:0,lastDay:'',dailyDay:''});stats.best=Math.max(stats.best||0,percent);stats.played=(stats.played||0)+1;let bonus=0;if(state.special==='daily'){const today=new Date().toISOString().slice(0,10);if(stats.dailyDay!==today){bonus=25;stats.dailyDay=today}}stats.xp=(stats.xp||0)+state.xpEarned+bonus;write('stats',stats);
    if(!state.quick&&!state.special&&state.mission?.id){const road=read(levelKey('road'),{}),old=road[state.mission.id]||{stars:0,best:0,passed:false};road[state.mission.id]={stars:Math.max(old.stars||0,starCount),best:Math.max(old.best||0,percent),passed:old.passed||passed};write(levelKey('road'),road)}
    if(state.special==='placement'){state.recommended=percent<45?'debutant':percent<78?'moyen':'confirme';$('resultTitle').textContent='Niveau conseillé';$('resultText').textContent=`Score ${percent}%. Niveau recommandé : ${LEVELS[state.recommended].label} ${LEVELS[state.recommended].code}.`;$('resultBadge').textContent=`🎯 ${LEVELS[state.recommended].label}`;$('retry').textContent='APPLIQUER CE NIVEAU'}else{$('resultTitle').textContent=passed?'Série validée':'Série à refaire';$('resultText').textContent=passed?`Bravo, ${percent}%. ${bonus?'+25 XP de défi du jour.':''}`:`${percent}%. Il faut faire plus de 50% pour valider.`;$('resultBadge').textContent=`+${state.xpEarned+bonus} XP`;$('retry').textContent='RECOMMENCER'}
    $('resultScore').textContent=`${state.score}/${total}`;$('resultStars').textContent=starsText(starCount);show('result');$('progress').style.width='100%';renderHome()
  }

  function goHome(){if('speechSynthesis'in window)window.speechSynthesis.cancel();$('progress').style.width='0%';show('home');renderHome()}
  function startQuick(n){state.quick=true;state.special='quick';startSession({id:'quick',title:'Entraînement rapide',count:n,modes:['audio','listenEnglish','reverse','pairs','sentence','cloze','truefalse','dialogue','grammar'],theme:'all',level:state.level,special:'quick'},n)}
  function startDaily(){state.quick=true;state.special='daily';startSession({id:'daily',title:'Défi du jour',count:10,modes:['audio','listenEnglish','reverse','cloze','truefalse','grammar','dialogue'],theme:'all',level:state.level,special:'daily'})}
  function startPlacement(){state.quick=true;state.special='placement';const missions=[{modes:['audio','reverse','grammar'],level:'debutant'},{modes:['audio','cloze','grammar'],level:'moyen'},{modes:['cloze','typing','grammar'],level:'confirme'}],rounds=[];missions.forEach(m=>rounds.push(...makeRounds({...m,count:5,theme:'all'},5)));state.mission={id:'placement',title:'Test de niveau',special:'placement'};state.rounds=shuffle(rounds);state.index=0;state.score=0;state.hearts=5;state.xpEarned=0;state.validated=false;state.special='placement';show('quiz');renderRound()}

  document.querySelectorAll('[data-profile]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-profile]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');state.profile=b.dataset.profile;state.level=localStorage.getItem(key('selectedLevel'))||'debutant';state.mission=null;$('startMission').disabled=true;$('startMission').textContent='CHOISIS UNE SÉRIE';renderHome()});
  document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{state.level=b.dataset.level;localStorage.setItem(key('selectedLevel'),state.level);state.mission=null;$('startMission').disabled=true;$('startMission').textContent='CHOISIS UNE SÉRIE';renderHome()});
  document.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>startQuick(Number(b.dataset.quick)));
  $('dailyBtn').onclick=startDaily;$('reviewBtn').onclick=()=>{const mistakes=read('mistakes',[]);if(!mistakes.length)return;state.quick=true;state.special='review';startSession({id:'review',title:'Révision',count:Math.min(12,mistakes.length),modes:['review'],theme:'all',level:'all',special:'review'})};$('placementBtn').onclick=startPlacement;$('grammarBtn').onclick=()=>{state.quick=true;state.special='grammar';startSession({id:'grammar',title:'Grammaire',count:10,modes:['grammar'],theme:'all',level:state.level,special:'grammar'})};
  $('startMission').onclick=()=>state.mission&&startSession(state.mission);$('validate').onclick=validateRound;$('goRoadmap').onclick=goHome;$('retry').onclick=()=>{if(state.special==='placement'&&state.recommended){state.level=state.recommended;localStorage.setItem(key('selectedLevel'),state.level);state.special=null;goHome();return}startSession(state.mission,state.rounds.length)};$('backBtn').onclick=goHome;
  $('hintBtn').onclick=()=>{const q=current();let hint='Observe bien les propositions.';if(['audio','listenEnglish','sentence'].includes(q.type))hint='Première lettre : '+String(q.item.en||'').charAt(0).toUpperCase()+'…';else if(q.type==='typing')hint='Nombre de mots : '+q.item.en.split(/\s+/).length;else if(q.type==='grammar')hint='Relis le sujet et le temps de la phrase.';$('feedback').textContent=hint;$('feedback').className='feedback show bad'};
  $('finishRoadmap').onclick=()=>{write(levelKey('road'),{});localStorage.setItem(key(`cycle_${state.level}`),String(Number(localStorage.getItem(key(`cycle_${state.level}`))||1)+1));state.mission=null;$('startMission').disabled=true;$('startMission').textContent='CHOISIS UNE SÉRIE';renderHome();alert('Nouveau parcours créé avec d’autres questions.')};
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.installPrompt=e;$('installBtn').classList.add('show')});$('installBtn').onclick=()=>{if(!state.installPrompt)return;state.installPrompt.prompt();state.installPrompt=null;$('installBtn').classList.remove('show')};if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  state.level=localStorage.getItem(key('selectedLevel'))||'debutant';window.appBack=goHome;renderHome();
})();
