import React from 'react'
import { Button, Divider, Dropdown, Popover, Space } from '@douyinfe/semi-ui'
import { IconPlus, IconTemplate, IconTick, IconSetting, IconPause, IconMinus, IconPlay } from '@douyinfe/semi-icons'
import AppSettingPanel from '../panels/setting/AppSettingPanel.jsx'
import './style.less'

const EmptyIcon = () => <span style={{ width: '21px' }} />
export default props => {
  const {
    dataPanelVisible,
    componentPanelVisible,
    propPanelVisible,
    outlinePanelVisible,
    pagesPanelVisible,
    modeRun,
    toggleVisible,
    toggoleRunMode
  } = props

  return (
    <div
      className='menu-bar'
    >
      <Space className='bar-content'>
        <Button
          size='small'
          disabled={modeRun}
          icon={<IconPlus />}
          type={componentPanelVisible ? 'primary' : 'tertiary'}
          theme={componentPanelVisible ? 'solid' : 'borderless'}
          onClick={() => toggleVisible('componentPanelVisible')}
        />

        <Divider layout='vertical' />
        <Dropdown
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
        </Dropdown>
        <Popover
          showArrow
          zIndex={3001}
          trigger='click'
          position='top'
          content={<AppSettingPanel />}
        >
          <Button disabled={modeRun} icon={<IconSetting />} theme='borderless' size='small' type='tertiary' />
        </Popover>
        <Button
          type={modeRun ? 'primary' : 'tertiary'}
          theme={modeRun ? 'solid' : 'borderless'}
          icon={modeRun ? <IconPause /> : <IconPlay />} size='small' onClick={toggoleRunMode}
        />

      </Space>
    </div>
  )
}
