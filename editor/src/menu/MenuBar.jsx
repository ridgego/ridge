import React from 'react'
import { Button, Divider, Dropdown, Popover, Space, Slider, Icon } from '@douyinfe/semi-ui'
import { IconPlus, IconTemplate, IconTick, IconCopy, IconPause, IconGridSquare, IconGridView1, IconGift, IconPlay } from '@douyinfe/semi-icons'
import IconBrush from '../icons/IconBrush.jsx'
import './style.less'

const EmptyIcon = () => <span style={{ width: '21px' }} />
export default props => {
  const {
    modeRun,
    currentPageId,
    visible,
    toggleContainerMask,
    zoom,
    zoomChange,
    toggoleRunMode,
    closeCurrentPage,
    capture,
    containerMask
  } = props

  return (
    <div
      className='menu-bar'
      style={{ display: visible ? '' : 'none' }}
    >
      <Space className='bar-content'>
        <Button
          icon={<IconGridView1 />}
          size='small'
          onClick={capture}
        />
        <Dropdown
          trigger='click'
          position='top'
          render={
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => zoomChange(0.3)}>30%</Dropdown.Item>
              <Dropdown.Item onClick={() => zoomChange(0.5)}>50%</Dropdown.Item>
              <Dropdown.Item onClick={() => zoomChange(0.6)}>60%</Dropdown.Item>
              <Dropdown.Item onClick={() => zoomChange(0.7)}>70%</Dropdown.Item>
              <Dropdown.Item onClick={() => zoomChange(0.8)}>80%</Dropdown.Item>
              <Dropdown.Item onClick={() => zoomChange(0.9)}>90%</Dropdown.Item>
              <Dropdown.Item onClick={() => zoomChange(1)}>100%</Dropdown.Item>
              <Dropdown.Item onClick={() => zoomChange(1.2)}>120%</Dropdown.Item>
              <Dropdown.Item onClick={() => zoomChange(1.5)}>150%</Dropdown.Item>
            </Dropdown.Menu>
          }
        >
          <Button style={{ width: 48 }} theme='borderless' type='tertiary'>{Math.floor(zoom * 100)}%</Button>
        </Dropdown>
        <div style={{ width: '120px' }}>
          <Slider min={10} max={200} value={zoom * 100} onChange={zoom => zoomChange(zoom / 100)} showBoundary={false} size='small' />
        </div>
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
        {/* <Popover
          showArrow
          zIndex={3001}
          trigger='click'
          position='top'
          content={<AppSettingPanel />}
        >
          <Button disabled={modeRun} icon={<IconSetting />} theme='borderless' size='small' type='tertiary' />
        </Popover> */}
        <Button
          type='tertiary'
          theme='borderless'
          icon={<i class='bi bi-x-lg' />} onClick={closeCurrentPage}
        >关闭
        </Button>
        <Button
          disabled={!currentPageId}
          type={modeRun ? 'primary' : 'tertiary'}
          theme={modeRun ? 'solid' : 'borderless'}
          icon={modeRun ? <IconPause /> : <IconPlay />} onClick={toggoleRunMode}
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
