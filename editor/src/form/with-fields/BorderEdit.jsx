import React from 'react'
import { HexColorPicker } from 'react-colorful'
import { Select, Space, withField, Button, InputNumber, Popover } from '@douyinfe/semi-ui'

const BorderEdit = withField((props) => {
  let sp = [0, 'solid', '#fff']
  if (props.value) {
    sp = props.value.split(' ')
    sp[0] = parseInt(sp[0])
  }
  return (
    <Space>
      <InputNumber
        style={{
          width: '64px'
        }}
        defaultValue={sp[0]}
        value={sp[0]} onChange={value => {
          props.onChange(value + 'px ' + sp[1] + ' ' + sp[2])
        }}
      /> <Select
        value={sp[1]} optionList={[{
          label: '实线',
          value: 'solid'
        }, {
          label: '点划线',
          value: 'dashed'
        }]}
        onChange={value => {
          props.onChange(sp[0] + 'px ' + value + ' ' + sp[2])
        }}
         />
      <Popover content={
        <HexColorPicker
          color={sp[2]} onChange={value => {
            props.onChange(sp[0] + 'px ' + sp[1] + ' ' + value)
          }}
        />
        }
      >
        <Button style={{
          backgroundColor: sp[2]
        }}
        />
      </Popover>
    </Space>
  )
})

export default BorderEdit
