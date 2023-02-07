import React, { useEffect, useState } from 'react'
import { emit, ridge } from '../service/RidgeEditService'
import { Button, Table, Modal, Form, Typography } from '@douyinfe/semi-ui'
import { EVENT_PAGE_CONFIG_CHANGE } from '../constant'
import { EditorView, basicSetup } from 'codemirror'
import { tooltips } from '@codemirror/view'
import { javascript } from '@codemirror/lang-javascript'
import { autocompletion } from '@codemirror/autocomplete'
import { IconEdit, IconDelete } from '@douyinfe/semi-icons'
const { Column } = Table
const { Text } = Typography
export default () => {
  const ref = React.createRef()
  const formRef = React.createRef()
  const [visible, setVisible] = useState(false)
  const [stateIndex, setStateIndex] = useState(-1)
  const [states, setStates] = useState([])
  const [reducers, setReducers] = useState([])

  useEffect(() => {
    setStates(ridge.pageElementManagers.pageConfig.states)
    setReducers(ridge.pageElementManagers.pageConfig.reducers)
  })

  // 创建、更新状态
  const finishEdit = () => {
    const name = formRef.current.formApi.getValues().name
    if (states.filter((state, index) => index !== stateIndex && state.name === name).length) {
      // 命名重复
      return
    }
    console.log(formRef.current.formApi.getValues())
    console.log(ref.current.editorView)

    const newState = {
      name: formRef.current.formApi.getValues().name,
      value: ref.current.editorView.state.doc.toString()
    }
    let newStates = null
    if (stateIndex === -1) {
      newStates = [...states, newState]
    } else {
      newStates = states.map((state, index) => {
        if (index === stateIndex) {
          return newState
        } else {
          return state
        }
      })
    }
    setStates(newStates)
    emit(EVENT_PAGE_CONFIG_CHANGE, {
      states: newStates
    })
  }

  // 移除状态
  const removeState = (record) => {
    const newStates = states.filter(a => a.name !== record.name)
    setStates(newStates)
    emit(EVENT_PAGE_CONFIG_CHANGE, {
      states: newStates
    })
  }

  // 新增或者编辑状态
  const editState = (record, index) => {
    setVisible(true)
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
      setStateIndex(index)
      formRef.current.formApi.setValue('name', record.name)
    } else {
      setStateIndex(-1)
      formRef.current.formApi.setValue('name', '')
    }
  }

  return (
    <>
      <Modal
        lazyRender={false}
        onCancel={() => {
          setVisible(false)
        }}
        onOk={finishEdit}
        keepDOM
        title='页面状态值编辑'
        visible={visible}
      >
        <Form labelPosition='left' ref={formRef}>
          <Form.Input field='name' label='名称' />
          <div
            style={{
              border: '1px solid var(--semi-color-border)',
              height: '300px',
              width: '100%'
            }} className='code-editor-container' ref={ref}
          />
        </Form>
      </Modal>

      <Button
        theme='solid' type='primary' size='small' onClick={() => editState()}
      >新增
      </Button>
      <Table size='small' dataSource={states} pagination={false}>
        <Column title='名称' dataIndex='name' key='name' />
        <Column
          title='默认值' dataIndex='value' width={100} key='value' render={(text, record, index) => {
            return (
              <Text ellipsis={{ showTooltip: true }} style={{ width: 100 }}>
                {text}
              </Text>
            )
          }}
        />
        <Column
          width={64}
          title='-' dataIndex='operate' key='operate'
          render={(text, record, index) => {
            return (
              <>
                <Button size='small' theme='borderless' icon={<IconEdit />} onClick={() => editState(record, index)} />
                <Button size='small' theme='borderless' type='danger' icon={<IconDelete />} onClick={() => removeState(record)} />
              </>
            )
          }}
        />
      </Table>
    </>
  )
}
