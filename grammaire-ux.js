(() => {
  const list = document.getElementById('verbList');
  if (!list) return;

  function transformCard(card) {
    if (!card || card.dataset.uxReady === '1') return;
    const table = card.querySelector('.pdfVerbTable');
    if (!table) return;

    const tbodyRows = [...table.querySelectorAll('tbody tr')];
    const mobileList = document.createElement('div');
    mobileList.className = 'mobileConjugationList';

    tbodyRows.forEach(tr => {
      const cells = tr.querySelectorAll('th,td');
      if (cells.length < 4) return;
      const person = cells[0].textContent.trim();
      const englishCell = cells[1];
      const english = englishCell.querySelector('strong')?.textContent.trim() || englishCell.textContent.trim();
      const audio = englishCell.querySelector('.rowAudio');
      const pronunciation = cells[2].textContent.trim();
      const french = cells[3].textContent.trim();

      const row = document.createElement('div');
      row.className = 'mobileConjugationRow';
      row.innerHTML = `
        <div class="mobileRowHead"><span class="personBadge">${person}</span><span class="frenchQuick">${french}</span></div>
        <div class="mobileEnglish"><strong>${english}</strong></div>
        <div class="mobilePronunciation">${pronunciation}</div>
      `;
      if (audio) {
        audio.classList.add('mobileAudio');
        row.querySelector('.mobileRowHead').appendChild(audio);
      }
      mobileList.appendChild(row);
    });

    const scroll = card.querySelector('.pdfTableScroll');
    if (scroll) scroll.replaceWith(mobileList);
    card.dataset.uxReady = '1';
  }

  function transformAll() {
    list.querySelectorAll('.pdfVerbCard').forEach(transformCard);
  }

  const observer = new MutationObserver(() => transformAll());
  observer.observe(list, { childList: true, subtree: true });
  transformAll();
})();