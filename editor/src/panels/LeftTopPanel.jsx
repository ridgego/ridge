import React from 'react'
import MoveablePanel from './MoveablePanel.jsx'
import InstalledComponents from './InstalledComponents.jsx'

class LeftTopPanel extends React.Component {
  render () {
    return (
      <MoveablePanel {...this.props}>
        <InstalledComponents />
      </MoveablePanel>
    )
  }
}

export default LeftTopPanel
