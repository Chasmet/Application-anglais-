/* One current request, shared by every learning screen. */
(() => {
  'use strict';
  let sequence = 0, current = null;
  const emit = (state, detail = '') => window.dispatchEvent(new CustomEvent('learning-audio-state', { detail: { state, detail } }));
  function settle(id, status) {
    if (!current || current.id !== String(id)) return;
    const request = current; current = null; clearTimeout(request.timer);
    emit(status === 'error' ? 'error' : 'idle'); request.resolve(status);
  }
  function stop() {
    const id = current?.id;
    if (id) settle(id, 'cancelled');
    try { window.AndroidTTS?.stop?.(); } catch (_) {}
    try { window.speechSynthesis?.cancel(); } catch (_) {}
  }
  function speak(text, rate = 0.78, language = 'en-US') {
    stop();
    const phrase = String(text || '').trim();
    if (!phrase) return Promise.resolve('empty');
    const id = `${Date.now()}-${++sequence}`;
    return new Promise(resolve => {
      current = { id, resolve, timer: setTimeout(() => { if (current?.id === id) { stop(); emit('error', 'La voix ne répond pas. Réessaie.'); } }, Math.max(15000, phrase.length * 220)) };
      emit('preparing');
      try {
        if (window.AndroidTTS?.speakRequest) { AndroidTTS.speakRequest(phrase, rate, language, id); return; }
        if ('speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(phrase); u.lang = language; u.rate = rate;
          u.onstart = () => { if (current?.id === id) emit('speaking'); };
          u.onend = () => settle(id, 'done'); u.onerror = () => settle(id, 'error');
          speechSynthesis.speak(u); return;
        }
      } catch (_) {}
      settle(id, 'error');
    });
  }
  function preload(text, rate = 0.78) { try { window.AndroidTTS?.preload?.(String(text), rate); } catch (_) {} }
  window.onNativeTtsFinished = (id, status = 'done') => settle(id, status);
  window.onNativeTtsStarted = id => { if (current?.id === String(id)) emit('speaking'); };
  window.onNativeAudioInterrupted = () => { stop(); window.dispatchEvent(new Event('learning-interrupted')); };
  window.LearningAudio = { speak, stop, preload, isBusy: () => current !== null };
  window.addEventListener('pagehide', stop);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stop(); try { window.AndroidSpeech?.cancelRecognition?.(); } catch (_) {} window.dispatchEvent(new Event('learning-interrupted')); }
  });
})();
