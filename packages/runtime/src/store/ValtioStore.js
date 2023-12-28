import debug from 'debug'
import { proxy, subscribe, snapshot } from 'valtio/vanilla'

const log = debug('ridge:store')
const error = debug('ridge:store-error')
/**
 * Store engine based on Valtio Lib(Proxied Object)
 **/
export default class ValtioStore {
  constructor (composite) {
    this.composite = composite // 所在组件
    this.properties = composite.properties // 初始化store参数属性

    // Store定义
    this.storeModules = {}
    // Store实时状态
    this.storeStates = {}

    // 状态监听者
    this.stateWatchers = {}
    // 组件及更新方法映射
    this.callbackMap = new Map()
    this.scheduledJobs = new Set()
  }

  // 设置初始化参数,设置时,所有注册store会全部初始化。 同时页面会重新渲染（按必要）
  setProperties (properties) {
    this.properties = properties

    for (const StoreModule of Object.values(this.storeModules)) {
      this.initializeModule(StoreModule)
    }
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
    // log('getStoreValue', expr, result)
    return result
  }

  // 对表达式进行订阅
  subscribe (expr, cb, uuid) {
    const [storeKey, type, stateName] = expr.split('.')
    log('subscribe', expr)
    this.stateWatchers[storeKey] = this.stateWatchers[storeKey] ?? {}

    this.callbackMap.set(uuid, cb)
    if (type === 'state') {
      this.stateWatchers[storeKey][stateName] = this.stateWatchers[storeKey][stateName] ?? new Set()
      this.stateWatchers[storeKey][stateName].add(uuid)
    } else if (type === 'scoped') {
      const stateKeys = Object.keys(this.storeStates[storeKey])
      try {
        // 读取函数定义， 获取 scoped 方法依赖的state
        const scopedFunctionText = this.storeModules[storeKey].scoped?.[stateName]?.toString()
        for (const stateKey of stateKeys) {
          if (scopedFunctionText.indexOf(stateKey) > -1) {
            this.stateWatchers[storeKey][stateKey] = this.stateWatchers[storeKey][stateKey] ?? new Set()
            this.stateWatchers[storeKey][stateKey].add(uuid)
          }
        }
      } catch (e) {
        // ignore
      }
    } else if (type === 'computed') {
      const stateKeys = Object.keys(this.storeStates[storeKey])
      try {
        // 读取函数定义， 获取 scoped 方法依赖的state
        const scopedFunctionText = this.storeModules[storeKey].computed?.[stateName]?.toString()
        for (const stateKey of stateKeys) {
          if (scopedFunctionText.indexOf(stateKey) > -1) {
            this.stateWatchers[storeKey][stateKey] = this.stateWatchers[storeKey][stateKey] ?? new Set()
            this.stateWatchers[storeKey][stateKey].add(uuid)
          }
        }
      } catch (e) {
        // ignore
      }
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

  doStoreAction (storeName, actionName, event, scopedData) {
    if (this.storeModules[storeName] && this.storeModules[storeName].actions[actionName]) {
      try {
        const context = {
          state: this.storeStates[storeName],
          scopes: scopedData,
          composite: this.composite
        }

        if (scopedData && scopedData.length >= 1) {
          context.scope = scopedData[0]
        }

        const exeResult = this.storeModules[storeName].actions[actionName].call(null, event, context)
        if (typeof exeResult === 'object') {
          Object.assign(this.storeStates[storeName], exeResult)
        }
      } catch (e) {
        console.error('doStoreAction Error', e)
      }
    }
  }

  /**
   * 进行Store初始化
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

    this.initializeModule(StoreModule)
  }

  // 初始化Store
  initializeModule (StoreModule) {
    const moduleName = StoreModule.name

    // 从属性初始化组件state
    if (typeof StoreModule.state === 'function') {
      try {
        this.storeStates[moduleName] = proxy(StoreModule.state(this.properties, this.storeStates[moduleName] ? snapshot(this.storeStates[moduleName]) : {}))
      } catch (e) {
        console.error('initializeModule Error', e)
      }
    } else if (typeof StoreModule.state === 'object') {
      this.storeStates[moduleName] = proxy(StoreModule.state)
    }

    // 判断 初始化过后部重复监听
    if (this.storeStates[moduleName]) {
      // 初始化监听state变化
      subscribe(this.storeStates[moduleName], mutations => {
        this.onMutation(moduleName, mutations)
      })
    }

    // 更新所有相关组件属性
    for (const stateWatchers of Object.values(this.stateWatchers[moduleName] ?? {})) {
      this.scheduleCallback(stateWatchers)
    }
    this.flushScheduledJobs()
  }

  // State改变处理
  onMutation (moduleName, mutations) {
    log('mutations', mutations)
    const stateValue = snapshot(this.storeStates[moduleName])
    for (const mutation of mutations) {
      const [action, statePath, newValue, oldValue] = mutation
      log('mutation', action, statePath.join('.'), newValue, oldValue)
      this.setStateValue(moduleName, statePath[0], stateValue[statePath[0]])
    }
    this.flushScheduledJobs()
  }

  // state变更
  setStateValue (module, state, newValue) {
    log('state value', module, state, newValue)

    const watchers = this.stateWatchers[module][state]

    if (watchers) {
      this.scheduleCallback(watchers)
    }

    if (this.storeModules[module].watch && this.storeModules[module].watch[state]) {
      this.storeModules[module].watch[state](newValue, {
        state: this.storeStates[module],
        composite: this.composite
      })
    }
  }

  scheduleCallback (watcherIds) {
    for (const id of watcherIds) {
      this.scheduledJobs.add(id)
    }
  }

  flushScheduledJobs () {
    for (const jobId of this.scheduledJobs) {
      this.callbackMap.get(jobId)()
    }
    this.scheduledJobs.clear()
  }
}
