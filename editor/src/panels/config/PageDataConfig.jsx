import React, { useState } from 'react'
import { Button, Upload, Toast, Modal, Form, Tree, Space, Typography } from '@douyinfe/semi-ui'
import { IconDownloadStroked, IconCloudUploadStroked, IconEdit, IconDelete, IconBrackets, IconCopyAdd } from '@douyinfe/semi-icons'
import { EVENT_PAGE_CONFIG_CHANGE, EVENT_PAGE_LOADED } from '../../constant'
import { exportDataSetting } from './export'
import { importDataSetting } from './import'
import { unionBy } from 'lodash'

import { emit, on } from '../../service/RidgeEditService'
import './data-panel.less'
import { initCodeEditor } from './codeEditor'
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

  const onImportClick = (file) => {
    Modal.confirm({
      title: '导入页面数据模型',
      content: '您要导入页面数据模型。导入后，页面原有同名的状态和函数将被替换',
      onOk: async () => {
        try {
          const imported = await importDataSetting(file)
          emitTreeChange(unionBy(imported.states, states, 'name'), unionBy(imported.reducers, reducers, 'name'))

          Toast.success('页面数据配置导入成功')
        } catch (e) {
          Toast.error('页面数据配置异常', e)
        }
      }
    })
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

    ref.current.editorView = initCodeEditor(ref.current, record ? record.value : '', states, reducers)

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

  // 创建或者更新状态
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

    const sameNames = (type === 'state' ? states : reducers).filter((state, index) => index !== recordIndex && state.name === name)
    if (sameNames.length) {
      formRef.current.formApi.setError('name', '标识与[' + sameNames[0].label + ']相同')
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

  /**
   * 确认状态或者函数的修改，发出事件
   * @param {*} newStates
   * @param {*} newReducers
   */
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
      <div
        className='node-label' onDoubleClick={() => {
          edit(data.type, data.record, data.index)
        }}
      >
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
        maskClosable={false}
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
        <Button
          size='small' theme='borderless' type='t' icon={<IconDownloadStroked />} onClick={() => {
            exportDataSetting(states, reducers)
          }}
        >导出
        </Button>
        <Upload
          accept='.js' showUploadList={false} uploadTrigger='custom' onFileChange={files => {
            onImportClick(files[0])
          }}
        >
          <Button size='small' theme='borderless' type='t' icon={<IconCloudUploadStroked />}>导入</Button>
        </Upload>
      </div>
    </div>
  )
}
