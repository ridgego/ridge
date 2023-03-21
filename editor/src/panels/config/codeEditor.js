import { EditorView, basicSetup } from 'codemirror'
import { tooltips } from '@codemirror/view'
import { javascript } from '@codemirror/lang-javascript'
import { autocompletion } from '@codemirror/autocomplete'

export const initCodeEditor = (el, code, states, reducers) => {
  const variableCompletions = (states || []).map(v => {
    return {
      label: v.name,
      type: 'variable'
    }
  })
  variableCompletions.push({
    label: '$scope',
    type: 'variable'
  })
  const methodCompletions = (reducers || []).map(v => {
    return {
      label: v.name,
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

  return new EditorView({
    doc: code,
    extensions: [basicSetup, javascript(), tooltips({
      position: 'absolute'
    }), autocompletion({ override: [myCompletions] })],
    parent: el
  })
}
