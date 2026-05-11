import { Workbox } from 'workbox-window';

let registeredWorkbox: Workbox | null = null;
const updateListeners = new Set<() => void>();

/**
 * Subscribe to SW "an update is waiting to be activated" events. The callback
 * fires once per detected update; UI calls {@link applyServiceWorkerUpdate}
 * after the user opts in, which posts SKIP_WAITING and reloads the page.
 */
export function onServiceWorkerUpdate(listener: () => void): () => void {
  updateListeners.add(listener);
  return () => {
    updateListeners.delete(listener);
  };
}

/** Tells the waiting SW to activate now and reloads the page. */
export function applyServiceWorkerUpdate(): void {
  if (!registeredWorkbox) {
    window.location.reload();
    return;
  }
  registeredWorkbox.addEventListener('controlling', () => {
    window.location.reload();
  });
  registeredWorkbox.messageSkipWaiting();
}

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
    registeredWorkbox = workbox;
    workbox.addEventListener('waiting', () => {
      updateListeners.forEach((listener) => listener());
    });
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
