export default class Store {
  constructor ({ states, reducers }) {
    const stateList = []
    const initStateValues = {}
    for (const state of states) {
      stateList.push(`${state.name}: ${state.value}`)

      if (typeof state.value === 'function') {
        initStateValues[state.name] = state.value(initStateValues)
      } else {
        initStateValues[state.name] = state.value
      }
    }

    const reducerList = []
    for (const reducer of reducers) {
      reducerList.push(`${reducer.name}: ${reducer.value}`)
    }

    let ridgePageStore = null
    const jsContent = `ridgePageStore = {
      state: {
        ${stateList.join(',\n')}
      },
      reducers: { 
        ${reducerList.join(',\n')}
      }
    }`
    const evaluatedObject = eval(jsContent)
    ridgePageStore = evaluatedObject
    console.log('evaluated', ridgePageStore, evaluatedObject)

    evaluatedObject.stateValue = initStateValues

    this.ctx = evaluatedObject
  }
}
