const CACHE_NAME='quiz-anglais-v16';
const FILES=[
'./learning-core.js','./audio-controller.js','./speech-evaluation.js','./learning-accessibility.css','./','./index.html','./classic.html','./settings.html','./settings.js',
'./adult.html','./adult-conversation.html','./adult-training.html','./adult-oral.html','./passive-oral.html','./adult.css','./adult-oral.css','./adult-data.js','./adult-conversation.js','./adult-training.js','./adult-scenarios-160.js','./adult-oral.js','./passive-oral.js',
'./quiz.html','./style.css','./app.js','./words.js','./words-debutant.js','./words-moyen.js','./words-confirme.js','./lessons.js','./phrases-extra.js','./activities-extra.js','./content-ultra.js','./corrections-plus.js','./academie.html','./academie.js','./chiffres.html','./chiffres.js','./vocabulaire.html','./vocabulaire.js','./grammaire.html','./grammaire.js','./grammaire-ux.js','./grammaire-ux.css','./grammar-data.js','./verb-pronunciation.js','./french-verb-data.js','./learning-tools.css','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('quiz-anglais-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Keep the HTML and scripts from one complete version together, including offline.
  const cacheKey = url.pathname;
  event.respondWith(caches.open(CACHE_NAME).then(async cache => {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
    try { return await fetch(request); }
    catch (error) { if (request.mode === 'navigate') return cache.match('./index.html'); throw error; }
  }));
});
