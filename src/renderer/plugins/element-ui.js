import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIcons from '@element-plus/icons-vue'

// Map of old element-ui icon names → element-plus icon components.
// Components are also registered under their PascalCase names (e.g. "Edit")
// so that icon="SomeIcon" string references work via resolveComponent.
const iconAliases = {
  'el-icon-arrow-down':     ElementPlusIcons.ArrowDown,
  'el-icon-arrow-up':       ElementPlusIcons.ArrowUp,
  'el-icon-box':            ElementPlusIcons.Box,
  'el-icon-check':          ElementPlusIcons.Check,
  'el-icon-circle-check':   ElementPlusIcons.CircleCheck,
  'el-icon-close':          ElementPlusIcons.Close,
  'el-icon-delete':         ElementPlusIcons.Delete,
  'el-icon-document-add':   ElementPlusIcons.DocumentAdd,
  'el-icon-download':       ElementPlusIcons.Download,
  'el-icon-edit':           ElementPlusIcons.Edit,
  'el-icon-files':          ElementPlusIcons.Files,
  'el-icon-folder':         ElementPlusIcons.Folder,
  'el-icon-link':           ElementPlusIcons.Link,
  'el-icon-loading':        ElementPlusIcons.Loading,
  'el-icon-plus':           ElementPlusIcons.Plus,
  'el-icon-refresh':        ElementPlusIcons.RefreshRight,
  'el-icon-refresh-left':   ElementPlusIcons.RefreshLeft,
  'el-icon-refresh-right':  ElementPlusIcons.RefreshRight,
  'el-icon-search':         ElementPlusIcons.Search,
  'el-icon-switch-button':  ElementPlusIcons.SwitchButton,
  'el-icon-sync':           ElementPlusIcons.Refresh,
  'el-icon-time':           ElementPlusIcons.Clock,
  'el-icon-upload2':        ElementPlusIcons.Upload,
  'el-icon-user':           ElementPlusIcons.User,
  'el-icon-warning-outline': ElementPlusIcons.Warning,
}

export default {
  install(app) {
    app.use(ElementPlus)

    // Register all element-plus icons under their PascalCase names
    for (const [name, component] of Object.entries(ElementPlusIcons)) {
      app.component(name, component)
    }

    // Also register under the old element-ui el-icon-xxx names for backward compat
    for (const [name, component] of Object.entries(iconAliases)) {
      app.component(name, component)
    }
  }
}
