
// 导入页面数据配置
export const importDataSetting = async (file) => {
  const text = await file.text()

  const startPos = text.indexOf('{')

  // 增加个模拟量才能eval出来（不知道为啥）
  const jsContent = `ridgeImported = ${text.substring(startPos)}`

  const jsTag = document.createElement('script')
  jsTag.textContent = jsContent
  document.head.append(jsTag)
  const evaluatedObject = window.ridgeImported

  const states = []
  // 导入状态，包括计算型
  for (const key in evaluatedObject.state) {
    const state = {}
    state.name = key
    if (evaluatedObject.config && evaluatedObject.config.state) {
      Object.assign(state, evaluatedObject.config.state[key])
    }
    if (typeof evaluatedObject.state[key] === 'function') {
      state.value = evaluatedObject.state[key].toString()
    } else {
      state.value = JSON.stringify(evaluatedObject.state[key])
    }
    states.push(state)
  }
  // 导入函数
  const reducers = []
  for (const key in evaluatedObject.reducers) {
    const reducer = {}
    reducer.name = key
    if (evaluatedObject.config && evaluatedObject.config.reducers) {
      Object.assign(reducer, evaluatedObject.config.reducers[key])
    }
    reducer.value = evaluatedObject.reducers[key].toString()
    reducers.push(reducer)
  }

  return {
    states,
    reducers
  }
}
