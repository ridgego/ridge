import React from 'react'
import { IconPlus, IconMinus } from '@douyinfe/semi-icons'
import { Select, Space, withField, Button, InputNumber, Popover } from '@douyinfe/semi-ui'

const PaddingEdit = withField(({
  value,
  onChange
}) => {
  const paddings = (value || '0 0 0 0').split(' ').map(p => parseInt(p))

  return (
    <div style={{
      margin: '20px',
      border: '1px solid #ece'
    }}
    >
      {paddings.map((n, index) =>
        <InputNumber
          className={'padding-input-number order-' + index}
          key={index}
          style={{
            width: '46px'
          }}
          size='small'
          value={n} onChange={n => {
            paddings[index] = n
            onChange(paddings.map(p => p + 'px').join(' '))
          }}
        />)}
    </div>
  )
})

export default PaddingEdit
