export default class Store {
  constructor ({ states, reducers }) {
    const stateList = []
    const initStateValues = {}
    for (const state of states) {
      stateList.push(`${state.name}: ${state.value}`)
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
    const evaluatedObject = window.ridgePageStore
    for (const key in evaluatedObject.state) {
      if (typeof evaluatedObject.state[key] !== 'function') {
        initStateValues[key] = evaluatedObject.state[key]
      }
    }
    evaluatedObject.stateValue = initStateValues

    this.ctx = evaluatedObject
    // 订阅者
    this.subscribes = []
  }

  getState () {
    return this.ctx.stateValue
  }

  unsubscribe (unid) {
    this.subscribes = this.subscribes.filter(({ id }) => id !== unid)
  }

  subscribe (id, callback, states) {
    this.subscribes.push({
      id,
      callback,
      states
    })
  }

  setState (stateValue) {
    this.ctx.stateValue = Object.assign({}, this.ctx.stateValue, stateValue)
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
      sub.callback && sub.callback(this.ctx.stateValue)
    })
  }
}
