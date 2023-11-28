import React, { useState } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { tooltips } from '@codemirror/view'
import { javascript, esLint } from '@codemirror/lang-javascript'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import { autocompletion } from '@codemirror/autocomplete'
import { Button, Popover, Typography } from '@douyinfe/semi-ui'

const { Text } = Typography

export default ({
  children,
  completion = {},
  msg,
  type = 'js',
  value,
  toggleOpen,
  onChange
}) => {
  const ref = React.createRef()
  const [visible, setVisible] = useState(false)
  const { methods, variables } = completion

  const variableCompletions = (variables || []).map(v => {
    return {
      label: v.name,
      type: 'variable'
    }
  })
  variableCompletions.push({
    label: '$scope',
    type: 'variable'
  })
  const methodCompletions = (methods || []).map(v => {
    return {
      label: v.label,
      type: 'method'
    }
  })
  const myCompletions = (context) => {
    const before = context.matchBefore(/[\w.\\$]+/)
    // If completion wasn't explicitly started and there
    // is no word before the cursor, don't open completions.
    if (!context.explicit && !before) return null
    return {
      from: before ? before.from : context.pos,
      options: [...variableCompletions, ...methodCompletions],
      validFor: /^\w*$/
    }
  }

  const popVisibleChange = visible => {
    toggleOpen && toggleOpen(visible)
    if (visible) {
      ref.current.editorComposite = new EditorView({
        doc: value,
        extensions: [basicSetup, (type === 'js') ? javascript() : json(), tooltips({
          position: 'absolute'
        }), autocompletion({ override: [myCompletions] })],
        parent: ref.current
      })
      if (type === 'json') {
        ref.current.editorComposite.jsonParseLinter = jsonParseLinter
      }
    } else if (ref.current.editorComposite) {
      onChange(ref.current.editorComposite.state.doc.toString())
    }
  }

  return (
    <Popover
      onVisibleChange={popVisibleChange}
      visible={visible}
      showArrow
      trigger='click'
      content={
        <article style={{ padding: 4, width: 430 }}>
          <Text type='secondary'>{msg}</Text>
          <div className='pop-code-editor-container' ref={ref} />
          {/* <textarea style={{ width: '400px', height: '240px' }} value={props.value} onChange={exprChange} />  onClick={() => openEditCode(variable.value, index)} */}
        </article>
      }
    >
      {children}
    </Popover>
  )
}
