(() => {
  'use strict';
  const bank=window.ADULT_TRAINING||[], store=LearningStore, $=id=>document.getElementById(id);
  const esc=s=>String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  let order=bank.map((_,i)=>i),i=0,score=0,locked=false,completed=false;
  for(let n=order.length-1;n>0;n--){const j=Math.floor(Math.random()*(n+1));[order[n],order[j]]=[order[j],order[n]];}
  const saved=store.getSession('adultTraining');
  if(new URLSearchParams(location.search).has('resume')&&saved&&Array.isArray(saved.order)&&saved.order.length===bank.length&&new Set(saved.order).size===bank.length&&saved.order.every(id=>Number.isInteger(id)&&bank[id])){order=saved.order;i=Math.max(0,Math.min(order.length,Number(saved.i)||0));score=Math.max(0,Math.min(i,Number(saved.score)||0));}
  function save(){if(!completed)store.saveSession('adultTraining',{order,i:i+(locked?1:0),score});}
  function render(){
    LearningAudio.stop();locked=false;if(i>=order.length)return finish();save();
    const q=bank[order[i]];$('trainStep').textContent=`Question ${i+1} / ${order.length}`;$('trainScore').textContent=`${score} point${score>1?'s':''}`;$('trainFill').style.width=(i/order.length*100)+'%';
    $('trainingCard').innerHTML=`<div class="eyebrow">${esc(q.title)}</div><div class="trainingPrompt">${esc(q.prompt)}</div><div class="trainingAnswers" id="ta">${q.choices.map((c,n)=>`<button class="answerBtn" data-i="${n}"><div class="en">${esc(c)}</div></button>`).join('')}</div><div class="feedback" role="status" id="tf"></div>`;
    document.querySelectorAll('#ta .answerBtn').forEach(b=>b.onclick=()=>choose(b,q));
  }
  function choose(button,q){
    if(locked)return;locked=true;const good=Number(button.dataset.i)===q.answer;if(good)score++;
    button.classList.add(good?'good':'bad');document.querySelectorAll('#ta button').forEach(b=>{b.disabled=true;if(Number(b.dataset.i)===q.answer)b.classList.add('good');});save();
    $('tf').className='feedback show '+(good?'ok':'no');$('tf').innerHTML=`<b>${good?'Bonne réponse':'Réponse à retenir'}</b><p>${esc(q.choices[q.answer])}</p><p>${esc(q.explain)}</p><div class="sheetActions"><button class="audioBtn" id="hearTrain">🔊 Écouter</button><button class="primary" id="nextTrain">Continuer</button></div>`;
    $('hearTrain').onclick=()=>LearningAudio.speak(q.choices[q.answer]);$('nextTrain').onclick=()=>{i++;render();};
  }
  function finish(){
    completed=true;store.clearSession('adultTraining');$('trainFill').style.width='100%';
    if(store.markActivity('adult-training'))store.write('adultXp',(Number(store.read('adultXp',0))||0)+score*3);
    $('trainingCard').innerHTML=`<div class="eyebrow">Session terminée</div><h2>${score} / ${order.length}</h2><p>Rejoue les situations pour mémoriser les formulations utiles.</p><div class="sheetActions"><button class="primary" id="again">Nouvelle série</button><a class="secondary" href="adult.html">Mode adulte</a></div>`;
    $('again').onclick=()=>{location.href='adult-training.html';};
  }
  window.addEventListener('pagehide',save);render();
})();
