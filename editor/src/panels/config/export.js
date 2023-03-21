import { saveAs } from '../../utils/blob.js'
// 导出页面数据配置
export const exportDataSetting = (states, reducers) => {
  const stateList = []
  const stateLabels = {}
  for (const state of states) {
    stateList.push(`${state.name}: ${state.value}`)
    stateLabels[state.name] = {
      scoped: state.scoped,
      label: state.label
    }
  }

  const reducerList = []
  const reducerLabels = {}
  for (const reducer of reducers) {
    reducerList.push(`${reducer.name}: ${reducer.value}`)
    reducerLabels[reducer.name] = {
      label: reducer.label
    }
  }

  const jsContent =
`export default {
  state: {
    ${stateList.join(',\n')}
  },
  reducers: { 
    ${reducerList.join(',\n')}
  },
  config: {
    state: ${JSON.stringify(stateLabels, null, 2)},
    reducers: ${JSON.stringify(reducerLabels, null, 2)}
  }
}`
  saveAs(jsContent, 'page-store.js')
}
