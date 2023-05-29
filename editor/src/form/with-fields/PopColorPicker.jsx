import React from 'react'
import { Popover, Button, Input } from '@douyinfe/semi-ui'
import { TwitterPicker, SketchPicker, BlockPicker } from 'react-color'

const PRESET_COLORS = ['rgb(255, 255, 255)', 'rgb(10, 10, 10)', 'rgb(245, 245, 245)', 'rgb(54, 54, 54)', 'rgb(0, 209, 178)', 'rgb(50, 115, 220)', 'rgb(32, 156, 238)', 'rgb(35, 209, 96)', 'rgb(255, 221, 87)', 'rgb(255, 56, 96)', 'rgb(18, 18, 18)', 'rgb(36, 36, 36)', 'rgb(74, 74, 74)', 'rgb(122, 122, 122)', 'rgb(181, 181, 181)', 'rgb(219, 219, 219)', 'rgb(250, 250, 250)', 'rgb(235, 255, 252)', 'rgb(238, 243, 252)', 'rgb(238, 246, 252)', 'rgb(239, 250, 243)', 'rgb(255, 251, 235)', 'rgb(254, 236, 240)', 'rgb(0, 148, 126)', 'rgb(33, 96, 196)', 'rgb(29, 114, 170)', 'rgb(37, 121, 66)', 'rgb(148, 118, 0)', 'rgb(204, 15, 53)']

const PopColorPicker = ({
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
            color={value}
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
          height: '20px',
          width: '20px',
          margin: '0 3px',
          padding: 0,
          border: '1px solid #ccc'
        }}
      />
    </Popover>
  )
}

export default PopColorPicker
