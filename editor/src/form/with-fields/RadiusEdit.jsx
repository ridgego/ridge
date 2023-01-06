import React from 'react'
import { Select, Space, withField, Button, InputNumber, Popover } from '@douyinfe/semi-ui'

const BorderEdit = withField((props) => {
  let values = [0, 0, 0, 0]
  if (props.value) {
    values = props.value.split(' ').map(v => parseInt(v))
  }

  const setRadius = (val, index) => {
    values[index] = val

    props.onChange(values.map(v => (v || 0) + 'px').join(' '))
  }

  return (
    <Space style={{
      display: 'flex'
    }}
    >
      <InputNumber
        size='small'
        value={values[0]} onChange={value => {
          setRadius(value, 0)
        }}
      />
      <InputNumber
        size='small'
        value={values[1]} onChange={value => {
          setRadius(value, 1)
        }}
      />
      <InputNumber
        size='small'
        value={values[2]} onChange={value => {
          setRadius(value, 2)
        }}
      />
      <InputNumber
        size='small'
        value={values[3]} onChange={value => {
          setRadius(value, 3)
        }}
      />
    </Space>
  )
})

export default BorderEdit
