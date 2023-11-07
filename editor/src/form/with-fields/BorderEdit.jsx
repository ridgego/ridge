import React from 'react'
import { Select, Space, withField, InputNumber } from '@douyinfe/semi-ui'
import { PopColorPicker } from './ColorPicker.jsx'

const BorderEdit = ({
  value,
  onChange
}) => {
  const [borderWidth = '', borderStyle = 'solid', borderColor = '#ccc'] = (value || '').split(' ')

  return (
    <Space>
      <InputNumber
        style={{ width: 60 }}
        size='small' value={parseInt(borderWidth) || 0} onChange={val => {
          onChange(`${val}px ${borderStyle} ${borderColor}`)
        }}
      />
      <Select
        size='small'
        value={borderStyle} onChange={val => {
          onChange(`${borderWidth} ${val} ${borderColor}`)
        }}
      >
        <Select.Option value='solid'>实线</Select.Option>
        <Select.Option value='dashed'>点划线</Select.Option>
      </Select>
      <PopColorPicker
        value={borderColor} onChange={val => {
          onChange(`${borderWidth} ${borderStyle} ${val}`)
        }}
      />
    </Space>
  )
}

export default withField(BorderEdit)
/*
{ /*
const BorderEdit1 = withField(({
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
      <Button
        theme='borderless' type='tertiary' size='small' icon={
          <IconIndependentCornersStroked />
      } onClick={() => {
        onChange([value, value, value, value])
      }}
      />
    )
  }
  const renderCollapse = () => {
    return (
      <Button
        theme='borderless' type='tertiary' size='small' icon={
          <IconMinusStroked />
      } onClick={() => {
        onChange(value[0])
      }}
      />
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
}) */
