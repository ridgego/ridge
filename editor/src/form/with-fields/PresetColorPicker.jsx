import React from 'react'
import { Popover, withField, Button } from '@douyinfe/semi-ui'
import { CirclePicker } from 'react-color'

const PresetColorPicker = ({
  value,
  options,
  onChange
}) => {
  return (
    <Popover content={
      <div
        className='preset-color-picker' style={{
          padding: '10px'
        }}
      >
        {options && options.map((op, index) => {
          return (
            <div key={index}>
              <div style={{ margin: '5px' }}>{op.title}</div>
              <CirclePicker
                colors={op.colors}
                color={value} onChangeComplete={val => {
                  onChange(val.hex + parseInt(val.rgb.a * 255).toString(16))
                }}
              />
            </div>
          )
        })}
      </div>
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

const Component = withField((props) => {
  return (
    <PresetColorPicker {...props} />
  )
})

export default Component
