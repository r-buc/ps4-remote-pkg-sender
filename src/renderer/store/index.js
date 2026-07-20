import { createStore } from 'vuex'
import pathify from './pathify'
import { createLocalStoragePlugin } from './plugins/persistence'
import { createCrossWindowSyncPlugin } from './plugins/crossWindowSync'

// Load store modules dynamically.
const modulesList = import.meta.glob('./modules/*.js', { eager: true })

const modules = Object.keys(modulesList)
    .map(file => [file.replace(/^\.\/modules\//, '').replace(/\.js$/, ''), modulesList[file]])
    .reduce((modules, [name, module]) => {
        let mod = module.default || module;
        mod = { ...mod }; // Make it extensible
        if (mod.namespaced === undefined) {
            mod.namespaced = true
        }

        return { ...modules, [name]: mod }
    }, {})

function createStoreInstance(){
    return createStore({
        plugins: [
            pathify.plugin,
            createLocalStoragePlugin(),
            // 'queue' is written from the main window (install/queue actions)
            // but also read from the hidden server window (to tag served
            // files as 'in queue'/'installed'). 'server' is the reverse: its
            // servingFiles/draggedServingFiles/routes/status are computed
            // only inside the hidden server window (createPaths/
            // addFileEndpoint, since only that window knows the actual
            // bound ip:port for each file's url), but displayed by the main
            // window's Server list page. Each window otherwise has its own
            // isolated store, so both need to be kept in sync explicitly.
            createCrossWindowSyncPlugin(['queue', 'server']),
        ],
        modules
    })
}

let store
let lastError

for (let attempt = 0; attempt < 5 && store === undefined; attempt++) {
    try {
        store = createStoreInstance()
    }
    catch (e) {
        lastError = e
        console.error('[Store] createStoreInstance() failed on attempt ' + (attempt + 1), e)
    }
}

if (store === undefined) {
    throw lastError || new Error('[Store] createStoreInstance() failed and produced no store')
}

export default store
