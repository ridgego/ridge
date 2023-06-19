import { defineStore, createPinia, storeToRefs } from 'pinia'
import { watch } from 'vue'

export default class PageStore {
  constructor (pageElementManager) {
    this.pageElementManager = pageElementManager
    this.ridge = pageElementManager.ridge
    // if (!this.ridge.pinia) {
    this.ridge.pinia = createPinia()
    // }
    // 一个页面支持多个store
    this.storeObjects = {} // 定义
    this.stores = {} // pinia store
    this.storeTrees = {} //

    this.watcherCallbacks = {}
  }

  getStoreValue (expr, payload) {
    const [storeKey, stateExpr] = expr.split('.')
    if (this.stores[storeKey]) {
      // getters
      const result = this.stores[storeKey][stateExpr]
      if (typeof result === 'function') {
        return result.apply(null, payload)
      } else {
        return result
      }
    }
  }

  dispatchStateChange (expr, val) {
    const [storeKey, stateExpr] = expr.split('.')

    if (this.stores[storeKey] && this.stores[storeKey][stateExpr] != null) {
      this.stores[storeKey].$patch({
        [stateExpr]: val
      })
    }
  }

  subscribe (expr, cb) {
    const [storeKey, stateExpr] = expr.split('.')

    this.watcherCallbacks[storeKey][stateExpr].push(cb)

    // this.stores[storeKey].$subscribe((mutation, state) => {
    //   if (!mutation.payload) {
    //     cb()
    //   } else if (mutation.payload && mutation.payload[stateExpr]) {
    //     cb()
    //   }
    // })
  }

  doStoreAction (storeKey, action, payload) {
    if (this.stores[storeKey] && this.stores[storeKey][action]) {
      this.stores[storeKey][action](...payload)
    }
  }

  updateStore () {
    const { pageConfig } = this.pageElementManager
    const { properties, id } = pageConfig
    const scriptEls = document.querySelectorAll('script.page-' + id)
    for (const el of scriptEls) {
      document.head.removeChild(el)
    }
    this.stores = {}

    if (properties.jsFiles && properties.jsFiles.length) {
      for (const jsFilePath of properties.jsFiles) {
        const file = this.ridge.appService.filterFiles(f => f.path === jsFilePath)[0]
        if (file) {
          const moduleName = file.label.substring(0, file.label.length - 3)
          const scriptDiv = document.createElement('script')
          // scriptDiv.setAttribute('type', 'module')
          scriptDiv.classList.add('page-' + id)
          scriptDiv.textContent = file.textContent
          document.head.append(scriptDiv)

          this.storeObjects[moduleName] = globalThis[moduleName]
          const definedStore = defineStore('store', globalThis[moduleName])
          this.stores[moduleName] = definedStore(this.ridge.pinia)
          const refs = storeToRefs(this.stores[moduleName])
          this.storeTrees[moduleName] = this.parseStoreTree(globalThis[moduleName], file.textContent)

          this.watcherCallbacks[moduleName] = {}
          const treeState = this.storeTrees[moduleName].states

          for (const state of treeState) {
            console.log('state', state, 'type', typeof this.stores[moduleName][state.key])
            watch(refs[state.key], (val) => {
              console.log('key', state.key, ' -> ', val)
              for (const cb of this.watcherCallbacks[moduleName][state.key]) {
                cb()
              }
            })
            this.watcherCallbacks[moduleName][state.key] = []
          }
        }
      }
    }
  }

  parseStoreTree (storeDefModule, textContent) {
    const tree = {
      states: [],
      actions: []
    }
    const alias = storeDefModule.alias || {}
    Object.keys(storeDefModule.state()).forEach(key => {
      tree.states.push({
        key,
        alias: alias[key] || key
      })
    })
    Object.keys(storeDefModule.getters).forEach(key => {
      tree.states.push({
        key,
        alias: alias[key] || key
      })
    })
    Object.keys(storeDefModule.actions).forEach(key => {
      tree.actions.push({
        key,
        alias: alias[key] || key
      })
    })
    return tree
  }
}
