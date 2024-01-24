import debug from 'debug'

import { proxy, subscribe, snapshot } from 'valtio/vanilla'
const log = debug('ridge:store')
const error = debug('ridge:store-error')

export default class ValtioStoreObject {
  constructor (module) {
    this.module = module

    this.watchers = {}
    this.state = {}

    this.context = {}
    this.scheduledJobs = new Set()
  }

  getContext (scope = {}) {
    return Object.assign(this.context, {
      properties: this.properties,
      state: this.state,
      ...(this.module.actions ?? {}),
      ...scope
    })
  }

  initStore (properties) {
    this.properties = properties
    this.context.properties = properties
    if (!this.module) return
    // 从属性初始化组件state
    if (typeof this.module.state === 'function') {
      try {
        this.state = proxy(this.module.state(properties))
      } catch (e) {
        console.error('initializeModule Error', e)
      }
    } else if (typeof this.module.state === 'object') {
      this.state = proxy(this.module.state.state)
    }
    this.context.state = this.state
    Object.assign(this.context, this.module.actions ?? {})
    if (this.module.setup) {
      this.module.setup.call(this.context)
    }
    // 判断 初始化过后部重复监听
    if (this.state) {
      // 初始化监听state变化
      subscribe(this.state, mutations => {
        this.onMutations(mutations)
      })
    }
    this.flushScheduledJobs()
  }

  updateProps (properties) {
    this.properties = properties
    if (this.module.propsUpdate) {
      this.module.propsUpdate(properties)
    }
  }

  /**
   * 订阅值发生变化的后续处理
   * @param {string} type state/computed/scoped
   * @param {*} name  名称
   * @param {*} callback 回调方法
   */
  subscribe (type, name, callback) {
    const stateKeys = Object.keys(this.state)
    switch (type) {
      case 'state':
        this.watchers[name] = this.watchers[name] ?? new Set()
        this.watchers[name].add(callback)
        break
      case 'computed':
        try {
        // 读取函数定义， 获取 scoped 方法依赖的state
          const scopedFunctionText = this.module.computed?.[name]?.toString()

          for (const stateKey of stateKeys) {
            if (scopedFunctionText.indexOf(stateKey) > -1) {
              this.watchers[stateKey] = this.watchers[stateKey] ?? new Set()
              this.watchers[stateKey].add(callback)
            }
          }
        } catch (e) {
        // ignore
        }
        break
      case 'scoped':
        try {
        // 读取函数定义， 获取 scoped 方法依赖的state
          const scopedFunctionText = this.module.scoped?.[name]?.toString()

          for (const stateKey of stateKeys) {
            if (scopedFunctionText.indexOf(stateKey) > -1) {
              this.watchers[stateKey] = this.watchers[stateKey] ?? new Set()
              this.watchers[stateKey].add(callback)
            }
          }
        } catch (e) {
        // ignore
        }
        break
      default:
        break
    }
  }

  /**
   * 获取状态值
   * @param {*} type
   * @param {*} name
   * @param {*} payload
   * @returns
   */
  getValue (type, name, payload) {
    let result = null
    if (type === 'state') {
      result = this.state[name]
    } else if (type === 'computed') {
      // 执行表达式
      const computed = this.module.computed[name]
      if (computed) {
        if (typeof computed === 'function') {
          result = computed.apply(this.context, [this.state, ...payload])
        } else if (typeof computed.get === 'function') {
          result = computed.get.apply(this.context, [this.state, ...payload])
        }
      }
    }
    // else if (type === 'scoped') {
    //   try {
    //     // 执行表达式
    //     const scoped = this.module.scoped[name]
    //     if (scoped) {
    //       if (typeof scoped === 'function') {
    //         result = scoped.apply(this.context, [stateValues, ...payload])
    //       } else if (typeof scoped.get === 'function') {
    //         result = scoped.get.apply(this.context, [stateValues, ...payload])
    //       }
    //     }
    //   } catch (e) {
    //     error('getStoreValue Error', e)
    //   }
    // }
    // log('getStoreValue', expr, result)
    return result
  }

  dispatchChange (type, stateName, val, ...scoped) {
    if (type === 'state') {
      this.state[stateName] = val
    } else if (type === 'computed') {
      if (typeof this.module.computed[stateName]?.set === 'function') {
        try {
          this.module.computed[stateName]?.set.call(this, val, this.state, ...scoped)
        } catch (e) {
          error('dispatchChange Error', e)
        }
      }
    }
  }

  doStoreAction (actionName, event, ...scopedData) {
    if (this.module.actions && this.module.actions[actionName]) {
      try {
        const scope = {
          scopes: scopedData,
          event
        }
        if (scopedData && scopedData.length >= 1) {
          scope.scope = scopedData[0]
        }
        const exeResult = this.module.actions[actionName].call(this.context, scope)
        if (typeof exeResult === 'object') {
          Object.assign(this.state, exeResult)
        }
      } catch (e) {
        console.error('doStoreAction Error', e)
      }
    }
  }

  onMutations (mutations) {
    log('mutations', mutations)
    const stateValue = snapshot(this.state)
    for (const mutation of mutations) {
      const [action, statePath, newValue, oldValue] = mutation
      log('mutation', action, statePath.join('.'), newValue, oldValue)
      // 发出state单值改变事件
      this.onStateChange(statePath[0], stateValue[statePath[0]])
    }
    this.flushScheduledJobs()
  }

  // state变更
  onStateChange (state, newValue) {
    const watchers = this.watchers[state]

    if (watchers) {
      this.scheduleCallback(watchers)
    }

    if (this.module.watch && this.module.watch[state]) {
      this.module.watch[state].call(this.context, newValue)
    }
  }

  scheduleCallback (watchers) {
    for (const callback of watchers) {
      this.scheduledJobs.add(callback)
    }
  }

  flushScheduledJobs () {
    for (const job of this.scheduledJobs) {
      try {
        job()
      } catch (e) {
        console.error('job exec error', e)
      }
    }
    this.scheduledJobs.clear()
  }

  destory () {
    this.module.destory && this.module.destory(this.getContext())
  }
}
