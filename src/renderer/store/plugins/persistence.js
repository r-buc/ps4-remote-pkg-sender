import debounce from 'lodash/debounce'

const STORAGE_KEY = 'ps4-rps-store'

// Only persist modules whose state should survive page reloads/restarts.
// Volatile modules (queue, server) are intentionally excluded.
const PERSISTED_MODULES = ['app', 'auth', 'lang']

// Every Electron BrowserWindow (main, the hidden server window, the ps4 log
// window, the info window) loads this same renderer bundle and therefore
// runs its own independent store + App.vue heartbeat (dispatches
// 'app/addTime' every second). If every window also WROTE its own state to
// localStorage on every mutation, whichever window's heartbeat fired last
// would clobber the others' writes with its own (possibly stale, since
// config edits made in one window aren't automatically reflected in
// another) copy of the 'app' module - silently reverting things like
// server.ip/server.base_path shortly after they were set. Only the main
// window is allowed to persist; every window still rehydrates on boot.
function isMainWindow(){
  const hash = window.location.hash || ''
  return !['#/app/Server', '#/ps4', '#/info'].some(route => hash.startsWith(route))
}

export function createLocalStoragePlugin() {
  return (store) => {
    // Rehydrate persisted modules on init
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const savedState = JSON.parse(saved)
        const merged = { ...store.state }
        PERSISTED_MODULES.forEach(mod => {
          if (savedState[mod] !== undefined) {
            merged[mod] = { ...store.state[mod], ...savedState[mod] }
          }
        })
        store.replaceState(merged)
      }
    } catch (e) {
      console.warn('[Store] Failed to rehydrate state from localStorage', e)
    }

    if (!isMainWindow())
      return

    // Persist selected modules after mutations; debounced to avoid excessive writes.
    const persist = debounce((state) => {
      try {
        const toSave = {}
        PERSISTED_MODULES.forEach(mod => {
          if (state[mod] !== undefined) toSave[mod] = state[mod]
        })
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
      } catch (e) {
        console.warn('[Store] Failed to persist state to localStorage', e)
      }
    }, 500)

    store.subscribe((_mutation, state) => persist(state))
  }
}
