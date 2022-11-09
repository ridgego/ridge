/* eslint-disable no-unused-vars */
import React from 'react'

export default class RepeatContainer extends React.Component {
  constructor (props) {
    super()
    this.props = props
    this.$el = React.createRef()
  }

  componentDidMount () {

  }

  dropElement (el, targetEl) {

  }

  getAfterNode (dropped, siblings, row) {

  }

  async updateProps (newProps) {
  }

  render () {
    const containerStyle = this.getContainerStyle(this.props)

    return (
      <div
        ref={this.$el}
        style={containerStyle}
        className='repeat-container'
      />
    )
  }
}
