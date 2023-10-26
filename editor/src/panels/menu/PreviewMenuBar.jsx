import React from 'react'
import { Button, Divider, Badge, Space, InputNumber } from '@douyinfe/semi-ui'
import {  IconPause, IconSaveStroked, IconGridView1, IconPlay } from '@douyinfe/semi-icons'
import context from '../../service/RidgeEditorContext.js'
import './style.less'

class PreviewMenuBar extends React.Component {
  constructor () {
    super()
    context.services.previewBar = this
    this.state = {
      width: 0,
      height: 0
    }
  }

  setZoom (zoom) {
    this.setState({
      zoom
    })
  }

  zoomChange = zoom => {
    context.workspaceControl.setZoom(zoom)
    this.setZoom(zoom)
  }

  toggleContainerMask = () => {

  }

  toggoleRunMode = () => {
    context.toggleMode()
    this.setState({
      isPreview: !this.state.isPreview
    })
  }

  savePage = () => {
    context.saveCurrentPage()
  }

  changeViewPort = (width, height) => {
    this.setState({
      width,
      height
    })
    // context.updatePreviewSize()
  }

  render () {
    const { toggoleRunMode, state, props, changeViewPort } = this
    const { width, height } = state
    const { visible } = props
    return (
      <div
        className='menu-bar'
        style={{
          display: visible ? '' : 'none'
        }}
      >
        <Space className='bar-content'>
          <InputNumber size='small' style={{ width: 50 }} value={width} onChange={val => {
            changeViewPort(val, height)
          }}/> X <InputNumber size='small' style={{ width: 50 }} value={height} />
          <Button
            type='primary'
            theme='solid'
            icon={<IconPause />} onClick={toggoleRunMode}
          >预览
          </Button>
        </Space>
      </div>
    )
  }
}

export default PreviewMenuBar
