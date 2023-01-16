import React from 'react'
import { HexColorPicker } from 'react-colorful'
import { Select, Space, withField, Button, InputNumber, Popover, Input } from '@douyinfe/semi-ui'

const BoxShadowEdit = withField((props) => {
  let shadow = [0, 0, 0, '#fff']
  if (props.value) {
    shadow = props.value.split(' ')
  }
  return (
    <Space>
      <InputNumber
        style={{
          width: '64px'
        }}
        size='small'
        value={parseInt(shadow[0]) || 0}
        onChange={value => {
          shadow[0] = value
          props.onChange(shadow[0] + 'px ' + shadow[1] + 'px ' + shadow[2] + 'px ' + shadow[3])
        }}
      />
      <InputNumber
        style={{
          width: '64px'
        }}
        size='small'
        value={parseInt(shadow[1]) || 0}
        onChange={value => {
          shadow[1] = value
          props.onChange(shadow[0] + 'px ' + shadow[1] + 'px ' + shadow[2] + 'px ' + shadow[3])
        }}
      />
      <InputNumber
        style={{
          width: '64px'
        }}
        size='small'
        value={parseInt(shadow[2]) || 0}
        onChange={value => {
          shadow[2] = value
          props.onChange(shadow[0] + 'px ' + shadow[1] + 'px ' + shadow[2] + 'px ' + shadow[3])
        }}
      />
      <Popover content={
        <>
          <HexColorPicker
            color={shadow[3]} onChange={value => {
              shadow[3] = value
              props.onChange(shadow[0] + 'px ' + shadow[1] + 'px ' + shadow[2] + 'px ' + shadow[3])
            }}
          />
          <Input
            size='small' value={sp[2]} onChange={value => {
              props.onChange(sp[0] + 'px ' + sp[1] + ' ' + value)
            }}
          />
        </>
        }
      >
        <Button
          size='small' style={{
            backgroundColor: sp[2]
          }}
        />
      </Popover>
    </Space>
  )
})

export default BoxShadowEdit
