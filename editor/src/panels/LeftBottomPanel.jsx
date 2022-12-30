import React from 'react'
import MoveablePanel from './MoveablePanel.jsx'
import AppFileList from './AppFileList.jsx'

class LeftBottomPanel extends React.Component {
  render () {
    return (
      <MoveablePanel {...this.props}>
        <AppFileList />
      </MoveablePanel>
    )
  }
}

export default LeftBottomPanel
