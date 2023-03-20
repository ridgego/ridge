import React, { useState, useEffect } from 'react'
import { Button, Collapse, Upload, Toast, Dropdown, Modal, Form, Tree, Space, Typography, ButtonGroup } from '@douyinfe/semi-ui'
import { IconDownloadStroked, IconCloudUploadStroked, IconEdit, IconDelete, IconBrackets, IconCopyAdd } from '@douyinfe/semi-icons'
import { EVENT_PAGE_CONFIG_CHANGE, EVENT_PAGE_LOADED } from '../../constant'
import { EditorView, basicSetup } from 'codemirror'
import { tooltips } from '@codemirror/view'
import { javascript } from '@codemirror/lang-javascript'
import { autocompletion } from '@codemirror/autocomplete'

import { saveAs } from '../../utils/blob.js'
import { emit, on } from '../../service/RidgeEditService'
import './data-panel.less'
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
      disabled: true,
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
      disabled: true,
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
    const stateList = []
    const stateLabels = {}
    for (const state of states) {
      stateList.push(`${state.name}: ${state.value}`)
      stateLabels[state.name] = {
        label: state.label
      }
    }

    const reducerList = []
    const reducerLabels = {}
    for (const reducer of reducers) {
      reducerList.push(`${reducer.name}: ${reducer.value}`)
      reducerLabels[reducer.name] = reducer.label
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
    state: ${JSON.stringify(stateLabels)},
    reducers: ${JSON.stringify(reducerLabels)}
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

  const variableCompletions = (states || []).map(v => {
    return {
      label: v.name,
      type: 'variable'
    }
  })
  variableCompletions.push({
    label: '$scope',
    type: 'variable'
  })
  const methodCompletions = (reducers || []).map(v => {
    return {
      label: v.name,
      type: 'method'
    }
  })
  const myCompletions = (context) => {
    const before = context.matchBefore(/[\w.\\$]+/)
    // If completion wasn't explicitly started and there
    // is no word before the cursor, don't open completions.
    if (!context.explicit && !before) return null
    return {
      from: before ? before.from : context.pos,
      options: [...variableCompletions, ...methodCompletions],
      validFor: /^\w*$/
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
      }), autocompletion({ override: [myCompletions] })],
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

    if (name == null) {
      formRef.current.formApi.setError('name', '必须提供状态标识')
      return
    }

    if (!/^([a-zA-Z_$])([a-zA-Z0-9_$])*$/.test(name)) {
      formRef.current.formApi.setError('name', '标识命名以 a-zA-Z_$ 起始, 其他字符为a-zA-Z0-9_$')
      return
    }

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
      emitTreeChange(oldList)
    } else {
      emitTreeChange(null, oldList)
    }
    setVisible(false)
  }

  // 移除状态
  const remove = (type, record) => {
    if (type === 'state') {
      emitTreeChange(states.filter(a => a.name !== record.name))
    }
    if (type === 'reducer') {
      emitTreeChange(null, reducers.filter(a => a.name !== record.name))
    }
  }

  // 复制节点
  const duplicate = (type, record, index) => {
    const newName = record.name + 'Copy'

    const sameNames = (type === 'state' ? states : reducers).filter((state, index) => state.name === newName)

    if (sameNames.length) {
      return
    }

    const newRecord = {
      name: newName,
      label: record.label + '-复制',
      value: record.value
    }
    if (type === 'state') {
      const newStates = [...states]
      newRecord.scoped = record.scoped
      newStates.splice(index + 1, 0, newRecord)
      emitTreeChange(newStates)
    }
    if (type === 'reducer') {
      const newReducers = [...reducers]
      newRecord.scoped = record.scoped
      newReducers.splice(index, 0, newRecord)
      emitTreeChange(null, newReducers)
    }
  }

  const treeNodeDrop = ({ node, dragNode, dropPosition }) => {
    if (node.type !== dragNode.type) {
      return
    }

    let toPos = 0
    if (dropPosition > -1) {
      if (dragNode.index > node.index) {
        toPos = dropPosition + 1
      } else {
        toPos = dropPosition - 1
      }
    }

    if (dragNode.type === 'state') {
      const newStates = arrayMoveImmutable(states, dragNode.index, toPos)
      emitTreeChange(newStates)
    }
    if (dragNode.type === 'reducer') {
      const newReducers = [...reducers]
      newReducers.splice(dropPosition === -1 ? 0 : (dropPosition - 1), 0, dragNode)
      emitTreeChange(null, newReducers)
    }

    console.log(node, dragNode, dropPosition)
  }

  const arrayMoveMutable = (array, fromIndex, toIndex) => {
    const startIndex = fromIndex < 0 ? array.length + fromIndex : fromIndex

    if (startIndex >= 0 && startIndex < array.length) {
      const endIndex = toIndex < 0 ? array.length + toIndex : toIndex

      const [item] = array.splice(fromIndex, 1)
      array.splice(endIndex, 0, item)
    }
  }

  const arrayMoveImmutable = (array, fromIndex, toIndex) => {
    const newArray = [...array]
    arrayMoveMutable(newArray, fromIndex, toIndex)
    return newArray
  }

  const emitTreeChange = (newStates, newReducers) => {
    if (newStates) {
      setStates(newStates)
    }
    if (newReducers) {
      setReducers(newReducers)
    }
    emit(EVENT_PAGE_CONFIG_CHANGE, {
      states: newStates || states,
      reducers: newReducers || reducers
    })
    updateTree(newStates || states, newReducers || reducers)
  }

  const renderTreeLabel = (label, data) => {
    return (
      <div className='node-label'>
        <Space className='label-content'>
          <Text className='label-text'>{label || data.key}</Text>
          {data.record?.scoped && <IconBrackets style={{ color: 'var(--semi-color-success)' }} />}
        </Space>
        {!data.root &&
          <Space className='label-action'>
            <Button
              size='small' theme='borderless' type='tertiary' onClick={() => {
                duplicate(data.type, data.record, data.index)
              }} icon={<IconCopyAdd />}
            />
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
        closeOnEsc={false}
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
            <Form.Input field='name' label='标识' labelPosition='inset' />
            {type === 'state' ? <Form.Checkbox noLabel field='scoped'>用于局部</Form.Checkbox> : null}
          </Space>
          <Form.Input field='label' label='名称' labelPosition='inset' />
          <div>默认值/代码</div>
          <div
            style={{
              border: '1px solid var(--semi-color-border)',
              overflow: 'auto',
              height: '300px',
              width: '100%'
            }} className='code-editor-container' ref={ref}
          />
        </Form>
      </Modal>
      <Tree
        className='store-tree'
        draggable
        expandAll
        renderLabel={renderTreeLabel}
        onDrop={treeNodeDrop}
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
