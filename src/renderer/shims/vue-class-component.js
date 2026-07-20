/**
 * Minimal no-op shim for vue-class-component (Vue 2 only library).
 * vuex-pathify imports it to register class-component lifecycle hooks
 * and create property decorators, which are not used in this project
 * (Options API only). This shim prevents the Vue-2-specific
 * default-export error during bundling.
 */
const Component = function (target) { return target }
Component.registerHooks = function () {}

export const createDecorator = function (factory) {
  return function (target, key, index) {}
}

export default Component
