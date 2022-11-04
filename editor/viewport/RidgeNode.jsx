import React from 'react'

/**
 * Element Wrapper in Ridge Editor
 */
export default class RidgeNode extends React.Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
  }

  updateProps (props) {
    Object.assign(props, {
      __editor_selected: this.props.selected
    })
    this.view.updateProps(props)
  }

  componentDidMount () {
    const { fcViewManager } = window
    const {
      props
    } = this
    this.view = fcViewManager.createElementView(props.component, this.ref.current, props.props)

    this.view.then(fufilled => {
      fcViewManager.componentViews[props.id] = fufilled
      this.view = fufilled
      this.ref.current.ridgeViewObject = this.view
      this.ref.current.ridgeNode = this

      if (this.view.editorFeatures.droppable) {
        this.ref.current.setAttribute('ridge-droppable', true)
      }
    })
  }

  setDroppable () {
    this.ref.current.style.border = '2px solid red'
  }

  unsetDroppable () {
    this.ref.current.style.border = ''
  }

  componentDidUpdate () {
    this.view.updateProps && this.view.updateProps({
      __editor_selected: this.props.selected
    })
  }

  render () {
    const { style, id, selected, zindex } = this.props
    return (
      <div
        className='ridge-node'
        data-selected={selected}
        id={'ridge-node-' + id}
        ridge-componet-id={id}
        style={Object.assign({
          zIndex: zindex
        }, style)}
        ref={this.ref}
      />
    )
  }
}
