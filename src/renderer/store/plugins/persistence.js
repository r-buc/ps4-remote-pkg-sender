import debounce from 'lodash/debounce'

const STORAGE_KEY = 'ps4-rps-store'

// Only persist modules whose state should survive page reloads/restarts.
// Volatile modules (queue, server) are intentionally excluded.
const PERSISTED_MODULES = ['app', 'auth', 'lang']

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
