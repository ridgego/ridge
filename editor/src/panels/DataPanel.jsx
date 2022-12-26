import React from 'react'
import MoveablePanel from './MoveablePanel.jsx'
import VariableList from './VariableList.jsx'
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
          <TabPane size='small' tab='页面变量' itemKey='var'>
            <VariableList variables={this.props.variables} variableChange={this.props.variableChange} />
          </TabPane>
          <TabPane tab='数据' itemKey='data' />
          <TabPane tab='资源' itemKey='asset' />
        </Tabs>
      </MoveablePanel>
    )
  }
}
