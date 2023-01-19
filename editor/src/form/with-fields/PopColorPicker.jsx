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
          onChange(val.hex)
        }}
      />
    }
    >
      <Button
        size='small' style={{
          backgroundColor: value,
          height: '24px',
          width: '24px',
          padding: 0,
          border: '1px solid #ccc'
        }}
      />
    </Popover>
  )
}

export default PopColorPicker
