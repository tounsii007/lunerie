import { Workbox } from 'workbox-window';

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  if (import.meta.env.DEV) {
    void unregisterAll();
    return;
  }

  window.addEventListener('load', () => {
    const workbox = new Workbox('/sw.js');
    void workbox.register();
  });
}

async function unregisterAll(): Promise<void> {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
}
