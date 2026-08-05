(() => {
  const PAGE_SIZE = 60;
  const themeLabels = {
    mix:'Général', salutations:'Salutations', nombres:'Nombres', couleurs:'Couleurs',
    famille:'Famille', corps:'Corps', nourriture:'Nourriture', animaux:'Animaux',
    maison:'Maison', ecole:'École', actions:'Actions', adjectifs:'Adjectifs',
    sport:'Sport', temps:'Temps', ville:'Ville', voyage:'Voyage', meteo:'Météo',
    vetements:'Vêtements', metiers:'Métiers', sante:'Santé', emotions:'Émotions',
    nature:'Nature', technologie:'Technologie', football:'Football', commerce:'Commerce',
    travail:'Travail', societe:'Société', environnement:'Environnement',
    abstrait:'Expressions', communication:'Communication', phrasal:'Phrasal verbs',
    nuances:'Nuances'
  };
  const levelLabels = {debutant:'Débutant', moyen:'Moyen', confirme:'Confirmé'};
  const normalizeLevel = level => level === 'facile' ? 'debutant' : (level || 'debutant');
  const normalizeText = value => String(value || '').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').trim();
  const escapeHtml = value => String(value || '').replace(/[&<>"]/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'
  }[char]));
  const speak = text => {
    if (window.AndroidTTS && typeof window.AndroidTTS.speak === 'function') {
      window.AndroidTTS.speak(String(text), 0.78);
      return;
    }
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(String(text));
    utterance.lang = 'en-US';
    utterance.rate = 0.78;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const source = [...(window.QUIZ_WORDS || []), ...(window.QUIZ_EXTRA_WORDS || [])];
  const seen = new Set();
  const words = source.map(word => ({
    en:String(word.en || '').trim(),
    fr:String(word.fr || '').trim(),
    theme:word.theme === 'mix' ? 'mix' : (word.theme || 'mix'),
    level:normalizeLevel(word.level)
  })).filter(word => {
    const key = `${word.en.toLowerCase()}|${word.fr.toLowerCase()}|${word.level}`;
    if (!word.en || !word.fr || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => a.en.localeCompare(b.en, 'en'));

  const search = document.getElementById('vocabSearch');
  const levelFilter = document.getElementById('levelFilter');
  const themeFilter = document.getElementById('themeFilter');
  const list = document.getElementById('wordList');
  const count = document.getElementById('vocabCount');
  const loadMore = document.getElementById('loadMore');
  const emptyState = document.getElementById('emptyState');
  let visibleCount = PAGE_SIZE;
  let filtered = words;

  [...new Set(words.map(word => word.theme))].sort((a, b) =>
    (themeLabels[a] || a).localeCompare(themeLabels[b] || b, 'fr')
  ).forEach(theme => {
    const option = document.createElement('option');
    option.value = theme;
    option.textContent = themeLabels[theme] || theme;
    themeFilter.appendChild(option);
  });

  function applyFilters(reset = true) {
    if (reset) visibleCount = PAGE_SIZE;
    const query = normalizeText(search.value);
    const level = levelFilter.value;
    const theme = themeFilter.value;
    filtered = words.filter(word => {
      const matchesQuery = !query || normalizeText(`${word.en} ${word.fr}`).includes(query);
      const matchesLevel = level === 'all' || word.level === level;
      const matchesTheme = theme === 'all' || word.theme === theme;
      return matchesQuery && matchesLevel && matchesTheme;
    });
    render();
  }

  function render() {
    const visible = filtered.slice(0, visibleCount);
    count.textContent = `${filtered.length} mot${filtered.length > 1 ? 's' : ''}`;
    emptyState.hidden = filtered.length !== 0;
    loadMore.hidden = visible.length >= filtered.length;
    list.innerHTML = visible.map((word, index) => `
      <article class="wordCard">
        <div class="wordMain">
          <strong>${escapeHtml(word.en)}</strong>
          <span class="translation">${escapeHtml(word.fr)}</span>
          <div class="wordMeta">
            <span class="tag">${escapeHtml(levelLabels[word.level] || word.level)}</span>
            <span class="tag">${escapeHtml(themeLabels[word.theme] || word.theme)}</span>
          </div>
        </div>
        <button class="soundButton" data-speak-index="${index}" aria-label="Écouter ${escapeHtml(word.en)}">🔊</button>
      </article>
    `).join('');
    list.querySelectorAll('[data-speak-index]').forEach(button => {
      button.addEventListener('click', () => speak(visible[Number(button.dataset.speakIndex)].en));
    });
  }

  search.addEventListener('input', () => applyFilters());
  levelFilter.addEventListener('change', () => applyFilters());
  themeFilter.addEventListener('change', () => applyFilters());
  loadMore.addEventListener('click', () => { visibleCount += PAGE_SIZE; render(); });
  document.getElementById('randomWord').addEventListener('click', () => {
    const pool = filtered.length ? filtered : words;
    const word = pool[Math.floor(Math.random() * pool.length)];
    search.value = word.en;
    applyFilters();
    speak(word.en);
  });

  applyFilters();
})();
