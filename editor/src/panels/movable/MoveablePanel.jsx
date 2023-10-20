import React from 'react'
import ReactDOM from 'react-dom'
import { Button, Input, Typography } from '@douyinfe/semi-ui'
import { createMoveable } from '../../workspace/moveable'
import { IconClose, IconSearchStroked, IconHandle } from '@douyinfe/semi-icons'

import './movable-panel.less'

const { Text } = Typography

export const ThemeContext = React.createContext('light')

export default class MoveablePanel extends React.Component {
  constructor () {
    super()
    this.ref = React.createRef()
    this.state = {
      state: 'normal',
      errors: null,
      openSearch: false,
      search: null,
      hasError: false
    }
  }

  static getDerivedStateFromError (errors) {
    return {
      errors,
      hasError: true
    }
  }

  componentDidMount () {
    this.enablePanelMoveResize()
  }

  enablePanelMoveResize () {
    const mov = createMoveable({
      className: 'workspace-movable',
      target: this.ref.current,
      dragTarget: this.ref.current.querySelector('.title-bar .icon-handle')
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
        panelEl.style.zIndex = 300
      })
      this.ref.current.style.zIndex = 301
    })
  }

  render () {
    const { onClose, position, visible, title, padding = '0', className = 'default-panel' } = this.props
    const { state, openSearch, search } = this.state

    const style = {}

    const closeSearch = () => {
      this.setState({
        openSearch: false,
        search: null
      })
    }

    if (Array.isArray(position) && position.length === 6) {
      const [left, top, right, bottom, width, height] = position

      if (left) {
        style.left = left + 'px'
      }
      if (top) {
        style.top = top + 'px'
      }
      if (right) {
        style.right = right + 'px'
      }
      if (bottom) {
        style.bottom = bottom + 'px'
      }
      if (width) {
        style.width = width + 'px'
      }
      if (height) {
        style.height = height + 'px'
      }
    }

    const titleStyle = {}

    if (!visible) {
      style.display = 'none'
    }

    const panelClass = ['movable-panel', className]
    if (openSearch) {
      panelClass.push('open-search')
    }
    return (
      ReactDOM.createPortal(
        <div ref={this.ref} className={panelClass.join(' ')} style={style} id={this.props.id}>
          <div className='title-bar' style={titleStyle}>
            <IconHandle className='icon-handle' />
            {title && <Text className='title-text'>{title}</Text>}
            {openSearch && <Input
              placeholder='输入查询条件' prefix={<IconSearchStroked />} suffix={<IconClose onClick={closeSearch} />} className='toggle-search'
              value={search} onChange={val => {
                this.setState({
                  search: val
                })
              }}
                           />}
            <Button
              className='icon-search' icon={<IconSearchStroked />} theme='borderless' size='small' type='tertiary' onClick={() => {
                this.setState({
                  openSearch: true,
                  search: ''
                })
              }}
            />
          </div>
          <div
            className='panel-content'
            style={{
              // marginTop: title ? '28px' : '0',
              // borderTop: title ? '1px solid var(--semi-color-border)' : 'none'
            }}
          >
            {this.state.hasError
              ? <div>Something went wrong. {JSON.stringify(this.state)}</div>
              : <ThemeContext.Provider value={search}>{this.props.children}</ThemeContext.Provider>}
          </div>
        </div>
        , document.body)
    )
  }
}
