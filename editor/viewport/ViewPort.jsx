import React from 'react'
import RidgeNode from './RidgeNode.jsx'
import './viewport.css'

export default class Viewport extends React.Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
    this.viewportRef = React.createRef()
  }

  getViewPortRef () {
    return this.viewportRef.current
  }

  getBoundingClientRect () {
    return this.ref.current.getBoundingClientRect()
  }

  render () {
    const style = this.props.style
    const { nodes, selectedTargets } = this.props

    return (
      <div ref={this.ref} className='viewport-container' onBlur={this.props.onBlur} style={style}>
        {this.props.children}
        <div className='viewport' ref={this.viewportRef}>
          {nodes && nodes.map((node, index) => {
            return <RidgeNode zindex={index} selected={selectedTargets.indexOf('ridge-node-' + node.id) > -1} key={node.id} {...node} />
          })}
        </div>
      </div>
    )
  }
}
