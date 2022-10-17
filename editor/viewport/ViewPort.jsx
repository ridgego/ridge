import React from 'react'
import RidgeNode from './RidgeNode.jsx'
import './viewport.css'

export default class Viewport extends React.Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
  }

  getBoundingClientRect () {
    return this.ref.current.getBoundingClientRect()
  }

  render () {
    const style = this.props.style
    const { nodes } = this.props

    return (
      <div ref={this.ref} className='viewport-container' onBlur={this.props.onBlur} style={style}>
        {this.props.children}
        <div className='viewport' ref={this.viewportRef}>
          {nodes && nodes.map(node => {
            return <RidgeNode key={node.id} {...node} />
          })}
        </div>
      </div>
    )
  }
}
