import React, { useEffect } from 'react'
import PageState from './PageState.jsx'
import { Button, Collapse, Table, Modal } from '@douyinfe/semi-ui'
import { IconDelete, IconUndo } from '@douyinfe/semi-icons'
import { ridge } from '../service/RidgeEditService'
import { EditorView, basicSetup } from 'codemirror'
import { tooltips } from '@codemirror/view'
import { javascript } from '@codemirror/lang-javascript'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import { autocompletion } from '@codemirror/autocomplete'

const { Column } = Table
export default () => {
  const removeVariable = name => {

  }
  return (
    <>
      <Collapse>
        <Collapse.Panel header='状态值' itemKey='state'>
          <PageState />
        </Collapse.Panel>
        <Collapse.Panel header='函数' itemKey='reducer'>
          <p>Hi, bytedance dance dance. This is the docsite of Semi UI. </p>
        </Collapse.Panel>
      </Collapse>
    </>
  )
}
