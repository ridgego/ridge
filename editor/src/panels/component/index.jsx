import React from 'react'
import MoveablePanel from '../movable/MoveablePanel.jsx'
import ComponentListing from './ComponentListing.jsx'

import './index.less'

class LeftTopPanel extends React.Component {
  render () {
    return (
      <MoveablePanel {...this.props} className='component-panel'>
        <ComponentListing />
      </MoveablePanel>
    )
  }
}

export default LeftTopPanel
