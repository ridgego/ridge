import React from 'react'
import { Popover, Button } from '@douyinfe/semi-ui'
import { SketchPicker } from 'react-color'

const PopColorPicker = ({
  value,
  onChange
}) => {
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
}

export default PopColorPicker
