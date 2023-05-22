import React, { useState } from 'react'
import { IconPlus, IconMinus, IconChevronDown, IconConfigStroked } from '@douyinfe/semi-icons'
import { Select, Space, withField, Button, InputNumber, Collapsible, Typography } from '@douyinfe/semi-ui'
import PopColorPicker from './PopColorPicker.jsx'
import { Padding } from './PaddingEdit.jsx'
const { Text } = Typography

// const Padding = ({
//   value,
//   onChange
// }) => {
//   const paddings = (value || '0 0 0 0').split(' ').map(p => parseInt(p))

//   return (
//     <>
//       {paddings.map((val, index) =>
//         <InputNumber
//           key={index}
//           size='small'
//           style={{
//             width: '46px'
//           }}
//           value={val} onChange={val => {
//             paddings[index] = val
//             onChange(paddings.map(p => p + 'px').join(' '))
//           }}
//         />)}
//     </>
//   )
// }

const RectEdit = withField(({
  value,
  onChange
}) => {
  const [isOpen, setOpen] = useState(false)
  const toggle = () => {
    setOpen(!isOpen)
  }
  const style = value || {}
  const shadow = (style.boxShadow || '0 0 0 0 #fff').split(' ').map((p, i) => i < 4 ? parseInt(p) : p)
  const updateShadow = () => {
    onChange(Object.assign(style, {
      boxShadow: `${shadow[0]}px ${shadow[1]}px ${shadow[2]}px ${shadow[3]}px ${shadow[4]}`
    }))
  }
  return (
    <>
      <Space>
        <Text type='tertiary'>边框及背景</Text>
        <PopColorPicker
          value={style.borderColor} onChange={val => {
            onChange(Object.assign(style, {
              borderColor: val
            }))
          }}
        />
        <PopColorPicker
          value={style.backgroundColor} onChange={val => {
            onChange(Object.assign(style, {
              backgroundColor: val
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
        <Button type={isOpen ? 'primary' : 'tertiary'} theme='borderless' icon={<IconConfigStroked />} onClick={toggle} />
      </Space>
      <Collapsible isOpen={isOpen}>
        <Space style={{ marginTop: 8 }}>
          <Text type='tertiary' style={{ width: 60 }}>边框宽度</Text>
          <Padding
            value={style.borderWidth} onChange={val => {
              onChange(Object.assign(style, {
                borderWidth: val
              }))
            }}
          />
        </Space>

        <Space style={{ marginTop: 12 }}>
          <Text type='tertiary' style={{ width: 60 }}>内边距</Text>
          <Padding
            value={style.padding} onChange={val => {
              onChange(Object.assign(style, {
                padding: val
              }))
            }}
          />
        </Space>

        <Space style={{ marginTop: 12 }}>
          <Text type='tertiary' style={{ width: 60 }}>圆角</Text>
          <Padding
            position='corner'
            value={style.borderRadius} onChange={val => {
              onChange(Object.assign(style, {
                borderRadius: val
              }))
            }}
          />
        </Space>

        <Space style={{ marginTop: 12 }}>
          <Text type='tertiary'>阴影</Text>
          <InputNumber
            className='digit2'
            size='small'
            value={shadow[0]}
            onChange={value => {
              shadow[0] = value
              updateShadow()
            }}
          />
          <InputNumber
            className='digit2'
            size='small'
            value={shadow[1]}
            onChange={value => {
              shadow[1] = value
              updateShadow()
            }}
          />
          <InputNumber
            className='digit2'
            size='small'
            value={shadow[2]}
            onChange={value => {
              shadow[2] = value
              updateShadow()
            }}
          />
          <InputNumber
            className='digit2'
            size='small'
            value={shadow[3]}
            onChange={value => {
              shadow[3] = value
              updateShadow()
            }}
          />
          <PopColorPicker
            value={shadow[4]} onChange={value => {
              shadow[4] = value
              updateShadow()
            }}
          />
        </Space>

      </Collapsible>
    </>
  )
})

export default RectEdit
