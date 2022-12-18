import React, { useState } from 'react'
import { IconCode } from '@douyinfe/semi-icons'
import { withField, Button, Popover } from '@douyinfe/semi-ui'
import { EditorView, basicSetup } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'

const CodeExprEdit = withField(props => {
  const ref = React.createRef()
  const popref = React.createRef()
  const [open, setOpen] = useState(false)
  const popVisibleChange = visible => {
    setOpen(visible)
    if (visible) {
      ref.current.editorView = new EditorView({
        doc: props.value,
        extensions: [basicSetup, javascript()],
        parent: ref.current
      })
    } else if (ref.current.editorView) {
      props.onChange(ref.current.editorView.state.doc.toString())
    }
  }

  return (
    <Popover
      // position='leftTop'
      onVisibleChange={popVisibleChange}
      showArrow
      ref={popref}
      trigger='click'
      content={
        <article style={{ padding: 8, width: 360 }}>
          <span> 请输入表达式 </span>
          <div className='pop-code-editor-container' ref={ref} />
          {/* <textarea style={{ width: '400px', height: '240px' }} value={props.value} onChange={exprChange} /> */}
        </article>
      }
    >
      {props.value && <Button type='primary' size='small' theme='borderless' icon={<IconCode />} />}
      {!props.value && <Button className={open ? 'is-open' : ''} type='tertiary' size='small' theme='borderless' icon={<IconCode />} />}
    </Popover>
  )
})

export default CodeExprEdit
