import React from 'react'
import ReactDOM from 'react-dom'
import { Button } from '@douyinfe/semi-ui'
import { createMoveable } from '../utils/moveable'
import { IconMinus, IconClose, IconSearchStroked, IconHandle } from '@douyinfe/semi-icons'

import '../css/movable-panel.less'

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
    const mov = createMoveable({
      className: 'workspace-movable',
      target: this.ref.current,
      dragTarget: this.ref.current.querySelector('.panel-title')
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
      Array.from(document.querySelectorAll('.movable-panel')).forEach(panelEl => {
        panelEl.style.zIndex = 1000
      })
      this.ref.current.style.zIndex = 1001
    })
  }

  render () {
    const { onClose, visible, title } = this.props
    const { state } = this.state
    const style = {
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
          <IconHandle />
          <Button icon={<IconSearchStroked />} theme='borderless' size='small' type='tertiary' onClick={onClose} />
          <Button icon={<IconClose />} theme='borderless' size='small' type='tertiary' onClick={onClose} />
          <div className='panel-content'>
            {this.props.children}
          </div>
        </div>, document.body)
    )
  }
}
