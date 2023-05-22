import React from 'react'
import { IconPlus, IconMinus } from '@douyinfe/semi-icons'
import { Select, Space, withField, Button, InputNumber, Popover } from '@douyinfe/semi-ui'

export const Padding = ({
  position = 'border',
  value,
  onChange
}) => {
  const paddings = (value || '0 0 0 0').split(' ').map(p => parseInt(p))

  return (
    <div
      className={'input-padding position-' + position}
    >
      {paddings.map((n, index) =>
        <InputNumber
          className={'input-padding-number order-' + index}
          key={index}
          size='small'
          value={n} onChange={n => {
            paddings[index] = n
            onChange(paddings.map(p => p + 'px').join(' '))
          }}
        />)}
    </div>
  )
}

const PaddingEdit = withField(Padding)

export default PaddingEdit
