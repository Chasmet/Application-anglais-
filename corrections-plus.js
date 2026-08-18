(() => {
  const normalise = value => String(value || '').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9' ]/g, ' ').replace(/\s+/g, ' ').trim();

  const speak = (text, rate = 0.78) => {
    if (!text) return;
    if (window.AndroidTTS && typeof window.AndroidTTS.speak === 'function') {
      window.AndroidTTS.speak(String(text), Number(rate));
      return;
    }
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(String(text));
    u.lang = 'en-US';
    u.rate = rate;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  };

  function wordDiff(expected, actual) {
    const a = normalise(expected).split(' ').filter(Boolean);
    const b = normalise(actual).split(' ').filter(Boolean);
    const missing = a.filter((w, i) => b[i] !== w);
    if (!missing.length) return '';
    return `À vérifier : ${missing.slice(0, 4).join(', ')}.`;
  }

  function selectedValue() {
    const selected = document.querySelector('.answer.selected, .trueBtn.selected');
    if (selected) return selected.dataset.value || selected.textContent.trim();
    const input = document.getElementById('typingInput');
    if (input) return input.value.trim();
    const sentence = document.getElementById('sentenceBox');
    if (sentence) return [...sentence.querySelectorAll('.token')].map(x => x.textContent.trim()).join(' ');
    return '';
  }

  function correctValue() {
    const correct = document.querySelector('.answer.correct, .trueBtn.correct');
    if (correct) return correct.dataset.value || correct.textContent.trim();
    const reveal = document.getElementById('reveal');
    return reveal?.querySelector('strong')?.textContent?.trim() || '';
  }

  function buildExplanation() {
    const feedback = document.getElementById('feedback');
    const reveal = document.getElementById('reveal');
    if (!feedback?.classList.contains('show') || !reveal?.classList.contains('show')) return;
    if (feedback.dataset.enriched === '1') return;

    const meta = document.getElementById('questionMeta')?.textContent || '';
    const isGood = feedback.classList.contains('good');
    const expected = correctValue();
    const actual = selectedValue();
    const en = reveal.querySelector('strong')?.textContent?.trim() || expected;
    const fr = reveal.querySelector('span')?.textContent?.trim() || '';

    let lesson = '';
    if (/grammaire/i.test(meta)) {
      lesson = fr ? `Règle : ${fr}` : 'Relis la structure grammaticale complète avant de répondre.';
    } else if (/dictée/i.test(meta)) {
      lesson = wordDiff(en, actual) || 'Compare l’orthographe mot par mot, puis réécoute la phrase.';
    } else if (/phrase/i.test(meta)) {
      lesson = wordDiff(en, actual) || 'En anglais, l’ordre des mots est essentiel : sujet, verbe, puis complément.';
    } else if (/écoute/i.test(meta)) {
      lesson = `Écoute de nouveau « ${en} », puis associe le son à « ${fr} ».`;
    } else if (/traduction|mot manquant/i.test(meta)) {
      lesson = `À retenir : « ${en} » signifie « ${fr} ».`;
    } else if (/dialogue/i.test(meta)) {
      lesson = `Réponse naturelle : « ${en} »${fr ? ` — ${fr}` : ''}.`;
    } else {
      lesson = fr ? `À retenir : « ${en} » = « ${fr} ».` : `À retenir : « ${en} ».`;
    }

    const choiceNote = !isGood && actual && expected && normalise(actual) !== normalise(expected)
      ? ` Tu as répondu « ${actual} ». La bonne réponse est « ${expected} ».` : '';

    feedback.innerHTML = `
      <strong>${isGood ? 'Bien joué.' : 'Correction détaillée'}</strong>
      <span>${choiceNote}${choiceNote ? ' ' : ''}${lesson}</span>
      ${en ? '<button type="button" class="correctionSpeak" id="correctionSpeak">🔊 Écouter la bonne réponse</button>' : ''}
    `;
    feedback.dataset.enriched = '1';
    const btn = document.getElementById('correctionSpeak');
    if (btn) btn.onclick = () => speak(en, 0.72);
  }

  function resetEnrichment() {
    const feedback = document.getElementById('feedback');
    if (feedback) delete feedback.dataset.enriched;
  }

  const validate = document.getElementById('validate');
  if (validate) {
    validate.addEventListener('click', () => setTimeout(buildExplanation, 30));
  }

  const exercise = document.getElementById('exercise');
  if (exercise) {
    new MutationObserver(resetEnrichment).observe(exercise, { childList: true, subtree: true });
  }
})();
