import React from 'react'
import { Tabs, TabPane } from '@douyinfe/semi-ui'
import MoveablePanel from './MoveablePanel.jsx'
import OutLineTree from './OutLineTree.jsx'

class OutLinePanel extends React.Component {
  render () {
    return (
      <MoveablePanel {...this.props}>
        <Tabs
          type='card'
        >
          <TabPane tab='页面列表' itemKey='resource' />
          <TabPane tab='元素导航' itemKey='outline'>
            <OutLineTree />
          </TabPane>
        </Tabs>
      </MoveablePanel>
    )
  }
}

export default OutLinePanel
