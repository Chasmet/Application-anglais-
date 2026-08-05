(() => {
  const PAGE_SIZE = 8;
  const alphabet = Array.isArray(window.ENGLISH_ALPHABET) ? window.ENGLISH_ALPHABET : [];
  const verbs = Array.isArray(window.ENGLISH_VERBS) ? window.ENGLISH_VERBS : [];
  const pronouns = [
    { en: 'I', fr: 'je', bePresent: 'am', bePast: 'was' },
    { en: 'You', fr: 'tu / vous', bePresent: 'are', bePast: 'were' },
    { en: 'He / She / It', fr: 'il / elle / ça', bePresent: 'is', bePast: 'was', third: true },
    { en: 'We', fr: 'nous', bePresent: 'are', bePast: 'were' },
    { en: 'You', fr: 'vous', bePresent: 'are', bePast: 'were' },
    { en: 'They', fr: 'ils / elles', bePresent: 'are', bePast: 'were' }
  ];

  const normalizeText = value => String(value || '').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').trim();
  const escapeHtml = value => String(value || '').replace(/[&<>"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  }[char]));

  const speak = (text, rate = 0.72) => {
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

  function thirdPerson(base) {
    if (base === 'be') return 'is';
    if (base === 'have') return 'has';
    if (base === 'do') return 'does';
    if (/[^aeiou]y$/i.test(base)) return `${base.slice(0, -1)}ies`;
    if (/(s|x|z|ch|sh|o)$/i.test(base)) return `${base}es`;
    return `${base}s`;
  }

  function ingForm(base) {
    const exceptions = {
      be: 'being', begin: 'beginning', die: 'dying', get: 'getting', lie: 'lying',
      put: 'putting', run: 'running', sit: 'sitting', stop: 'stopping', swim: 'swimming',
      tie: 'tying', travel: 'travelling', win: 'winning', write: 'writing'
    };
    if (exceptions[base]) return exceptions[base];
    if (/ie$/i.test(base)) return `${base.slice(0, -2)}ying`;
    if (/[^e]e$/i.test(base) && !/(ee|ye|oe)$/i.test(base)) return `${base.slice(0, -1)}ing`;
    return `${base}ing`;
  }

  function conjugate(verb, pronoun) {
    const isBe = verb.base === 'be';
    return {
      present: isBe ? pronoun.bePresent : (pronoun.third ? thirdPerson(verb.base) : verb.base),
      past: isBe ? pronoun.bePast : verb.past,
      future: `will ${verb.base}`,
      continuous: `${pronoun.bePresent} ${ingForm(verb.base)}`
    };
  }

  function tenseSpeech(verb, tense) {
    return pronouns.map(pronoun => {
      const forms = conjugate(verb, pronoun);
      return `${pronoun.en} ${forms[tense]}`;
    }).join('. ') + '.';
  }

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

    list.innerHTML = visible.map((verb, index) => {
      const rows = pronouns.map(pronoun => {
        const forms = conjugate(verb, pronoun);
        return `
          <tr>
            <th scope="row"><strong>${escapeHtml(pronoun.en)}</strong><small>${escapeHtml(pronoun.fr)}</small></th>
            <td>${escapeHtml(forms.present)}</td>
            <td>${escapeHtml(forms.past)}</td>
            <td>${escapeHtml(forms.future)}</td>
            <td>${escapeHtml(forms.continuous)}</td>
          </tr>`;
      }).join('');

      return `
        <article class="verbCard conjugationCard">
          <div class="conjugationHeader">
            <div>
              <strong>${escapeHtml(verb.base)}</strong>
              <span class="translation">${escapeHtml(verb.fr)}</span>
              <div class="verbMeta">
                <span class="tag ${escapeHtml(verb.type)}">${verb.type === 'irregular' ? 'Irrégulier' : 'Régulier'}</span>
              </div>
            </div>
            <button class="soundButton" data-full-verb="${index}" aria-label="Écouter la conjugaison de ${escapeHtml(verb.base)}">🔊</button>
          </div>

          <div class="verbForms summaryForms">
            <div class="verbForm"><small>Base</small><span>${escapeHtml(verb.base)}</span></div>
            <div class="verbForm"><small>Prétérit</small><span>${escapeHtml(verb.past)}</span></div>
            <div class="verbForm"><small>Participe passé</small><span>${escapeHtml(verb.participle)}</span></div>
          </div>

          <div class="conjugationScroll" role="region" aria-label="Tableau de conjugaison de ${escapeHtml(verb.base)}" tabindex="0">
            <table class="conjugationTable">
              <thead>
                <tr>
                  <th>Pronom</th>
                  <th>Présent</th>
                  <th>Prétérit</th>
                  <th>Futur</th>
                  <th>Présent continu</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>

          <div class="tenseAudio" aria-label="Écouter un temps">
            <button data-verb-index="${index}" data-tense="present">🔊 Présent</button>
            <button data-verb-index="${index}" data-tense="past">🔊 Prétérit</button>
            <button data-verb-index="${index}" data-tense="future">🔊 Futur</button>
            <button data-verb-index="${index}" data-tense="continuous">🔊 Continu</button>
          </div>
        </article>`;
    }).join('');

    list.querySelectorAll('[data-full-verb]').forEach(button => {
      button.addEventListener('click', () => {
        const verb = visible[Number(button.dataset.fullVerb)];
        speak(tenseSpeech(verb, 'present'), 0.68);
      });
    });

    list.querySelectorAll('[data-tense]').forEach(button => {
      button.addEventListener('click', () => {
        const verb = visible[Number(button.dataset.verbIndex)];
        speak(tenseSpeech(verb, button.dataset.tense), 0.68);
      });
    });
  }

  search.addEventListener('input', () => applyFilters());
  typeFilter.addEventListener('change', () => applyFilters());
  loadMore.addEventListener('click', () => {
    visibleCount += PAGE_SIZE;
    renderVerbs();
  });
  document.getElementById('randomVerb').addEventListener('click', () => {
    const pool = filtered.length ? filtered : verbs;
    const verb = pool[Math.floor(Math.random() * pool.length)];
    search.value = verb.base;
    applyFilters();
    speak(tenseSpeech(verb, 'present'), 0.68);
  });

  applyFilters();
})();
