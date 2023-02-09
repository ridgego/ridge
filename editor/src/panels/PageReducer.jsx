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
  const [reducerIndex, setReducerIndex] = useState(-1)
  const [reducers, setReducers] = useState([])

  useEffect(() => {
    setReducers(ridge.pageElementManagers.pageConfig.reducers)
  })

  // 创建、更新状态
  const finishEdit = () => {
    const name = formRef.current.formApi.getValues().name
    if (reducers.filter((reducer, index) => index !== reducerIndex && reducer.name === name).length) {
      // 命名重复
      return
    }
    const newReducer = {
      name: formRef.current.formApi.getValues().name,
      value: ref.current.editorView.state.doc.toString()
    }
    let newReducers = null
    if (reducerIndex === -1) {
      newReducers = [...reducers, newReducer]
    } else {
      newReducers = reducers.map((reducer, index) => {
        if (index === reducerIndex) {
          return newReducer
        } else {
          return reducer
        }
      })
    }
    setReducers(newReducers)
    emit(EVENT_PAGE_CONFIG_CHANGE, {
      reducers: newReducers
    })
  }

  // 移除Reducer
  const removeReducer = (record) => {
    const newReducers = reducers.filter(a => a.name !== record.name)
    setReducers(newReducers)
    emit(EVENT_PAGE_CONFIG_CHANGE, {
      reducers: newReducers
    })
  }

  // 新增或者编辑状态
  const editReducer = (record, index) => {
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
      setReducerIndex(index)
      formRef.current.formApi.setValue('name', record.name)
    } else {
      setReducerIndex(-1)
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
        theme='solid' type='primary' size='small' onClick={() => editReducer()}
      >新增
      </Button>
      <Table size='small' dataSource={reducers} pagination={false}>
        <Column title='名称' dataIndex='name' key='name' />
        <Column
          title='内容' dataIndex='value' width={100} key='value' render={(text, record, index) => {
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
                <Button size='small' theme='borderless' icon={<IconEdit />} onClick={() => editReducer(record, index)} />
                <Button size='small' theme='borderless' type='danger' icon={<IconDelete />} onClick={() => removeReducer(record)} />
              </>
            )
          }}
        />
      </Table>
    </>
  )
}
