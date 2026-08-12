// Firebase Messaging Service Worker placeholder
// Prevents 500 errors when browser extensions or Firebase clients request this file statically
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
