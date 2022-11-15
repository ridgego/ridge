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
    if (el.parentElement === this.$el.current) {
      el.setAttribute('snappable', 'false')
      el.style.position = ''
      el.style.transform = ''
      return true
    }
    const children = this.$el.current.children

    if (children.length) {
      const confirm = (window.Ridge && window.Ridge.confirm) || window.confirm
      if (!confirm('列表已经有列表项模板， 是否确认替换？ （替换后原有模板会被删除）')) {
        return false
      }
      this.$el.current.removeChild(children[0])
    }
    console.log('drop element', el)
    el.setAttribute('snappable', 'false')
    el.style.position = ''
    el.style.transform = ''
    this.$el.current.appendChild(el)
    return true
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
