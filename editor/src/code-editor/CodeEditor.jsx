import React, { useEffect, useState } from 'react'
import { Modal, Banner } from '@douyinfe/semi-ui'
import '../css/code-editor.less'
import { EditorView, basicSetup } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { json, jsonParseLinter } from '@codemirror/lang-json'

let editorView = null
export default ({
  visible,
  value,
  lang,
  output,
  onCancel
}) => {
  const ref = React.createRef()
  const [error, setError] = useState('')

  const onOk = () => {
    if (editorView) {
      output(editorView.state.doc.toString())
    }
  }
  useEffect(() => {
    if (visible) {
      if (editorView) {
        editorView.destroy()
        editorView = null
      }
      if (lang === 'js') {
        editorView = new EditorView({
          doc: value,
          extensions: [basicSetup, javascript()],
          root: ref.current.parent,
          parent: ref.current
        })
      } else if (lang === 'json') {
        editorView = new EditorView({
          doc: value,
          extensions: [basicSetup, json()],
          parent: ref.current
        })
        editorView.jsonParseLinter = jsonParseLinter
      }
    }
  }, [visible])
  return (
    <Modal
      size='small'
      motion={false}
      style={{ width: '800px', height: '460px' }}
      title='代码编辑'
      lazyRender
      visible={visible}
      maskClosable={false}
      onCancel={onCancel}
      onOk={onOk}
    >
      <div ref={ref} className='editor-wrapper' />
      {
        error && <Banner
          className='code-error-banner'
          fullMode={false} type='danger' bordered icon={null} closeIcon={null}
          description={error}
                 />
      }
    </Modal>
  )
}
