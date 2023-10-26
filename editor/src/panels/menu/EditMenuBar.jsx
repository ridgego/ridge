import React from 'react'
import { Button, Divider, Badge, Space, Slider } from '@douyinfe/semi-ui'
import {  IconPause, IconSaveStroked, IconGridView1, IconPlay } from '@douyinfe/semi-icons'
import context from '../../service/RidgeEditorContext.js'
import './style.less'

const EmptyIcon = () => <span style={{ width: '21px' }} />

class MenuBar extends React.Component {
  constructor () {
    super()
    context.services.menuBar = this
    this.state = {
      pageChanged: false,
      zoom: 1,
      isPreview: false,
      containerMask: true
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

  render () {
    const { zoomChange, toggleContainerMask, toggoleRunMode, savePage, state, props } = this
    const { zoom, isPreview, containerMask, pageChanged } = state
    const { visible } = props
    return (
      <div
        className='menu-bar'
        style={{
          display: visible ? '' : 'none'
        }}
      >
        <Space className='bar-content'>
          <Badge dot={pageChanged}>
            <Button type='tertiary' theme='borderless' icon={<IconSaveStroked />} size='small' onClick={savePage} />
          </Badge>
          <div style={{ width: '180px' }}>
            <Slider min={10} max={200} marks={{ 50: '', 100: '', 150: '' }} value={zoom * 100} onChange={zoom => zoomChange(zoom / 100)} showBoundary={false} size='small' />
          </div>
          <Button theme='borderless' type='tertiary' size='small' style={{ width: '54px' }}>{Math.floor(zoom * 100)}%</Button>
          <Divider layout='vertical' />
          <Button
            icon={<IconGridView1 />}
            size='small'
            type={containerMask ? 'primary' : 'tertiary'}
            theme={containerMask ? 'solid' : 'borderless'}
            onClick={toggleContainerMask}
          />
          {/* <Dropdown
          trigger='click'
          position='rightTop'
          render={
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => toggleVisible('dataPanelVisible')}>{dataPanelVisible ? <IconTick /> : <EmptyIcon />} 数据面板</Dropdown.Item>
              <Dropdown.Item onClick={() => toggleVisible('propPanelVisible')}>{propPanelVisible ? <IconTick /> : <EmptyIcon />} 属性面板</Dropdown.Item>
              <Dropdown.Item onClick={() => toggleVisible('outlinePanelVisible')}>{outlinePanelVisible ? <IconTick /> : <EmptyIcon />} 导航列表</Dropdown.Item>
              <Dropdown.Item onClick={() => toggleVisible('pagesPanelVisible')}>{pagesPanelVisible ? <IconTick /> : <EmptyIcon />} 应用页面列表</Dropdown.Item>
            </Dropdown.Menu>
          }
        >
          <Button disabled={modeRun} icon={<IconTemplate />} theme='borderless' size='small' type='tertiary' />
        </Dropdown> */}
          <Button
            type='tertiary'
            theme='borderless'
            icon={<i class='bi bi-x-lg' />} onClick={() => {
              context.closeCurrentPage()
            }}
          >关闭
          </Button>
          <Button
            type={isPreview ? 'primary' : 'tertiary'}
            theme={isPreview ? 'solid' : 'borderless'}
            icon={isPreview ? <IconPause /> : <IconPlay />} onClick={toggoleRunMode}
          >预览
          </Button>
          {/* <Button
          type='warning'
          theme='solid'
          icon={<IconGift />}
        >组件商店
        </Button> */}
        </Space>
      </div>
    )
  }
}

export default MenuBar
