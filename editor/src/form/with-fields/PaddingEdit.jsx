import React from 'react'
import { IconPlus, IconMinus, IconMarginStroked } from '@douyinfe/semi-icons'
import { Select, Space, withField, Input, InputNumber, Popover } from '@douyinfe/semi-ui'

export const Padding = ({
  position = 'border',
  value,
  onChange
}) => {
  const paddings = (value || '0 0 0 0').split(' ').map(p => parseInt(p) || 0)

  return (
    <>
      <Input
        size='small' value={value} onChange={onChange} suffix={
          <Popover
            trigger='click'
            content={
              <div className='input-padding-pop'>
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
              </div>
}
          >
            <IconMarginStroked style={{ cursor: 'pointer' }} />
          </Popover>
}
      />

    </>
  )
}

const PaddingEdit = withField(Padding)

export default PaddingEdit
