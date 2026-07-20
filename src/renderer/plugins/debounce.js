import debounce from 'debounce'

export default {
  install(app) {
    app.config.globalProperties.$debounce = debounce
  }
}
