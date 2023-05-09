import React, { useState } from 'react'
import { IconPlus, IconMinus } from '@douyinfe/semi-icons'
import { Select, Space, withField, Button, InputNumber, Collapsible, Typography } from '@douyinfe/semi-ui'
import PopColorPicker from './PopColorPicker.jsx'

const { Text } = Typography

const RectEdit = withField(({
  value,
  onChange
}) => {
  const [isOpen, setOpen] = useState(false)
  const toggle = () => {
    setOpen(!isOpen)
  }
  const style = value || {}
  const borderWidth = style.borderWidth || '0px 0px 0px 0px'
  const borderNums = borderWidth.split(' ').map(px => parseInt(px))
  return (
    <>
      <Button onClick={toggle}>详细</Button>
      <Collapsible isOpen={isOpen} style={{ padding: '5px' }}>
        <Space>
          <Text type='secondary'>边框</Text>
          <PopColorPicker
            value={style.borderColor} onChange={val => {
              onChange(Object.assign(style, {
                borderColor: val
              }))
            }}
          />
          <Select
            value={style.borderStyle} optionList={[{
              label: '实线',
              value: 'solid'
            }, {
              label: '点划线',
              value: 'dashed'
            }]}
            size='small'
            onChange={value => {
              onChange(Object.assign(style, {
                borderStyle: value
              }))
            }}
          />
        </Space>
        <Space style={{ marginTop: 8 }}>
          <Text type='secondary'>宽度</Text>
          <InputNumber
            size='small'
            style={{
              width: '46px'
            }}
            value={borderNums[0]} onChange={val => {
              onChange(Object.assign(style, {
                borderWidth: `${val}px ${borderNums[1]}px ${borderNums[2]}px ${borderNums[3]}px`
              }))
            }}
          />
          <InputNumber
            size='small'
            style={{
              width: '46px'
            }}
            value={borderNums[1]} onChange={val => {
              onChange(Object.assign(style, {
                borderWidth: `${borderNums[0]}px ${val}px ${borderNums[2]}px ${borderNums[3]}px`
              }))
            }}
          />
          <InputNumber
            size='small'
            style={{
              width: '46px'
            }}
            value={borderNums[2]} onChange={val => {
              onChange(Object.assign(style, {
                borderWidth: `${borderNums[0]}px ${borderNums[1]}px ${val}px ${borderNums[3]}px`
              }))
            }}
          />
          <InputNumber
            size='small'
            style={{
              width: '46px'
            }}
            value={borderNums[3]} onChange={val => {
              onChange(Object.assign(style, {
                borderWidth: `${borderNums[0]}px ${borderNums[1]}px ${borderNums[2]}px ${val}px`
              }))
            }}
          />
        </Space>

        <Space style={{ marginTop: 8 }}>
          <Text>背景色</Text>
          <PopColorPicker
            value={style.backgroundColor} onChange={val => {
              onChange(Object.assign(style, {
                backgroundColor: val
              }))
            }}
          />
        </Space>
      </Collapsible>
    </>
  )
})

export default RectEdit
