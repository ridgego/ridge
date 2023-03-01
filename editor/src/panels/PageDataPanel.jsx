import React, { useState, useEffect } from 'react'
import { Button, Collapse, Upload, Toast, Dropdown, Modal, Form, Tree, Space, Typography, ButtonGroup } from '@douyinfe/semi-ui'
import { IconDownloadStroked, IconCloudUploadStroked, IconPlus, IconEdit, IconDelete, IconBrackets } from '@douyinfe/semi-icons'
import { EVENT_PAGE_CONFIG_CHANGE, EVENT_PAGE_LOADED } from '../constant'
import { EditorView, basicSetup } from 'codemirror'
import { tooltips } from '@codemirror/view'
import { javascript } from '@codemirror/lang-javascript'
import { autocompletion } from '@codemirror/autocomplete'

import { saveAs } from '../utils/blob.js'
import { emit, on } from '../service/RidgeEditService'

const { Text } = Typography

export default () => {
  const ref = React.createRef()
  const formRef = React.createRef()
  const [visible, setVisible] = useState(false)
  const [states, setStates] = useState([])
  const [reducers, setReducers] = useState([])
  const [treeData, setTreeData] = useState([])
  const [type, setType] = useState('')
  const [recordIndex, setRecordIndex] = useState(-1)

  on(EVENT_PAGE_LOADED, ({ states, reducers }) => {
    setStates(states)
    setReducers(reducers)
    updateTree(states, reducers)
  })

  const updateTree = (states, reducers) => {
    const tree = [{
      label: '状态',
      key: 'state',
      root: true,
      children: states.map((state, index) => ({
        label: state.label,
        key: state.name,
        type: 'state',
        record: state,
        index
      }))
    }, {
      label: '函数',
      key: 'reducer',
      root: true,
      children: reducers.map((state, index) => ({
        label: state.label,
        key: state.name,
        value: state.name,
        type: 'reducer',
        record: state,
        index
      }))
    }]
    setTreeData(tree)
  }

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

  // 编辑条目
  const edit = (type, record, index) => {
    setType(type)
    setVisible(true)
    setRecordIndex(index == null ? -1 : index)

    formRef.current.formApi.reset()
    // 初始化编辑器
    if (ref.current.editorView) {
      ref.current.editorView.destroy()
    }

    ref.current.editorView = new EditorView({
      doc: record ? record.value : '',
      extensions: [basicSetup, javascript(), tooltips({
        position: 'absolute'
      }), autocompletion({ override: [] })],
      parent: ref.current
    })

    if (record) {
      formRef.current.formApi.setValue('name', record.name)
      formRef.current.formApi.setValue('label', record.label)
      if (type === 'state') {
        formRef.current.formApi.setValue('scoped', record.scoped)
      }
    } else {
      formRef.current.formApi.setValue('name', '')
      formRef.current.formApi.setValue('label', '')
    }
  }

  // 创建、更新状态
  const finishEdit = () => {
    const name = formRef.current.formApi.getValues().name
    const sanmeNames = (type === 'state' ? states : reducers).filter((state, index) => index !== recordIndex && state.name === name)
    if (sanmeNames.length) {
      formRef.current.formApi.setError('name', '标识与[' + sanmeNames[0].label + ']相同')
      return
    }

    const newRecord = {
      name: formRef.current.formApi.getValues().name,
      label: formRef.current.formApi.getValues().label,
      value: ref.current.editorView.state.doc.toString()
    }
    if (type === 'state') {
      newRecord.scoped = formRef.current.formApi.getValues().scoped
    }

    let oldList = type === 'state' ? states : reducers

    if (recordIndex === -1) {
      oldList = [...oldList, newRecord]
    } else {
      oldList = oldList.map((state, index) => {
        if (index === recordIndex) {
          return newRecord
        } else {
          return state
        }
      })
    }
    if (type === 'state') {
      setStates(oldList)
      emit(EVENT_PAGE_CONFIG_CHANGE, {
        states: oldList
      })
      updateTree(oldList, reducers)
    } else {
      setReducers(oldList)
      emit(EVENT_PAGE_CONFIG_CHANGE, {
        reducers: oldList
      })
      updateTree(states, oldList)
    }
    setVisible(false)
  }

  // 移除状态
  const remove = (type, record) => {
    if (type === 'state') {
      const newStates = states.filter(a => a.name !== record.name)
      setStates(newStates)
      emit(EVENT_PAGE_CONFIG_CHANGE, {
        states: newStates
      })
      updateTree(newStates, reducers)
    }
    if (type === 'reducer') {
      const newReducers = reducers.filter(a => a.name !== record.name)
      setReducers(newReducers)
      emit(EVENT_PAGE_CONFIG_CHANGE, {
        reducers: newReducers
      })
      updateTree(states, newReducers)
    }
  }

  const renderTreeLabel = (label, data) => {
    return (
      <div className='node-label'>
        <Space className='label-content'>
          <Text className='label-text'>{label}</Text>
          {data.record?.scoped && <IconBrackets style={{ color: 'var(--semi-color-success)' }} />}
        </Space>
        {!data.root &&
          <Space className='label-action'>
            <Button
              size='small' theme='borderless' type='tertiary' onClick={() => {
                edit(data.type, data.record, data.index)
              }} icon={<IconEdit />}
            />
            <Button
              size='small' theme='borderless' type='danger' onClick={() => {
                remove(data.type, data.record)
              }} icon={<IconDelete />}
            />
          </Space>}
        {data.root &&
          <Button
            size='small' onClick={() => {
              edit(data.key)
            }}
          >增加
          </Button>}
      </div>
    )
  }

  return (
    <div className='data-panel-content'>
      <Modal
        lazyRender={false}
        onCancel={() => {
          setVisible(false)
        }}
        keepDOM
        title='页面状态值编辑'
        visible={visible}
        onOk={finishEdit}
      >
        <Form labelPosition='left' ref={formRef}>
          <Space>
            <Form.Input field='label' label='名称' labelPosition='inset' />
            {type === 'state' ? <Form.Checkbox noLabel field='scoped'>用于局部</Form.Checkbox> : null}
          </Space>
          <Form.Input field='name' label='标识' labelPosition='inset' />
          <div>默认值/代码</div>
          <div
            style={{
              border: '1px solid var(--semi-color-border)',
              height: '300px',
              width: '100%'
            }} className='code-editor-container' ref={ref}
          />
        </Form>
      </Modal>
      <Tree
        className='store-tree'
        expandAll
        renderLabel={renderTreeLabel}
        treeData={treeData}
      />

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
    </div>
  )
}
