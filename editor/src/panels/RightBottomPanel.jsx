import React from 'react'
import MoveablePanel from './MoveablePanel.jsx'
import OutLineTree from './OutLineTree.jsx'

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
        <OutLineTree />
      </MoveablePanel>
    )
  }
}
