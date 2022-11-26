import React from 'react'
import ReactDOM from 'react-dom'
import { Button, Typography } from '@douyinfe/semi-ui'
import { IconMinus, IconClose, IconExpand, IconHandle } from '@douyinfe/semi-icons'

import Moveable, { } from 'moveable'

export default class MoveablePanel extends React.Component {
  constructor () {
    super()
    this.ref = React.createRef()
    this.state = {
      state: 'normal'
    }
  }

  componentDidMount () {
    this.enablePanelMoveResize()
  }

  enablePanelMoveResize () {
    const mov = new Moveable(document.body, {
      className: 'workspace-movable',
      target: this.ref.current,
      dimensionViewable: true,
      deleteButtonViewable: false,
      dragTarget: this.ref.current.querySelector('.panel-title'),
      // If the container is null, the position is fixed. (default: parentElement(document.body))
      container: document.body,
      snappable: false,
      snapGap: false,
      isDisplayInnerSnapDigit: false,
      draggable: true,
      resizable: true,
      scalable: false,
      rotatable: false,
      warpable: false,
      // Enabling pinchable lets you use events that
      // can be used in draggable, resizable, scalable, and rotateable.
      pinchable: false, // ["resizable", "scalable", "rotatable"]
      origin: false,
      keepRatio: false,
      // Resize, Scale Events at edges.
      edge: true,
      throttleDrag: 0,
      throttleResize: 1,
      throttleScale: 0,
      throttleRotate: 0,
      clipTargetBounds: true
    })

    mov.on('resize', ({
      target,
      width,
      height,
      delta,
      transform
    }) => {
      target.style.transform = transform
      delta[0] && (target.style.width = `${width}px`)
      delta[1] && (target.style.height = `${height}px`)
    })

    mov.on('drag', ev => {
      ev.target.style.transform = ev.transform
    })
  }

  render () {
    const { onClose, visible } = this.props
    const { state } = this.state
    const { Title } = Typography
    const style = {
      position: 'absolute',
      background: 'var(--semi-color-bg-0)',
      border: '1px solid var(--semi-color-border)',
      padding: '4px',
      borderRadius: '5px'
    }
    Object.assign(style, this.props)

    if (state === 'minimize') {
      style.height = '36px'
    } else {
      style.height = this.props.height
    }

    if (!visible) {
      style.display = 'none'
    }
    return (
      ReactDOM.createPortal(
        <div ref={this.ref} className='movable-panel' style={style} id={this.props.id}>
          <div
            className='panel-title' style={{
              height: '26px',
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
              marginBottom: '4px',
              alignItems: 'center'
            }}
          >
            <IconHandle />
            <Title heading={6} style={{ marginLeft: '4px', fontSize: '14px' }}>{this.props.title || '面板'}</Title>
          </div>
          <div
            className='panel-btns' style={{
              position: 'absolute',
              right: '10px',
              zIndex: 10,
              top: '5px'
            }}
          >
            {state === 'normal' &&
              <Button
                icon={<IconMinus />} onClick={() => {
                  this.setState({
                    state: 'minimize'
                  })
                }} theme='borderless' size='small' type='tertiary'
              />}
            {state === 'minimize' &&
              <Button
                icon={<IconExpand />} onClick={() => {
                  this.setState({
                    state: 'normal'
                  })
                }} theme='borderless' size='small' type='tertiary'
              />}
            <Button icon={<IconClose />} theme='borderless' size='small' type='tertiary' onClick={onClose} />
          </div>
          <div
            className='panel-content' style={{
              height: 'calc(100% - 26px)',
              overflow: 'overlay'
            }}
          >
            {this.props.children}
          </div>
        </div>, document.body)
    )
  }
}
