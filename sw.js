const CACHE_NAME='quiz-anglais-v13';
const FILES=[
  './','./index.html','./classic.html',
  './adult.html','./adult-conversation.html','./adult-training.html','./adult.css','./adult-data.js','./adult-conversation.js','./adult-training.js',
  './quiz.html','./style.css','./app.js',
  './words.js','./words-debutant.js','./words-moyen.js','./words-confirme.js',
  './lessons.js','./phrases-extra.js','./activities-extra.js','./content-ultra.js','./corrections-plus.js',
  './academie.html','./academie.js','./chiffres.html','./chiffres.js',
  './vocabulaire.html','./vocabulaire.js',
  './grammaire.html','./grammaire.js','./grammaire-ux.js','./grammaire-ux.css','./grammar-data.js',
  './verb-pronunciation.js','./french-verb-data.js',
  './learning-tools.css','./manifest.webmanifest','./icon.svg'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(FILES)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))));self.clients.claim();});
self.addEventListener('fetch',event=>{const request=event.request;if(request.mode==='navigate'){event.respondWith(fetch(request).then(response=>{const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));return response;}).catch(()=>caches.match(request).then(cached=>cached||caches.match('./index.html'))));return;}event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));return response;})));});