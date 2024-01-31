import debug from 'debug'

import { proxy, subscribe, snapshot } from 'valtio/vanilla'
import { set, get } from 'lodash'
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
      // setup could be async but NOT wait here
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
   * When config connected, subscribe for value change
   * @param {string} type state/computed
   * @param {string} path
   * @param {*} callback
   */
  subscribe (type, path, callback) {
    const name = path.join('.')
    switch (type) {
      case 'state':
        this.addWatchers(name, callback)
        break
      case 'computed':
        if (this.module.computed && this.module.computed[name]) {
          if (Array.isArray(this.module.computed[name].dependencies)) {
            for (const expr of this.module.computed[name].dependencies) {
              this.addWatchers(expr, callback)
            }
          }
        }
        break
      default:
        break
    }
  }

  addWatchers (path, callback) {
    if (this.watchers[path] == null) {
      this.watchers[path] = new Set()
    }
    this.watchers[path].add(callback)
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
      result = get(this.state, name)
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
    return result
  }

  dispatchChange (type, stateName, val, ...scoped) {
    if (type === 'state') {
      set(this.state, stateName.split('.'), val)
      // this.state[stateName] = val
    } else if (type === 'computed') {
      if (this.module.computed && typeof this.module.computed[stateName]?.set === 'function') {
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
      this.onStateChange(statePath.join('.'), get(stateValue, statePath))
    }
    this.flushScheduledJobs()
  }

  // state变更
  onStateChange (state, newValue) {
    if (this.module.watch && this.module.watch[state]) {
      this.module.watch[state].call(this.context, newValue)
    }

    const watchers = this.watchers[state]

    if (watchers) {
      this.scheduleCallback(watchers)
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
