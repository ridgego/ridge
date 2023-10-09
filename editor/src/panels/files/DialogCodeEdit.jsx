import React, { useRef, useEffect } from 'react'
import { Modal } from '@douyinfe/semi-ui'
import { EditorView, basicSetup } from 'codemirror'
import { tooltips } from '@codemirror/view'
import { javascript } from '@codemirror/lang-javascript'

import { css } from '@codemirror/lang-css'

export default ({
  value,
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
      ref.current.editorView = new EditorView({
        doc: value,
        extensions: [basicSetup, langfunc, tooltips({
          position: 'absolute'
        })],
        parent: ref.current
      })
    }
    return () => {
      if (ref.current.editorView) {
        ref.current.editorView.destroy()
      }
    }
  }, [visible])

  return (
    <Modal
      closeOnEsc={false}
      maskClosable={false}
      title='代码编辑'
      zIndex='2001'
      width='80%'
      height='80%'
      bodyStyle={{
        height: 'calc(100% - 150px)'
      }}
      visible={visible}
      onOk={() => {
        const result = ref.current.editorView.state.doc.toString()
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
    </Modal>
  )
}
