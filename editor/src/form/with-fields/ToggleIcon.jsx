import React from 'react'
import { withField, Button } from '@douyinfe/semi-ui'

const ToggleButton = withField(({
  icon,
  value,
  onChange
}) => {
  return (
    <div
      style={{
        height: 24,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Button
        placeholder='启用调试模式'
        type={value ? 'primary' : 'tertiary'}
        size='small'
        theme='borderless'
        onClick={() => {
          onChange(!value)
        }}
        icon={icon}
      />
    </div>
  )
})

export default ToggleButton
