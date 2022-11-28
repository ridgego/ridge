import React from 'react'
import { Button, Dropdown } from '@douyinfe/semi-ui'
import { IconPlus, IconTemplate, IconTick, IconSetting, IconMinus } from '@douyinfe/semi-icons'

const EmptyIcon = () => <span style={{ width: '21px' }} />
export default props => {
  const {
    dataPanelVisible,
    componentPanelVisible,
    propPanelVisible,
    outlinePanelVisible,
    pagesPanelVisible,
    toggleVisible
  } = props

  return (
    <div style={{
      position: 'absolute',
      left: '10px',
      top: '10px',
      gap: '5px',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--semi-color-bg-0)',
      border: '1px solid var(--semi-color-border)',
      padding: '4px',
      borderRadius: '5px',
      zIndex: 101
    }}
    >
      <Button
        size='small'
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
        <Button icon={<IconTemplate />} theme='borderless' size='small' type='tertiary' />
      </Dropdown>

      <Button icon={<IconSetting />} theme='borderless' size='small' type='tertiary' />

    </div>
  )
}