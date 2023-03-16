import React from 'react'
import { SketchPicker } from 'react-color'
import { Select, Space, withField, Button, InputNumber, Popover } from '@douyinfe/semi-ui'

const BackgroundEdit = withField(({
  value,
  onChange
}) => {
  const renderPopContent = () => {

  }
  return (
    <Popover content={

      <SketchPicker
        color={value} onChangeComplete={val => {
          onChange(val.hex + parseInt(val.rgb.a * 255).toString(16))
        }}
      />
    }
    >
      <Button
        size='small' style={{
          backgroundColor: value,
          height: '22px',
          width: '22px',
          padding: 0,
          border: '1px solid #ccc'
        }}
      />
    </Popover>
  )
})

export default BackgroundEdit
