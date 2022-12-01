import React, { useEffect, useState } from 'react'
import { Modal, Banner } from '@douyinfe/semi-ui'
import '../css/code-editor.less'

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
      // const dias = editorView.linter(editorView)
      // if (dias.length) {
      //   setError('行' + dias[0].from + ',错误:' + dias[0].message)
      //   console.log(dias)
      //   return false
      // } else {
      //   setError('')
      // }
      output(editorView.state.doc.toString())
    }
  }
  useEffect(() => {
    if (visible) {
      if (editorView) {
        editorView.destroy()
        editorView = null
      }
      setTimeout(async () => {
        const CodeMirror = await import('codemirror')
        const { EditorView, basicSetup } = CodeMirror
        if (lang === 'js') {
          const { javascript } = await import('@codemirror/lang-javascript')
          editorView = new EditorView({
            doc: value,
            extensions: [basicSetup, javascript()],
            root: ref.current.parent,
            parent: ref.current
          })
        } else if (lang === 'json') {
          const { json, jsonParseLinter } = await import('@codemirror/lang-json')
          editorView = new EditorView({
            doc: value,
            extensions: [basicSetup, json()],
            parent: ref.current
          })
          editorView.jsonParseLinter = jsonParseLinter
        }
      }, 300)
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
