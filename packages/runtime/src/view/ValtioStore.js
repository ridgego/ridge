import { filename, nanoid } from '../utils/string'
import { proxy, subscribe } from 'valtio/vanilla'
import { subscribeKey } from 'valtio/utils'

/**
 * Store engine based on Valtio Lib(Proxied Object)
 **/
export default class ValtioStore {
  constructor () {
    this.storeObjects = {} // loaded store definition
    this.stores = {} // Valtio proxied
    this.watchers = {}
  }

  /**
   * 获取状态值，支持以下格式
   * 'storeName.stateName'
   * 'storeName.getterName'
   * 'storeName.stateName.stateField'
   * 'storeName.stateName.stateField.subField'
   * @param {*} expr 状态值表达式
   * @param {*} payload 为getter时 计算的参数
   * @returns
   */
  getStoreValue (expr, payload) {
    const [storeKey, ...path] = expr.split('.')
    if (this.stores[storeKey]) {
      // getters
      const result = this.stores[storeKey][path[0]]
      if (typeof result === 'function') {
        return result.apply(null, payload)
      } else {
        return this.getByPath(this.stores[storeKey], path)
      }
    }
  }

  /**
   * 按照路径 获取对象field值
   * @param {Object} o 对象
   * @param {Array} path
   * @returns
   */
  getByPath (o, path) {
    let result = o
    for (let i = 0; i < path.length; i++) {
      if (result == null) {
        break
      }
      result = result[path[i]]
    }
    return result
  }

  /**
   * 执行store值改变
   * @param {*} expr 表达式
   * @param {*} val
   */
  dispatchStateChange (expr, val) {
    const [storeKey, ...path] = expr.split('.')

    if (!this.stores[storeKey]) {
      if (globalThis[storeKey] && globalThis[storeKey].state) {
        this.registerPageStore(storeKey, globalThis[storeKey])
      }
    }

    if (this.stores[storeKey]) {
      this.stores[storeKey][path] = val
    }
  }

  subscribe (expr, cb) {
    const [storeKey, stateExpr] = expr.split('.')
    if (this.watchers[storeKey] == null)  {
      this.watchers[storeKey] = {}
    }
    if (this.watchers[storeKey][stateExpr] == null) {
      this.watchers[storeKey][stateExpr] = []
    }
    this.watchers[storeKey][stateExpr].push(cb)
  }

  doStoreAction (storeKey, action, payload) {
    if (this.stores[storeKey] && this.stores[storeKey][action]) {
      this.stores[storeKey][action](...payload)
    }
  }

  /**
   * 更新/加载页面的storejs
   */
  async updateStore (storeFiles) {
    if (storeFiles && storeFiles.length) {
      for (const storeFile of storeFiles) {
        const moduleName = filename(storeFile)
        const StoreModule = await this.loadStoreModule(storeFile)
        if (StoreModule) {
          if (StoreModule) {
            this.registerPageStore(moduleName, StoreModule)
          }
        }
      }
    }
  }

  async loadStoreModule (jsPath) {
    const resolveKey = 'resolve-' + nanoid(5)
    const scriptDiv = document.createElement('script')
    scriptDiv.setAttribute('type', 'module')
    scriptDiv.setAttribute('async', true)
    document.head.append(scriptDiv)
    scriptDiv.textContent = `import * as Module from '${jsPath}'; window['${resolveKey}'](Module);`
    return await new Promise((resolve, reject) => {
      window[resolveKey] = (Module) => {
        delete window[resolveKey]
        resolve(Module)
      }
    })
  }

  /**
   * 使用Pinia引擎进行store初始化
   * @param {*} moduleName
   * @param {*} storeModule
   */
  registerPageStore (moduleName, storeModule) {
    this.storeObjects[moduleName] = storeModule

    this.stores[moduleName] = {}

    if (typeof storeModule.state === 'function') {
      this.stores[moduleName].state = proxy(storeModule.state())
    }

    if (storeModule.computed) {
      this.stores[moduleName].computed = {}
      for (const key of Object.keys(storeModule.computed)) {
        const computedState = storeModule.computed[key]
        if (typeof computedState === 'function') { // only getter
          this.stores[moduleName].computed[key] = computedState(this.stores[moduleName].state)
        }
      }
    }

    this.storeTrees[moduleName] = this.parseStoreTree(moduleName, storeModule)

    subscribe(this.stores[moduleName], newState => {

    })
    this.watcherCallbacks[moduleName] = {}
    const treeState = this.storeTrees[moduleName].states

    for (const state of treeState) {
      subscribeKey(this.stores[moduleName], state.key, (val) => {
        for (const cb of this.watcherCallbacks[moduleName][state.key]) {
          cb.apply(this.stores[moduleName])
        }
      }, {
        deep: true
      })
      this.watcherCallbacks[moduleName][state.key] = []
    }
  }
}
