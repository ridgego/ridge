import React from 'react'

export default class RidgeNode extends React.Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
  }

  updateProps (props) {
    this.view.updateProps(props)
  }

  componentDidMount () {
    const { fcViewManager } = window
    const {
      props
    } = this
    this.view = fcViewManager.createComponentView(props.component, this.ref.current, props.props)
    fcViewManager.componentViews[props.id] = this.view
    console.log('ReactFC props', props)
  }

  render () {
    const { style, id } = this.props
    return <div className='ridge-node' id={'ridge-node-' + id} style={style} ref={this.ref} ridge-componet-id={id} />
  }
}
