import React from 'react'
import { Button } from '@douyinfe/semi-ui'
import { IconPlus, IconTemplate } from '@douyinfe/semi-icons'

export default props => {
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
      <Button icon={<IconPlus />} theme='borderless' size='small' type='tertiary' />
      <Button icon={<IconTemplate />} theme='borderless' size='small' type='tertiary' />
    </div>
  )
}
