/**
 * PWA Auto-Update Mechanism
 * - Detects new versions in background
 * - Offers non-intrusive in-app banner to Update Now or Defer
 * - If user defers, automatically applies the update on the next launch with zero user intervention
 */

export interface PwaUpdateHandlers {
  onUpdateAvailable: (applyFn: () => void, deferFn: () => void) => void;
}

export function initPwaAutoUpdate(handlers: PwaUpdateHandlers) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || window.location.protocol === 'file:') {
    return;
  }

  const STORAGE_KEY_PENDING_UPDATE = 'polytube_update_pending';
  const SESSION_KEY_ACTIVE = 'polytube_session_active';

  // Check if this is a fresh launch (new window/tab instance)
  const isFreshLaunch = !sessionStorage.getItem(SESSION_KEY_ACTIVE);
  sessionStorage.setItem(SESSION_KEY_ACTIVE, 'true');

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js');

      const applyUpdate = (worker: ServiceWorker) => {
        localStorage.removeItem(STORAGE_KEY_PENDING_UPDATE);
        worker.postMessage({ type: 'SKIP_WAITING' });
      };

      const deferUpdate = () => {
        // User deferred update for this session; mark for automatic activation on next launch
        localStorage.setItem(STORAGE_KEY_PENDING_UPDATE, 'true');
      };

      // 1. AUTO-UPDATE ON NEXT LAUNCH:
      // If there is already a waiting worker from a previous session (or user previously deferred):
      if (reg.waiting) {
        if (isFreshLaunch || localStorage.getItem(STORAGE_KEY_PENDING_UPDATE) === 'true') {
          console.log('✨ Auto-applying previously deferred update on fresh launch...');
          applyUpdate(reg.waiting);
          return;
        } else {
          handlers.onUpdateAvailable(
            () => applyUpdate(reg.waiting!),
            deferUpdate
          );
        }
      }

      // 2. DETECT UPDATES ARRIVING WHILE USER IS USING THE APP:
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version downloaded in the background while user is active
            if (isFreshLaunch && localStorage.getItem(STORAGE_KEY_PENDING_UPDATE) === 'true') {
              // Auto-apply on fresh launch
              applyUpdate(newWorker);
            } else {
              // Active session: Show non-intrusive prompt
              handlers.onUpdateAvailable(
                () => applyUpdate(newWorker),
                deferUpdate
              );
            }
          }
        });
      });

      // 3. PERIODIC BACKGROUND UPDATE CHECKS:
      // A) Check when user switches back to the app window
      window.addEventListener('focus', () => {
        reg.update().catch(() => {});
      });

      // B) Check on document visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          reg.update().catch(() => {});
        }
      });

      // C) Heartbeat: check every 15 minutes
      setInterval(() => {
        reg.update().catch(() => {});
      }, 15 * 60 * 1000);

    } catch (err) {
      console.warn('Service worker registration or update check failed:', err);
    }
  });
}
