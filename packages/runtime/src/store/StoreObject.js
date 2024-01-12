import debug from 'debug'

import { proxy, subscribe, snapshot } from 'valtio/vanilla'
const log = debug('ridge:store')
const error = debug('ridge:store-error')

export default class ValtioStoreObject {
  constructor (module, composite) {
    this.module = module
    this.composite = composite

    this.watchers = {}
    this.states = {}

    this.scheduledJobs = new Set()
  }

  initStore (properties) {
    if (!this.module) return
    // 从属性初始化组件state
    if (typeof this.module.state === 'function') {
      try {
        this.states = proxy(this.module.state(properties))
      } catch (e) {
        console.error('initializeModule Error', e)
      }
    } else if (typeof this.module.state === 'object') {
      this.states = proxy(this.module.state.state)
    }

    // 判断 初始化过后部重复监听
    if (this.states) {
      // 初始化监听state变化
      subscribe(this.states, mutations => {
        this.onMutations(mutations)
      })
    }
    this.flushScheduledJobs()
  }

  updateProps (properties) {
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
    const stateKeys = Object.keys(this.states)
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
    const stateValues = snapshot(this.states)
    let result = null
    if (type === 'state' && this.states[name]) {
      result = stateValues[name]
    } else if (type === 'scoped') {
      try {
        // 执行表达式
        const scoped = this.module.scoped[name]
        if (scoped) {
          if (typeof scoped === 'function') {
            result = scoped.apply(stateValues, [stateValues, ...payload])
          } else if (typeof scoped.get === 'function') {
            result = scoped.get.apply(stateValues, [stateValues, ...payload])
          }
        }
      } catch (e) {
        error('getStoreValue Error', e)
      }
    } else if (type === 'computed') {
      // 执行表达式
      const computed = this.module.computed[name]
      if (computed) {
        if (typeof computed === 'function') {
          result = computed.apply(stateValues, [stateValues])
        } else if (typeof computed.get === 'function') {
          result = computed.get.apply(stateValues, [stateValues])
        }
      }
    }
    // log('getStoreValue', expr, result)
    return result
  }

  dispatchChange (type, stateName, payload) {
    if (type === 'state') {
      this.states[stateName] = payload[0]
    } else if (type === 'scoped') {
      if (typeof this.module.scoped[stateName]?.set === 'function') {
        try {
          this.module.scoped[stateName]?.set(...payload, this)
        } catch (e) {
          error('dispatchChange Error', e)
        }
      }
    }
  }

  doStoreAction (actionName, event, scopedData) {
    if (this.module.actions && this.module.actions[actionName]) {
      try {
        const context = {
          states: this.states,
          scopes: scopedData
        }
        if (scopedData && scopedData.length >= 1) {
          context.scope = scopedData[0]
        }
        const exeResult = this.module.actions[actionName].call(null, event, context)
        if (typeof exeResult === 'object') {
          Object.assign(this.states, exeResult)
        }
      } catch (e) {
        console.error('doStoreAction Error', e)
      }
    }
  }

  onMutations (mutations) {
    log('mutations', mutations)
    const stateValue = snapshot(this.states)
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
      this.module.watch[state](newValue, {
        state: this.states,
        composite: this.composite
      })
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
}
