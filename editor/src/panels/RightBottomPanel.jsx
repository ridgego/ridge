import React from 'react'
import MoveablePanel from './MoveablePanel.jsx'
import PageVariableEdit from './PageVariableEdit.jsx'
import OutLineTree from './OutLineTree.jsx'
import { Tabs, TabPane } from '@douyinfe/semi-ui'

import '../css/data-panel.less'

export default class DataPanel extends React.Component {
  constructor () {
    super()
    this.state = {
      show: true
    }
  }

  render () {
    return (
      <MoveablePanel right='10px' bottom='10px' width='300px' height='240px' {...this.props}>
        <Tabs
          type='card'
          size='small'
        >
          <TabPane
            tab='页面变量'
            itemKey='page-var'
          >
            <PageVariableEdit />
          </TabPane>
          <TabPane
            tab='大纲视图'
            itemKey='outlint'
          >
            <OutLineTree />
          </TabPane>
        </Tabs>
      </MoveablePanel>
    )
  }
}
