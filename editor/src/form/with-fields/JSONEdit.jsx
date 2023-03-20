import React, { useState } from 'react'
import { JSONTree } from 'react-json-tree'
import { EditorView, basicSetup } from 'codemirror'
import { tooltips } from '@codemirror/view'
import { withField, Button, Modal } from '@douyinfe/semi-ui'
import { json, jsonParseLinter } from '@codemirror/lang-json'

const JSONEdit = withField(({
  value,
  options,
  onChange
}) => {
  const [visible, setVisible] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const ref = React.createRef()

  const ok = () => {
    try {
      const result = ref.current.editorView.state.doc.toString()
      if (result !== '') {
        const target = JSON.parse(result)
        onChange(target)
      } else {
        onChange('')
      }
      setVisible(false)
      setErrorMsg('')
    } catch (e) {
      setErrorMsg(e.message)
    }
  }
  const edit = () => {
    setVisible(true)

    // 初始化编辑器
    if (ref.current.editorView) {
      ref.current.editorView.destroy()
    }
    ref.current.editorView = new EditorView({
      doc: value != null ? JSON.stringify(value, null, 2) : '',
      extensions: [basicSetup, json(), tooltips({
        position: 'absolute'
      })],
      parent: ref.current
    })
    ref.current.editorView.jsonParseLinter = jsonParseLinter
  }

  const renderTree = () => {
    if (value == null) {
      return '--'
    } else {
      return (
        <JSONTree
          theme={{
            base00: '#fff',
            tree: {
              fontSize: '14px',
              marginTop: 0,
              marginBottom: 0
            }
          }}
          shouldExpandNodeInitially={() => false}
          data={value || null}
        />
      )
    }
  }

  return (
    <div style={{
      position: 'relative'
    }}
    >
      {renderTree()}
      <Modal
        closeOnEsc={false}
        lazyRender={false}
        onCancel={() => {
          setVisible(false)
          setErrorMsg('')
        }}
        keepDOM
        title='编辑JSON数据'
        visible={visible}
        onOk={ok}
      >

        <div>默认值/代码</div>
        <div
          style={{
            border: '1px solid var(--semi-color-border)',
            overflow: 'auto',
            height: '300px',
            width: '100%'
          }} className='code-editor-container' ref={ref}
        />
        <div style={{
          color: 'red'
        }}
        >{errorMsg}
        </div>
      </Modal>
      <Button
        style={{
          position: 'absolute',
          right: 0,
          top: 0
        }} size='small' type='tertiary' onClick={edit}
      >编辑
      </Button>
    </div>
  )
})

export default JSONEdit
