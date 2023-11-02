import { proxy, subscribe } from 'valtio/vanilla'

/**
 * Store engine based on Valtio Lib(Proxied Object)
 **/
export default class ValtioStore {
  constructor () {
    this.stores = {} // Valtio proxied
    this.watchers = {}
  }

  /**
   * Load & Init JS-Stores
   **/
  load (modules) {
    for (const StoreModule of modules) {
      this.registerPageStore(StoreModule)
    }
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

    // if (!this.stores[storeKey]) {
    //   if (globalThis[storeKey] && globalThis[storeKey].state) {
    //     this.registerPageStore(storeKey, globalThis[storeKey])
    //   }
    // }

    if (this.stores[storeKey]) {
      this.stores[storeKey].state[storeKey] = val
    }
  }

  subscribe (expr, cb) {
    const [storeKey, stateExpr] = expr.split('.')
    if (this.watchers[storeKey] == null) {
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
   * 使用Pinia引擎进行store初始化
   * @param {*} moduleName
   * @param {*} storeModule
   */
  registerPageStore (StoreModule) {
    if (!StoreModule.name) {
      return
    }
    const moduleName = StoreModule.name

    this.stores[moduleName] = {}

    if (typeof StoreModule.state === 'function') {
      this.stores[moduleName].state = proxy(StoreModule.state())
    }

    if (StoreModule.computed) {
      this.stores[moduleName].computed = {}
      for (const key of Object.keys(StoreModule.computed)) {
        const computedState = StoreModule.computed[key]
        if (typeof computedState === 'function') { // only getter
          try {
            this.stores[moduleName].computed[key] = computedState(this.stores[moduleName].state)
          } catch (e) {
            console.error('Error init computed', moduleName, key)
            console.error('Error detail', e)
          }
        }
      }
    }

    subscribe(this.stores[moduleName].state, newState => {
      console.log('new State', newState)
    })
  }
}
