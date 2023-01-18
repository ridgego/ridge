import React from 'react'
import { IconPlus, IconMinus } from '@douyinfe/semi-icons'
import { Select, Space, withField, Button, InputNumber, Popover } from '@douyinfe/semi-ui'

const Px4Edit = withField((props) => {
  let values = []
  if (props.value) {
    if (props.value.split) {
      values = props.value.split(' ').map(v => parseInt(v))
    } else {
      values = [props.value]
    }
  }

  const setRadius = (val, index) => {
    values[index] = val

    props.onChange(values.map(v => (v || 0) + 'px').join(' '))
  }

  const addPx = () => {
    values.push(0)

    props.onChange(values.map(v => (v || 0) + 'px').join(' '))
  }

  const removePx = () => {
    values.pop()
    props.onChange(values.map(v => (v || 0) + 'px').join(' '))
  }

  return (
    <Space style={{
      display: 'flex'
    }}
    >
      {values.map((value, index) =>
        <InputNumber
          key={index}
          style={{
            width: '52px'
          }}
          size='small'
          value={value} onChange={value => {
            setRadius(value, index)
          }}
        />)}
      {values.length <= 4 &&
        <Button
          style={{
            padding: '4px 4px',
            height: '26px'
          }} size='mini' type='tertiary'
          icon={<IconPlus />}
          onClick={addPx}
        />}
      {values.length >= 2 &&
        <Button
          style={{
            padding: '4px 4px',
            height: '26px'
          }} size='mini' type='tertiary'
          icon={<IconMinus />}
          onClick={removePx}
        />}
    </Space>
  )
})

export default Px4Edit
