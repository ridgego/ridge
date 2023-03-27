import React from 'react'
import MoveablePanel from '../movable/MoveablePanel.jsx'
import InstalledComponents from './InstalledComponents.jsx'

import './index.less'

class LeftTopPanel extends React.Component {
  render () {
    return (
      <MoveablePanel {...this.props} className='component-panel'>
        <InstalledComponents />
      </MoveablePanel>
    )
  }
}

export default LeftTopPanel
