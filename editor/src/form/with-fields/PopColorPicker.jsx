import React from 'react'
import { Popover, Button, Input } from '@douyinfe/semi-ui'
import { TwitterPicker, GithubPicker } from 'react-color'

const PopColorPicker = ({
  value,
  options,
  onChange
}) => {
  return (
    <Input
      style={{ width: 100 }}
      size='small'
      value={value}
      onChange={onChange}
      suffix={<Popover content={
        <TwitterPicker
          triangle='hide'
          colors={options}
          color={value} onChangeComplete={val => {
            onChange(val.hex + parseInt(val.rgb.a * 255).toString(16))
          }}
        />
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
      </Popover>}
    />

  )
}

export default PopColorPicker
