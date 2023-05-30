import React from 'react'
import { withField, Button, Popover, Input } from '@douyinfe/semi-ui'
import { SketchPicker } from 'react-color'

export const PopColorPicker = ({
  value,
  options,
  onChange
}) => {
  return (
    <Popover
      showArrow
      trigger='click' content={
        <>
          <Button
            size='small' onClick={() => {
              onChange(null)
            }}
          >清除颜色
          </Button>
          <SketchPicker
            color={value || '#fff'}
            width={220}
            style={{
              boxShadow: 'none'
            }}
            triangle='hide'
            onChange={val => {
              onChange(val.hex + parseInt(val.rgb.a * 255).toString(16))
            }}
            onChangeComplete={val => {
              onChange(val.hex + parseInt(val.rgb.a * 255).toString(16))
            }}
          />
        </>
    }
    >
      <Button
        size='small' style={{
          backgroundColor: value,
          height: '22px',
          width: '22px',
          margin: '0 3px',
          padding: 0,
          border: '1px solid #ccc'
        }}
      />
    </Popover>
  )
}

export default withField(PopColorPicker)
