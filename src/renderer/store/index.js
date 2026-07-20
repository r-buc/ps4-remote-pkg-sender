import { createStore } from 'vuex'
import pathify from './pathify'
import { createLocalStoragePlugin } from './plugins/persistence'

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
