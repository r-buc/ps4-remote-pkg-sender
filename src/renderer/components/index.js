/*
    Autoload all current vue files as component and register them by their name.
    ---
    Author: Gkiokan Sali
    Date: 2019-05-09
*/

const modulesList = import.meta.glob('./*.vue', { eager: true })
const componentEntries = Object.keys(modulesList)
  .map(file => [file.replace(/^\.\//, '').replace(/\.vue$/, ''), modulesList[file]])

export default {
  install(app) {
    componentEntries.forEach(([name, component]) => {
      const Component = component.default || component
      if (Component.name) {
        app.component(Component.name, Component)
      }
    })
  }
}
