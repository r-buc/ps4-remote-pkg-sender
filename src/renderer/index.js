import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './plugins/i18n'

import plugins from './plugins'
import components from './components'

// Load saved locale on startup
const savedLocale = store?.getters?.['lang/locale'] || 'en'
i18n.loadMessages(savedLocale).catch(e => console.warn('Failed to load locale:', e))

const app = createApp(App)

app.config.errorHandler = (error, vm, info) => {
  alert("Application global errorHandler:\n" + error)
}

app
  .use(store)
  .use(router)
  .use(i18n)
  .use(plugins)
  .use(components)
  .mount('#app')

// global window error catcher
window.onerror = function(message=null, source=null, lineno=null, colno=null, error=null) {
  console.log(message, source, lineno, colno, error)

  if(error != null)
      alert('Message ' + message +
          '\nSource ' + source +
          '\nLine ' + lineno +
          '\nColNo'  + colno +
          '\nError ' + error)
};

window.addEventListener('unhandledrejection', function(event) {
    //handle error here
    //event.promise contains the promise object
    //event.reason contains the reason for the rejection
    console.log(event)
    alert(event.reason)
});

console.log('Step 4: App.vue mounted with router + store + i18n + plugins + components');
