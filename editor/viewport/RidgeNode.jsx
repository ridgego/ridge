import React from 'react'
import { FCViewManager } from 'ridge-view-manager'

const fcViewManager = new FCViewManager({
  baseUrl: '/npm_packages'
})

export default class RidgeNode extends React.Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
  }

  componentDidMount () {
    const {
      props
    } = this
    fcViewManager.createComponentView(props.component, this.ref.current, props.props)
    console.log('ReactFC props', props)
  }

  render () {
    const { style, id } = this.props
    return <div className='ridge-node' id={'ridge-node-' + id} style={style} ref={this.ref} ridge-componet-id={id} />
  }
}
