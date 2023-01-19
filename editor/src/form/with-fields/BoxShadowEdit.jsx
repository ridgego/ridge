import React from 'react'
import PopColorPicker from './PopColorPicker.jsx'
import { Select, Space, withField, Button, InputNumber, Popover, Input } from '@douyinfe/semi-ui'

const BoxShadowEdit = withField(({
  value,
  onChange
}) => {
  let shadow = [0, 0, 5, 5, '#ccc']
  if (value) {
    shadow = value.split(' ').map((p, i) => i < 4 ? parseInt(p) : p)
  }
  const output = shadow => {
    onChange(`${shadow[0]}px ${shadow[1]}px ${shadow[2]}px ${shadow[3]}px ${shadow[4]}`)
  }
  return (
    <Space spacing={2}>
      <InputNumber
        className='digit2'
        size='small'
        value={shadow[0]}
        onChange={value => {
          shadow[0] = value
          output(shadow)
        }}
      />
      <InputNumber
        className='digit2'
        size='small'
        value={shadow[1]}
        onChange={value => {
          shadow[1] = value
          output(shadow)
        }}
      />
      <InputNumber
        className='digit2'
        size='small'
        value={shadow[2]}
        onChange={value => {
          shadow[2] = value
          output(shadow)
        }}
      />
      <InputNumber
        className='digit2'
        size='small'
        value={shadow[3]}
        onChange={value => {
          shadow[3] = value
          output(shadow)
        }}
      />
      <PopColorPicker
        value={shadow[4]} onChange={value => {
          shadow[4] = value
          output(shadow)
        }}
      />
    </Space>
  )
})

export default BoxShadowEdit
