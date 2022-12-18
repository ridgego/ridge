import React, { useEffect, useState } from 'react'
import { IconCode } from '@douyinfe/semi-icons'
import { withField, Button, Popover } from '@douyinfe/semi-ui'
import { EditorView, basicSetup } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'

const CodeExprEdit = withField(props => {
  const ref = React.createRef()
  const [open, setOpen] = useState(false)
  const popVisibleChange = visible => {
    setOpen(visible)
    if (visible) {
      const editorView = new EditorView({
        doc: props.value,
        extensions: [basicSetup, javascript()],
        parent: ref.current
      })
    }
  }
  const exprChange = value => {
    props && props.onChange(value)
  }
  useEffect(() => {

  })
  return (
    <Popover
      position='leftTop'
      onVisibleChange={popVisibleChange}
      showArrow
      trigger='click'
      content={
        <article style={{ padding: 8, width: 360 }}>
          <span> 请输入表达式 </span>
          <textarea ref={ref} value={props.value} onChange={exprChange} />
        </article>
      }
    >
      {props.value && <Button type='primary' size='small' theme='borderless' icon={<IconCode />} />}
      {!props.value && <Button className={open ? 'is-open' : ''} type='tertiary' size='small' theme='borderless' icon={<IconCode />} />}
    </Popover>
  )
})

export default CodeExprEdit
