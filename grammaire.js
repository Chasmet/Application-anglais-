(() => {
  const PAGE_SIZE = 5;
  const alphabet = Array.isArray(window.ENGLISH_ALPHABET) ? window.ENGLISH_ALPHABET : [];
  const verbs = Array.isArray(window.ENGLISH_VERBS) ? window.ENGLISH_VERBS : [];
  const pronunciation = window.VERB_PRONUNCIATION || {};
  const frenchData = window.FRENCH_VERB_DATA || { preferred: {}, irregular: {} };

  const rows = [
    { en: 'I', frSubject: 'Je', person: 0 },
    { en: 'You', frSubject: 'Tu', secondFrSubject: 'Vous', person: 1, secondPerson: 4 },
    { en: 'He', frSubject: 'Il', person: 2, third: true },
    { en: 'She', frSubject: 'Elle', person: 2, third: true },
    { en: 'It', frSubject: 'Il/Elle', person: 2, third: true, object: true },
    { en: 'We', frSubject: 'Nous', person: 3 },
    { en: 'They', frSubject: 'Ils/Elles', person: 5 }
  ];

  const normalizeText = value => String(value || '').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').trim();

  const escapeHtml = value => String(value || '').replace(/[&<>\"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;'
  }[char]));

  function speak(text, rate = 0.72) {
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
  }

  function renderAlphabet() {
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
  }

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

  function englishPresent(verb, row) {
    if (verb.base === 'be') {
      if (row.en === 'I') return 'I am';
      if (row.en === 'You' || row.en === 'We' || row.en === 'They') return `${row.en} are`;
      return `${row.en} is`;
    }
    const form = row.third ? thirdPerson(verb.base) : verb.base;
    return `${row.en} ${form}`;
  }

  function englishPronunciation(phrase) {
    const subjectPronunciation = {
      I: 'aï', You: 'iou', He: 'hi', She: 'chi',
      It: 'it', We: 'oui', They: 'déï'
    };
    const parts = phrase.split(/\s+/);
    const subject = parts.shift();
    const pronouncedWords = parts.map(word => pronunciation[word.toLowerCase()] || word.toLowerCase());
    return [subjectPronunciation[subject] || subject, ...pronouncedWords].join(' ');
  }

  function preferredFrench(verb) {
    return frenchData.preferred[verb.base] || String(verb.fr || '').split('/')[0].trim();
  }

  function regularEr(infinitive) {
    const stem = infinitive.slice(0, -2);
    const forms = [`${stem}e`, `${stem}es`, `${stem}e`, `${stem}ons`, `${stem}ez`, `${stem}ent`];
    if (infinitive.endsWith('ger')) forms[3] = `${stem}eons`;
    if (infinitive.endsWith('cer')) forms[3] = `${stem.slice(0, -1)}çons`;
    return forms;
  }

  function regularIr(infinitive) {
    const stem = infinitive.slice(0, -2);
    return [`${stem}is`, `${stem}is`, `${stem}it`, `${stem}issons`, `${stem}issez`, `${stem}issent`];
  }

  function regularRe(infinitive) {
    const stem = infinitive.slice(0, -2);
    return [`${stem}s`, `${stem}s`, stem, `${stem}ons`, `${stem}ez`, `${stem}ent`];
  }

  function conjugateFrenchVerb(infinitive) {
    if (frenchData.irregular[infinitive]) return frenchData.irregular[infinitive];

    const reflexiveMatch = infinitive.match(/^(se |s')(.+)$/);
    if (reflexiveMatch) {
      const baseForms = conjugateFrenchVerb(reflexiveMatch[2]);
      const reflexives = ['me', 'te', 'se', 'nous', 'vous', 'se'];
      return baseForms.map((form, index) => {
        let reflexive = reflexives[index];
        if (/^[aeiouyhàâäéèêëîïôöùûüœ]/i.test(form) && ['me', 'te', 'se'].includes(reflexive)) {
          return `${reflexive.charAt(0)}'${form}`;
        }
        return `${reflexive} ${form}`;
      });
    }

    const phraseMatch = infinitive.match(/^([a-zàâäéèêëîïôöùûüç'-]+(?:er|ir|re))\s+(.+)$/i);
    if (phraseMatch) {
      return conjugateFrenchVerb(phraseMatch[1]).map(form => `${form} ${phraseMatch[2]}`);
    }

    if (infinitive.endsWith('er')) return regularEr(infinitive);
    if (infinitive.endsWith('ir')) return regularIr(infinitive);
    if (infinitive.endsWith('re')) return regularRe(infinitive);
    return Array(6).fill(infinitive);
  }

  function prefixFrenchSubject(subject, form) {
    if (subject === 'Je' && /^[aeiouyhàâäéèêëîïôöùûüœ]/i.test(form)) return `J'${form}`;
    return `${subject} ${form}`;
  }

  function frenchTranslation(verb, row) {
    const forms = conjugateFrenchVerb(preferredFrench(verb));
    const first = prefixFrenchSubject(row.frSubject, forms[row.person]);

    if (row.secondPerson !== undefined) {
      const second = prefixFrenchSubject(row.secondFrSubject, forms[row.secondPerson]);
      return `${first} / ${second}`;
    }
    return row.object ? `${first} (objet/animal/chose)` : first;
  }

  function tableSpeech(verb) {
    return rows.map(row => englishPresent(verb, row)).join('. ') + '.';
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
      const matchesText = !query || normalizeText(
        `${verb.base} ${verb.past} ${verb.participle} ${verb.fr} ${preferredFrench(verb)}`
      ).includes(query);
      return matchesText && (type === 'all' || verb.type === type);
    });
    renderVerbs();
  }

  function renderVerbs() {
    const visible = filtered.slice(0, visibleCount);
    count.textContent = `${filtered.length} verbe${filtered.length > 1 ? 's' : ''}`;
    empty.hidden = filtered.length !== 0;
    loadMore.hidden = visible.length >= filtered.length;

    list.innerHTML = visible.map((verb, verbIndex) => {
      const conjugationRows = rows.map((row, rowIndex) => {
        const english = englishPresent(verb, row);
        return `
          <tr>
            <th scope="row">${escapeHtml(row.en)}</th>
            <td class="englishCell">
              <strong>${escapeHtml(english)}</strong>
              <button class="rowAudio" data-verb-index="${verbIndex}" data-row-index="${rowIndex}" aria-label="Écouter ${escapeHtml(english)}">🔊</button>
            </td>
            <td class="pronunciationCell">(${escapeHtml(englishPronunciation(english))})</td>
            <td class="frenchCell">${escapeHtml(frenchTranslation(verb, row))}</td>
          </tr>`;
      }).join('');

      return `
        <article class="verbCard conjugationCard pdfVerbCard">
          <header class="conjugationHeader pdfVerbHeader">
            <div>
              <span class="verbNumber">TO ${escapeHtml(verb.base.toUpperCase())}</span>
              <strong>${escapeHtml(preferredFrench(verb).toUpperCase())}</strong>
              <span class="tag ${escapeHtml(verb.type)}">${verb.type === 'irregular' ? 'Irrégulier' : 'Régulier'}</span>
            </div>
            <button class="soundButton" data-full-verb="${verbIndex}" aria-label="Écouter tout le tableau de ${escapeHtml(verb.base)}">🔊</button>
          </header>

          <div class="verbForms summaryForms">
            <div class="verbForm"><small>Base</small><span>${escapeHtml(verb.base)}</span></div>
            <div class="verbForm"><small>Prétérit</small><span>${escapeHtml(verb.past)}</span></div>
            <div class="verbForm"><small>Participe passé</small><span>${escapeHtml(verb.participle)}</span></div>
          </div>

          <div class="conjugationScroll pdfTableScroll" role="region" aria-label="Conjugaison complète de ${escapeHtml(verb.base)}" tabindex="0">
            <table class="conjugationTable pdfVerbTable">
              <thead><tr><th>Personne</th><th>Conjugaison</th><th>Prononciation</th><th>Français</th></tr></thead>
              <tbody>${conjugationRows}</tbody>
            </table>
          </div>
        </article>`;
    }).join('');

    list.querySelectorAll('[data-full-verb]').forEach(button => {
      button.addEventListener('click', () => {
        const verb = visible[Number(button.dataset.fullVerb)];
        speak(tableSpeech(verb), 0.66);
      });
    });

    list.querySelectorAll('.rowAudio').forEach(button => {
      button.addEventListener('click', () => {
        const verb = visible[Number(button.dataset.verbIndex)];
        const row = rows[Number(button.dataset.rowIndex)];
        speak(englishPresent(verb, row), 0.7);
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
    speak(tableSpeech(verb), 0.66);
  });

  renderAlphabet();
  applyFilters();
})();
