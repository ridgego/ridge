import React, { useState } from 'react'
import { IconPlus, IconMinus, IconBold, IconChevronDown, IconItalic } from '@douyinfe/semi-icons'
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

  const fontSize = parseInt(style.fontSize || '20')

  return (
    <>
      <Space>
        <InputNumber
          size='small'
          style={{
            width: '46px'
          }}
          value={fontSize} onChange={val => {
            onChange(Object.assign(style, {
              fontSize: val + 'px'
            }))
          }}
        />
        <PopColorPicker
          value={style.color} onChange={val => {
            onChange(Object.assign(style, {
              color: val
            }))
          }}
        />
        <Button
          icon={<IconBold />}
          size='small'
          type={style.fontWeight === 'bold' ? 'primary' : 'tertiary'}
          theme={style.fontWeight === 'bold' ? 'solid' : 'borderless'}
          onClick={() => {
            onChange(Object.assign(style, {
              fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold'
            }))
          }}
        />
        <Button type='tertiary' theme='borderless' icon={<IconChevronDown rotate={isOpen ? 180 : 0} />} onClick={toggle} />
      </Space>
      <Collapsible isOpen={isOpen}>
        <Space>
          <Select
            size='small' defaultValue={style.fontFamily} style={{ width: 120 }} onChange={val => {
              onChange(Object.assign(style, {
                fontFamily: val
              }))
            }}
          >
            <Select.Option value='SimSun'>宋体</Select.Option>
            <Select.Option value='SimHei'>黑体</Select.Option>
            <Select.Option value='Microsoft YaHei'>微软雅黑</Select.Option>
            <Select.Option value='NSimSun'>新宋体</Select.Option>
            <Select.Option value='FangSong'>仿宋</Select.Option>
            <Select.Option value='KaiTi'>楷体</Select.Option>
          </Select>
        </Space>
      </Collapsible>
    </>
  )
})

export default RectEdit
