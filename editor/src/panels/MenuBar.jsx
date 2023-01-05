import React from 'react'
import { Button, Dropdown, Popover } from '@douyinfe/semi-ui'
import { IconPlus, IconTemplate, IconTick, IconSetting, IconPause, IconMinus, IconPlay } from '@douyinfe/semi-icons'
import AppSettingPanel from './AppSettingPanel.jsx'

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
      style={{

      }}
    >
      <Button
        size='small'
        disabled={modeRun}
        icon={<IconPlus />}
        type={componentPanelVisible ? 'primary' : 'tertiary'}
        theme={componentPanelVisible ? 'solid' : 'borderless'}
        onClick={() => toggleVisible('componentPanelVisible')}
      />

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
        position='right'
        content={<AppSettingPanel />}
      >
        <Button disabled={modeRun} icon={<IconSetting />} theme='borderless' size='small' type='tertiary' />
      </Popover>
      <Button
        type={modeRun ? 'primary' : 'tertiary'}
        theme={modeRun ? 'solid' : 'borderless'}
        icon={modeRun ? <IconPause /> : <IconPlay />} size='small' onClick={toggoleRunMode}
      />
    </div>
  )
}
