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

  getAfterNode (dropped, siblings, row) {

  }

  async updateProps (newProps) {
  }

  getContainerStyle (props) {
    const style = {
      width: '100%',
      height: '100%'
    }
    Object.assign(style, props)
    return style
  }

  dropElement (el, targetEl) {
    console.log('drop element', el)
    el.setAttribute('snappable', 'false')
    el.style.position = ''
    el.style.transform = ''
    this.$el.current.appendChild(el)
  }

  render () {
    const containerStyle = this.getContainerStyle(this.props)

    return (
      <div
        ref={this.$el}
        style={containerStyle}
        className='list-container'
      />
    )
  }
}
