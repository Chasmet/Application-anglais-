(() => {
  const PAGE_SIZE = 45;
  const alphabet = Array.isArray(window.ENGLISH_ALPHABET) ? window.ENGLISH_ALPHABET : [];
  const verbs = Array.isArray(window.ENGLISH_VERBS) ? window.ENGLISH_VERBS : [];
  const normalizeText = value => String(value || '').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').trim();
  const escapeHtml = value => String(value || '').replace(/[&<>"]/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'
  }[char]));
  const speak = (text, rate = 0.76) => {
    if (window.AndroidTTS && typeof window.AndroidTTS.speak === 'function') {
      window.AndroidTTS.speak(String(text), rate);
      return;
    }
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(String(text));
    utterance.lang = 'en-US';
    utterance.rate = rate;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const alphabetGrid = document.getElementById('alphabetGrid');
  alphabetGrid.innerHTML = alphabet.map((item, index) => `
    <button class="letterCard" data-letter-index="${index}" aria-label="Écouter la lettre ${escapeHtml(item.letter)}">
      <strong>${escapeHtml(item.letter)}</strong>
      <span class="phonetic">${escapeHtml(item.pron)}</span>
      <small>${escapeHtml(item.example)} = ${escapeHtml(item.fr)}</small>
    </button>
  `).join('');
  alphabetGrid.querySelectorAll('[data-letter-index]').forEach(button => {
    button.addEventListener('click', () => {
      const item = alphabet[Number(button.dataset.letterIndex)];
      speak(item.letter, 0.65);
      setTimeout(() => speak(item.example, 0.72), 850);
    });
  });

  document.querySelectorAll('[data-tab]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-tab]').forEach(tab => tab.classList.toggle('active', tab === button));
      document.getElementById('alphabetPanel').classList.toggle('active', button.dataset.tab === 'alphabet');
      document.getElementById('verbsPanel').classList.toggle('active', button.dataset.tab === 'verbs');
      if ('speechSynthesis' in window) speechSynthesis.cancel();
    });
  });

  const search = document.getElementById('verbSearch');
  const typeFilter = document.getElementById('verbType');
  const list = document.getElementById('verbList');
  const count = document.getElementById('verbCount');
  const loadMore = document.getElementById('verbLoadMore');
  const empty = document.getElementById('verbEmpty');
  let filtered = verbs;
  let visibleCount = PAGE_SIZE;

  function applyFilters(reset = true) {
    if (reset) visibleCount = PAGE_SIZE;
    const query = normalizeText(search.value);
    const type = typeFilter.value;
    filtered = verbs.filter(verb => {
      const matchesText = !query || normalizeText(`${verb.base} ${verb.past} ${verb.participle} ${verb.fr}`).includes(query);
      const matchesType = type === 'all' || verb.type === type;
      return matchesText && matchesType;
    });
    renderVerbs();
  }

  function renderVerbs() {
    const visible = filtered.slice(0, visibleCount);
    count.textContent = `${filtered.length} verbe${filtered.length > 1 ? 's' : ''}`;
    empty.hidden = filtered.length !== 0;
    loadMore.hidden = visible.length >= filtered.length;
    list.innerHTML = visible.map((verb, index) => `
      <article class="verbCard">
        <div class="verbMain">
          <strong>${escapeHtml(verb.base)}</strong>
          <span class="translation">${escapeHtml(verb.fr)}</span>
          <div class="verbMeta">
            <span class="tag ${escapeHtml(verb.type)}">${verb.type === 'irregular' ? 'Irrégulier' : 'Régulier'}</span>
          </div>
          <div class="verbForms">
            <div class="verbForm"><small>Base</small><span>${escapeHtml(verb.base)}</span></div>
            <div class="verbForm"><small>Prétérit</small><span>${escapeHtml(verb.past)}</span></div>
            <div class="verbForm"><small>Participe passé</small><span>${escapeHtml(verb.participle)}</span></div>
          </div>
        </div>
        <button class="soundButton" data-verb-index="${index}" aria-label="Écouter ${escapeHtml(verb.base)}">🔊</button>
      </article>
    `).join('');
    list.querySelectorAll('[data-verb-index]').forEach(button => {
      button.addEventListener('click', () => {
        const verb = visible[Number(button.dataset.verbIndex)];
        speak(`${verb.base}. ${verb.past}. ${verb.participle}.`, 0.7);
      });
    });
  }

  search.addEventListener('input', () => applyFilters());
  typeFilter.addEventListener('change', () => applyFilters());
  loadMore.addEventListener('click', () => { visibleCount += PAGE_SIZE; renderVerbs(); });
  document.getElementById('randomVerb').addEventListener('click', () => {
    const pool = filtered.length ? filtered : verbs;
    const verb = pool[Math.floor(Math.random() * pool.length)];
    search.value = verb.base;
    applyFilters();
    speak(`${verb.base}. ${verb.past}. ${verb.participle}.`, 0.7);
  });

  applyFilters();
})();
