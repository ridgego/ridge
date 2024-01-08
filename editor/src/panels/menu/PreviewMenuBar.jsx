import React from 'react'
import { Button, Divider, Badge, Space, InputNumber, Typography, Select } from '@douyinfe/semi-ui'
import { IconPause, IconSaveStroked, IconGridView1, IconPlay } from '@douyinfe/semi-icons'
import context from '../../service/RidgeEditorContext.js'
import './style.less'
const { Text } = Typography

const VIEW_PORTS = [{
  name: 'Apple iPhone 15 Pro Max',
  width: 430,
  height: 932
}, {
  name: 'Apple iPhone 15',
  width: 393,
  height: 852
}, {
  name: 'Apple iPad 10.2"',
  width: 810,
  height: 1080
}]

class PreviewMenuBar extends React.Component {
  constructor () {
    super()
    context.services.previewBar = this

    const viewPortList = VIEW_PORTS.map(vp => {
      return {
        value: vp.name,
        label: <Space>
          <Text>{vp.name}</Text>
          <Text type='tertiary'>{vp.width}-{vp.height}</Text>
               </Space>
      }
    })
    this.state = {
      vpName: 'default',
      viewPortList: [...viewPortList, {
        value: 'config',
        label: '设计宽高'
      }],
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

  changeViewPort = (width, height) => {
    this.setState({
      width,
      height
    })
    context.updatePreviewSize(width, height)
    // context.updatePreviewSize()
  }

  onSelectVpChange = (key) => {
    if (key === 'config') {
      this.changeViewPort(context.pageContent.style.width, context.pageContent.style.height)
      this.setState({
        vpName: key,
        width: context.pageContent.style.width,
        height: context.pageContent.style.height
      })
    } else {
      const vp = VIEW_PORTS.filter(vp => vp.name === key)[0]
      this.changeViewPort(vp.width, vp.height)
      this.setState({
        vpName: key,
        width: vp.width,
        height: vp.height
      })
    }
  }

  render () {
    const { toggoleRunMode, state, props, changeViewPort, onSelectVpChange } = this
    const { width, height, vpName, viewPortList } = state
    const { visible } = props
    return (
      <div
        className='preview-menu-bar'
        style={{
          display: visible ? '' : 'none'
        }}
      >
        <Space className='bar-content'>
          <Select
            size='small' style={{ width: 160 }} optionList={viewPortList} value={vpName} onChange={onSelectVpChange}
          />
          <InputNumber
            size='small' style={{ width: 80 }} value={width} onChange={val => {
              changeViewPort(val, height)
            }}
          /> - <InputNumber
            size='small' style={{ width: 80 }} value={height} onChange={val => {
              changeViewPort(width, val)
            }}
               />
          <Button
            type='primary'
            size='small'
            theme='solid'
            onClick={toggoleRunMode}
          >返回编辑
          </Button>
        </Space>
      </div>
    )
  }
}

export default PreviewMenuBar
