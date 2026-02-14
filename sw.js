const CACHE_NAME = 'chuchu-v2-static';
const DATA_CACHE_NAME = 'chuchu-v2-data';

// Lista de arquivos e CDNs para baixar e guardar no Cache
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  // Bibliotecas externas usadas no HTML (Essencial para funcionar offline)
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js'
];

// Instalação do Service Worker
self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Instalando');
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Fazendo cache dos arquivos estáticos');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Ativando');
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('[ServiceWorker] Removendo cache antigo', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Interceptação de requisições (Fetch)
self.addEventListener('fetch', (evt) => {
  // Estratégia: Cache First, falling back to Network (Melhor para apps "Offline First")
  evt.respondWith(
    caches.match(evt.request).then((response) => {
      if (response) {
        return response; // Retorna do cache se existir
      }
      return fetch(evt.request).then((networkResponse) => {
        // Se a resposta for válida, podemos querer cachear dinamicamente
        // (Opcional: cachear novas requisições não listadas)
        return networkResponse;
      }).catch((err) => {
        // Se falhar (sem internet) e não estiver no cache
        console.log('[ServiceWorker] Falha ao buscar', evt.request.url);
        // Aqui você poderia retornar uma página de "offline" genérica se fosse um site multi-página
      });
    })
  );
});
