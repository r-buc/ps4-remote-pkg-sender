const { ipcRenderer } = require('electron')

/**
 * Vuex plugin that keeps the given namespaced modules in sync across all
 * Electron windows.
 *
 * Each BrowserWindow (main, the hidden server window, the ps4 log window,
 * the info window) loads its own copy of the renderer bundle and therefore
 * gets its own independent Vuex store instance - there is no shared state
 * between them out of the box. Committing a mutation in one window's copy
 * of a module is invisible to every other window unless it's relayed
 * explicitly, which is exactly what this plugin does for the given module
 * namespaces (e.g. ['queue']).
 *
 * Only mutations whose namespaced type starts with one of the given module
 * names are broadcast; everything else stays purely local to each window.
 */
export function createCrossWindowSyncPlugin(namespaces = []) {
  return (store) => {
    let applyingRemote = false

    ipcRenderer.on('store-sync', (event, { type, payload }) => {
      applyingRemote = true
      try {
        store.commit(type, payload)
      }
      finally {
        applyingRemote = false
      }
    })

    store.subscribe((mutation) => {
      if (applyingRemote)
        return

      if (!namespaces.some(ns => mutation.type.startsWith(ns + '/')))
        return

      // Electron IPC uses the structured clone algorithm, which can't clone
      // Vue reactive Proxy objects - send a plain copy instead.
      let payload
      try {
        payload = mutation.payload === undefined ? undefined : JSON.parse(JSON.stringify(mutation.payload))
      }
      catch (e) {
        console.warn('[Store Sync] Failed to serialize payload for', mutation.type, e)
        return
      }

      ipcRenderer.send('store-sync', { type: mutation.type, payload })
    })
  }
}
