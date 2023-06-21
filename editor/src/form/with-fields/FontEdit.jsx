import React, { useState } from 'react'
import { IconBold, IconChevronDown } from '@douyinfe/semi-icons'
import { Select, Space, withField, Button, InputNumber, Collapsible, Typography } from '@douyinfe/semi-ui'
import PopColorPicker from './PopColorPicker.jsx'

const fontSupported = [
  { name: '宋体', value: 'SimSun' },
  { name: '黑体', value: 'SimHei' },
  { name: '微软雅黑', value: 'Microsoft Yahei' },
  { name: '微软正黑体', value: 'Microsoft JhengHei' },
  { name: '楷体', value: 'KaiTi' },
  { name: '新宋体', value: 'NSimSun' },
  { name: '仿宋', value: 'FangSong' },
  { name: '幼圆', value: 'YouYuan' },
  { name: '隶书', value: 'LiSu' },
  { name: '苹方', value: 'PingFang SC' }
]

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
            {fontSupported.map(f => <Select.Option key={f.name} value={f.value}>{f.name}</Select.Option>)}
          </Select>
        </Space>
      </Collapsible>
    </>
  )
})

export default RectEdit
