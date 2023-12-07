import debug from 'debug'
import { proxy, subscribe, snapshot } from 'valtio/vanilla'
const log = debug('ridge:store')
const error = debug('ridge:store-error')
/**
 * Store engine based on Valtio Lib(Proxied Object)
 **/
export default class ValtioStore {
  constructor () {
    this.storeModules = {} // Store by Name
    this.storeStates = {} // Valtio proxied state by StoreName
    this.storeComputed = {}
    this.watchers = {}

    this.stateWatchers = {} // Watch State by StoreName
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
   * 'storeName.state.stateName'
   * 'storeName.computed.computeValue'
   * 'storeName.scoped.scopeCal'
   * @param {*} expr 状态值表达式
   * @param {*} payload 为scoped时 计算的参数
   * @returns
   */
  getStoreValue (expr, payload) {
    const [storeKey, type, stateName] = expr.split('.')
    const stateValues = snapshot(this.storeStates[storeKey])
    let result = null
    if (type === 'state' && this.storeStates[storeKey]) {
      result = stateValues[stateName]
    } else if (type === 'scoped') {
      try {
        // 执行表达式
        const scoped = this.storeModules[storeKey].scoped[stateName]
        if (scoped) {
          if (typeof scoped === 'function') {
            result = this.storeModules[storeKey].scoped[stateName].apply(stateValues, [stateValues, ...payload])
          } else if (typeof this.storeModules[storeKey].scoped[stateName].get === 'function') {
            result = this.storeModules[storeKey].scoped[stateName].get.apply(stateValues, [stateValues, ...payload])
          }
        }
      } catch (e) {
        error('getStoreValue Error', e)
      }
    }
    log('getStoreValue', expr, result)
    return result
  }

  subscribe (expr, cb) {
    const [storeKey, type, stateName] = expr.split('.')
    log('subscribe', expr)
    if (type === 'state') {
      if (this.stateWatchers[storeKey] == null) {
        this.stateWatchers[storeKey] = {}
      }
      if (this.stateWatchers[storeKey][stateName] == null) {
        this.stateWatchers[storeKey][stateName] = []
      }
      this.stateWatchers[storeKey][stateName].push(cb)
    } else if (type === 'scoped') {

    }
  }

  dispatchChange (expr, payload) {
    const [storeKey, type, stateName] = expr.split('.')
    if (type === 'state') {
      this.storeStates[storeKey][stateName] = payload[0]
    } else if (type === 'scoped') {
      if (typeof this.storeModules[storeKey]?.scoped[stateName]?.set === 'function') {
        try {
          this.storeModules[storeKey]?.scoped[stateName]?.set(...payload, this.storeStates[storeKey])
        } catch (e) {
          error('dispatchChange Error', e)
        }
      }
    }
  }

  doStoreAction (storeName, actionName, payload) {
    if (this.storeModules[storeName] && this.storeModules[storeName].actions[actionName]) {
      try {
        const exeResult = this.storeModules[storeName].actions[actionName].apply(this.storeStates[storeName], payload.filter(n => n != null))
        if (typeof exeResult === 'object') {
          Object.assign(this.storeStates[storeName], exeResult)
        }
      } catch (e) {
        log('doStoreAction Error', e)
      }
    }
  }

  /**
   * 使用Pinia引擎进行store初始化
   * @param {*} moduleName
   * @param {*} storeModule
   */
  registerPageStore (StoreModule) {
    log('RegisterPageStore', StoreModule)
    if (!StoreModule.name) {
      log('Store Not Registered: No Name')
      return
    }
    const moduleName = StoreModule.name
    this.storeModules[moduleName] = StoreModule
    this.storeStates[moduleName] = {}

    if (typeof StoreModule.state === 'function') {
      this.storeStates[moduleName] = proxy(StoreModule.state())
    } else if (typeof StoreModule.state === 'object') {
      this.storeStates[moduleName] = proxy(StoreModule.state)
    } else if (typeof StoreModule.data === 'function') {
      this.storeStates[moduleName] = proxy(StoreModule.data())
    } else if (typeof StoreModule.data === 'object') {
      this.storeStates[moduleName] = proxy(StoreModule.data)
    }

    // if (StoreModule.computed) {
    //   this.stores[moduleName].computed = {}
    //   for (const key of Object.keys(StoreModule.computed)) {
    //     const computedState = StoreModule.computed[key]
    //     if (typeof computedState === 'function') { // only getter
    //       try {
    //         this.stores[moduleName].computed[key] = computedState(this.stores[moduleName].state)
    //       } catch (e) {
    //         console.error('Error init computed', moduleName, key)
    //         console.error('Error detail', e)
    //       }
    //     }
    //   }
    // }
    if (this.storeStates[moduleName]) {
      subscribe(this.storeStates[moduleName], (mutations) => {
        log('mutations', mutations)
        const stateValue = snapshot(this.storeStates[moduleName])
        for (const mutation of mutations) {
          const [action, statePath, newValue, oldValue] = mutation
          log('mutation', action, statePath.join('.'), newValue, oldValue)

          this.setStateValue(moduleName, statePath[0], stateValue[statePath[0]])
        }
      })
    }
  }

  setStateValue (module, state, newValue) {
    log('state value', module, state, newValue)

    const watchers = this.stateWatchers[module][state]

    if (watchers) {
      watchers.forEach(cb => {
        cb(newValue)
      })
    }
  }
}
