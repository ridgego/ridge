import React, { useState } from 'react'
import { IconCode } from '@douyinfe/semi-icons'
import { withField, Button, Popover } from '@douyinfe/semi-ui'
import { EditorView, basicSetup } from 'codemirror'
import { tooltips } from '@codemirror/view'
import { javascript } from '@codemirror/lang-javascript'
import { autocompletion } from '@codemirror/autocomplete'

// Our list of completions (can be static, since the editor
/// will do filtering based on context).
const completions = [
  { label: 'panic', type: 'keyword' },
  { label: 'park', type: 'constant', info: 'Test completion' },
  { label: 'password', type: 'variable' }
]

const CodeExprEdit = withField(({
  value,
  options,
  onChange
}) => {
  const ref = React.createRef()
  const popref = React.createRef()
  const [open, setOpen] = useState(false)

  const variableCompletions = options.pageVariables.map(v => {
    return {
      label: v.name,
      type: 'variable'
    }
  })
  variableCompletions.push({
    label: '$scope',
    type: 'variable'
  })
  variableCompletions.push({
    label: 'Math.floor',
    type: 'method'
  })
  const myCompletions = (context) => {
    const before = context.matchBefore(/[\w.\\$]+/)
    // If completion wasn't explicitly started and there
    // is no word before the cursor, don't open completions.
    if (!context.explicit && !before) return null
    return {
      from: before ? before.from : context.pos,
      options: variableCompletions,
      validFor: /^\w*$/
    }
  }

  const popVisibleChange = visible => {
    setOpen(visible)
    console.log('tooltips', EditorView.tooltips)
    if (visible) {
      ref.current.editorView = new EditorView({
        doc: value,
        extensions: [basicSetup, javascript(), tooltips({
          position: 'absolute'
        }), autocompletion({ override: [myCompletions] })],
        parent: ref.current
      })
    } else if (ref.current.editorView) {
      onChange(ref.current.editorView.state.doc.toString())
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
      {value && <Button placeholder='绑定表达式' type='primary' size='small' theme='borderless' icon={<IconCode />} />}
      {!value && <Button className={open ? 'is-open' : ''} type='tertiary' size='small' theme='borderless' icon={<IconCode />} />}
    </Popover>
  )
})

export default CodeExprEdit
