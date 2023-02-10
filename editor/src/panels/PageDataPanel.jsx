import React from 'react'
import PageState from './PageState.jsx'
import PageReducer from './PageReducer.jsx'
import { Button, Collapse, Upload, Toast } from '@douyinfe/semi-ui'
import { IconDownloadStroked, IconCloudUploadStroked } from '@douyinfe/semi-icons'
import { EVENT_PAGE_CONFIG_CHANGE } from '../constant'

import { saveAs } from '../utils/blob.js'
import { emit, ridge } from '../service/RidgeEditService'

export default () => {
  const ref = React.createRef()

  // 导出页面数据配置
  const exportDataSetting = () => {
    const pageConfig = ridge.pageElementManagers.pageConfig

    const stateList = []
    for (const state of pageConfig.states) {
      stateList.push(`${state.name}: ${state.value}`)
    }

    const reducerList = []
    for (const reducer of pageConfig.reducers) {
      reducerList.push(`${reducer.name}: ${reducer.value}`)
    }

    const jsContent = `export default {
      state: {
        ${stateList.join(',\n')}
      },
      reducers: { 
        ${reducerList.join(',\n')}
      }
    }`
    saveAs(jsContent, 'page-store.js')
  }

  // 导入页面数据配置
  const importDataSetting = async (file) => {
    const text = await file.text()

    const startPos = text.indexOf('{')

    // 增加个模拟量才能eval出来（不知道为啥）
    let ridgeImported = null
    const toBeEvaluated = `ridgeImported = ${text.substring(startPos)}`
    ridgeImported = 6

    console.log(toBeEvaluated, ridgeImported)
    try {
      const evaluatedObject = eval(toBeEvaluated)

      const states = []
      // 导入状态，包括计算型
      for (const key in evaluatedObject.state) {
        if (typeof evaluatedObject.state[key] === 'function') {
          states.push({
            name: key,
            value: evaluatedObject.state[key].toString()
          })
        } else {
          states.push({
            name: key,
            value: JSON.stringify(evaluatedObject.state[key])
          })
        }
      }
      // 导入函数
      const reducers = []
      for (const key in evaluatedObject.reducers) {
        reducers.push({
          name: key,
          value: evaluatedObject.reducers[key].toString()
        })
      }
      emit(EVENT_PAGE_CONFIG_CHANGE, {
        states,
        reducers
      })

      Toast.success('页面数据配置导入成功')
    } catch (e) {
      Toast.error('页面数据配置异常', e)
      console.log(e)
    }
  }
  return (
    <>
      <Collapse>
        <Collapse.Panel header='状态值' itemKey='state'>
          <PageState />
        </Collapse.Panel>
        <Collapse.Panel header='函数' itemKey='reducer'>
          <PageReducer />
        </Collapse.Panel>
      </Collapse>
      <div ref={ref} />
      <div style={{ display: 'flex', marginTop: '5px' }}>
        <Button size='small' theme='borderless' type='t' icon={<IconDownloadStroked />} onClick={exportDataSetting}>导出</Button>
        <Upload
          accept='.js' showUploadList={false} uploadTrigger='custom' onFileChange={files => {
            importDataSetting(files[0])
          }}
        >
          <Button size='small' theme='borderless' type='t' icon={<IconCloudUploadStroked />}>导入</Button>
        </Upload>
      </div>
    </>
  )
}
