import React, { useRef, useEffect } from 'react'
import { Button, SideSheet } from '@douyinfe/semi-ui'
import { EditorView, basicSetup } from 'codemirror'
import { tooltips, keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'

import { css } from '@codemirror/lang-css'

export default ({
  value,
  title,
  type,
  visible,
  onChange,
  onClose
}) => {
  const ref = useRef(null)

  useEffect(() => {
    if (visible) {
      let langfunc = null
      if (type === 'text/css') {
        langfunc = css()
      }
      if (type === 'text/javascript') {
        langfunc = javascript()
      }
      if (type === 'text/json') {
        langfunc = json()
      }

      ref.current.editorComposite = new EditorView({
        doc: value,
        extensions: [basicSetup, keymap.of([indentWithTab]), langfunc, tooltips({
          position: 'absolute'
        })],
        parent: ref.current
      })
    }
    return () => {
      if (ref.current.editorComposite) {
        ref.current.editorComposite.destroy()
      }
    }
  }, [visible, value])

  const confirmCodeEdit = (close) => {
    const result = ref.current.editorComposite.state.doc.toString()
    onChange(result, close)
  }

  const confirmCodeEditClose = (close) => {
    confirmCodeEdit(close)
    onClose && onClose()
  }

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button style={{ marginRight: 8 }} onClick={onClose}>关闭</Button>
      <Button style={{ marginRight: 8 }} theme='solid' onClick={() => confirmCodeEdit(false)}>保存</Button>
      <Button theme='solid' onClick={() => confirmCodeEditClose(true)}>保存并关闭</Button>
    </div>
  )

  return (
    <SideSheet
      closeOnEsc={false}
      size='large'
      mask={false}
      maskClosable={false}
      title={title || '代码编辑'}
      visible={visible}
      footer={footer}
      bodyStyle={{
        zIndex: 1001,
        overflow: 'hidden'
      }}
      onOk={() => {
        const result = ref.current.editorComposite.state.doc.toString()
        onChange(result)
      }}
      onCancel={onClose}
    >
      <div
        style={{
          border: '1px solid var(--semi-color-border)',
          overflow: 'auto',
          height: '100%',
          width: '100%'
        }} className='code-editor-container' ref={ref}
      />

    </SideSheet>
  )
}
