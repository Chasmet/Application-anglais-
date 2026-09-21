/* Text comparison, not an acoustic pronunciation or general semantic score. */
(() => {
  const contractions = { "i'm":"i am", "you're":"you are", "i'd":"i would", "i'll":"i will", "i've":"i have", "don't":"do not", "doesn't":"does not", "didn't":"did not", "isn't":"is not", "aren't":"are not", "can't":"can not", "cannot":"can not", "won't":"will not", "wouldn't":"would not", "couldn't":"could not", "haven't":"have not", "it's":"it is", "that's":"that is" };
  function normalize(text) {
    return String(text || '').toLowerCase().replace(/[’‘]/g,"'").replace(/\b[a-z]+(?:'[a-z]+)?\b/g,w=>contractions[w]||w).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  }
  function evaluate(spoken, turn) {
    const actual = normalize(spoken), targets = [turn.expected, ...(turn.accepted || [])].map(normalize);
    if (!actual) return {score:0,accepted:false,reason:'Aucun texte reconnu. Réessaie ou écris ta réponse.'};
    if (targets.includes(actual)) return {score:100,accepted:true,reason:'Cette formulation fait partie des réponses prévues.'};
    const a = actual.split(' '), negative = words => words.filter(w=>['not','never','without','no'].includes(w)).join('|');
    let best = 0;
    for (const text of targets) {
      const b = text.split(' '), previous = Array(b.length+1).fill(0);
      for (const word of a) { let diagonal=0; for(let j=1;j<=b.length;j++){ const old=previous[j]; previous[j]=word===b[j-1]?diagonal+1:Math.max(previous[j],previous[j-1]); diagonal=old; } }
      let score = Math.round(100*2*previous[b.length]/Math.max(1,a.length+b.length));
      if (negative(a) !== negative(b)) score = Math.min(score,25);
      const nums=x=>x.filter(w=>/^\d+$/.test(w)||['one','two','three','four','five','six','seven','eight','nine','ten'].includes(w)).join('|');
      if (nums(a)!==nums(b)) score=Math.min(score,40);
      best=Math.max(best,score);
    }
    return {score:Math.min(best,74),accepted:false,reason:'Formulation différente : compare les mots, leur ordre et le sens. Ce score mesure la proximité du texte, pas ton accent.'};
  }
  const api={normalize,evaluate};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else window.SpeechEvaluation=api;
})();
