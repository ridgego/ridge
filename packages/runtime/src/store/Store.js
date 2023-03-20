export default class Store {
  constructor ({ states, reducers }) {
    // 局部状态
    this.scopedStates = states.filter(state => state.scoped).map(state => state.name)

    const evaluatedObject = this.evaluatePageStore(states, reducers)
    this.reducers = evaluatedObject.reducers
    this.state = evaluatedObject.state

    // 公共的计算状态
    this.computedStates = states.filter(state => {
      return !state.scoped && typeof this.state[state.name] === 'function'
    }).map(state => state.name)

    this.stateValue = {}
    for (const key in this.state) {
      if (typeof this.state[key] !== 'function') {
        this.stateValue[key] = this.state[key]
      }
    }

    // 订阅者
    this.subscribes = []
  }

  evaluatePageStore (states, reducers) {
    const stateList = []
    for (const state of states) {
      // 做空值判断
      const value = state.value === '' ? '""' : state.value
      stateList.push(`${state.name}: ${value}`)
    }

    const reducerList = []
    for (const reducer of reducers) {
      reducerList.push(`${reducer.name}: ${reducer.value}`)
    }

    const jsContent = `window.ridgePageStore = {
      state: {
        ${stateList.join(',\n')}
      },
      reducers: { 
        ${reducerList.join(',\n')}
      }
    }`

    const jsTag = document.createElement('script')
    jsTag.textContent = jsContent
    document.head.append(jsTag)

    // const evaluatedObject = eval(jsContent)
    // ridgePageStore = evaluatedObject
    // console.log('evaluated', ridgePageStore, evaluatedObject)
    return window.ridgePageStore
  }

  getState () {
    return this.stateValue
  }

  /**
   * 获取状态值（包括计算型）
   * @param {*} stateName
   * @param {*} ctx
   * @returns
   */
  getStateValue (stateName, ctx) {
    const state = this.state[stateName]
    if (typeof state === 'function') {
      try {
        return state(ctx)
      } catch (e) {
        console.error('计算属性值出错', e, state, ctx)
      }
    } else if (state != null) {
      return this.stateValue[stateName]
    }
  }

  unsubscribe (unid) {
    this.subscribes = this.subscribes.filter(({ id }) => id !== unid)
  }

  // 订阅组件的属性回调变动
  subscribe (id, callback, states) {
    if (states.length === 0) return

    const connected = []
    for (const stateName of states) {
      // 公用计算状态每次都更新
      if (this.computedStates.indexOf(stateName) > -1) {
        this.subscribes.push({
          id,
          callback
        })
        return
      }
      if (Object.prototype.hasOwnProperty.call(this.stateValue, stateName)) {
        connected.push(stateName)
      }
    }
    if (connected.length) {
      this.subscribes.push({
        id,
        callback,
        connected
      })
    }
  }

  /**
   * 执行reducer函数
   * @param {string} name 函数名称
   * @param {object} state 上下文状态
   * @param {object} payload 事件负载
   */
  async doReducer (name, state, payload) {
    if (this.reducers[name]) {
      try {
        const result = await Promise.resolve(this.reducers[name]({ ...state, payload }, this.reducers))
        this.setState(result)
      } catch (e) {
        console.error('Reducer Execute Error', e)
      }
    }
  }

  /**
   * 更新状态值，同时通知所有订阅者值改变
   * @param {*} stateValue
   */
  setState (stateValue) {
    this.stateValue = Object.assign({}, this.stateValue, stateValue)

    this.subscribes.filter(sub => {
      // 有状态按状态判断
      if (sub.states) {
        if (new Set([...sub.states, ...Object.keys(stateValue)]).size < sub.states.length + Object.keys(stateValue).length) {
          return true
        } else {
          return false
        }
      } else {
        // 没有则执行更新
        return true
      }
    }).forEach(sub => {
      sub.callback && sub.callback(this.stateValue)
    })
  }
}
