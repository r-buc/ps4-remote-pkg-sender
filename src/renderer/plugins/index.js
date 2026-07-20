import helperPlugin from './helper'
import elementUiPlugin from './element-ui'
import axiosPlugin from './axios'
import ps4Plugin from './ps4'
import ps4GoldhenPlugin from './ps4_goldhen'
import ps5Plugin from './ps5'
import gitPlugin from './git'
import debouncePlugin from './debounce'

export default {
  install(app) {
    app.use(helperPlugin)
    app.use(elementUiPlugin)
    app.use(axiosPlugin)
    app.use(ps4Plugin)
    app.use(ps4GoldhenPlugin)
    app.use(ps5Plugin)
    app.use(gitPlugin)
    app.use(debouncePlugin)
  }
}
