import React from 'react'
import PopColorPicker from './PopColorPicker.jsx'
import { Select, Space, withField, Button, InputNumber, Popover, Input, Typography } from '@douyinfe/semi-ui'

const { Text } = Typography
const BorderEdit = withField(({
  value,
  onChange
}) => {
  const toArray = (value) => {
    const border = value.split(' ')
    border[0] = parseInt(border[0]) || 0
    return border
  }

  const fromArray = (border) => {
    return border[0] + 'px' + ' ' + border[1] + ' ' + border[2]
  }

  const renderExpand = () => {
    return (
      <Text
        onClick={() => {
          onChange([value, value, value, value])
        }} code
      >展开
      </Text>
    )
  }
  const renderCollapse = () => {
    return (
      <Text
        onClick={() => {
          onChange(value[0])
        }} code
      >收起
      </Text>
    )
  }

  const borderChange = (border, index) => {
    onChange(value.map((item, i) => (i === index) ? border : item))
  }

  // 渲染单行
  const renderBorder = (border, output, btn) => {
    return (
      <Space spacing={2}>
        <InputNumber
          style={{
            width: '64px'
          }}
          size='small'
          value={border[0]} onChange={value => {
            border[0] = value
            output(fromArray(border))
          }}
        /> <Select
          value={border[1]} optionList={[{
            label: '实线',
            value: 'solid'
          }, {
            label: '点划线',
            value: 'dashed'
          }]}
          size='small'
          onChange={value => {
            border[1] = value
            output(fromArray(border))
          }}
           />
        <PopColorPicker
          value={border[2]} onChange={value => {
            border[2] = value
            output(fromArray(border))
          }}
        />
        {btn && btn()}
      </Space>
    )
  }

  if (value == null) {
    return renderBorder([0, 'solid', '#fff'], (value) => {
      onChange(value)
    }, renderExpand)
  } else if (typeof value === 'string') {
    return renderBorder(toArray(value), (value) => {
      onChange(value)
    }, renderExpand)
  } else {
    return (
      <>
        <>
          {renderBorder(toArray(value[0]), (value) => {
            borderChange(value, 0)
          }, renderCollapse)}
          {renderBorder(toArray(value[1]), (value) => {
            borderChange(value, 1)
          })}
          {renderBorder(toArray(value[2]), (value) => {
            borderChange(value, 2)
          })}
          {renderBorder(toArray(value[3]), (value) => {
            borderChange(value, 3)
          })}
        </>
      </>
    )
  }
})

export default BorderEdit
