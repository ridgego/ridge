import React, { useState } from 'react'
import { SketchPicker } from 'react-color'
import { Select, Input, TextArea, Space, withField, Button, Tabs, TabPane, Popover } from '@douyinfe/semi-ui'
import { ImageEdit } from './ImageEdit.jsx'
import { PopColorPicker } from './ColorPicker.jsx'

const BackgroundEdit = withField(({
  value,
  onChange
}) => {
  const [mode, setMode] = useState('color')

  const backgroundValue = value || {
    type: 'color'
  }
  return (
    <>
      <Select
        size='small'
        style={{
          marginBottom: 10
        }}
        value={backgroundValue.type} onChange={val => {
          onChange({
            type: val,
            value: ''
          })
        }}
      >
        <Select.Option value='color'>纯色</Select.Option>
        <Select.Option value='image'>图片</Select.Option>
        <Select.Option value='code'>编码</Select.Option>
      </Select>
      <div>
        {backgroundValue.type === 'color' &&
          <PopColorPicker
            value={backgroundValue.value} onChange={val => {
              onChange({
                type: 'color',
                value: val
              })
            }}
          />}
        {backgroundValue.type === 'code' &&
          <TextArea
            style={{ width: '95%' }} autosize value={backgroundValue.value} rows={2} onChange={val => {
              onChange({
                type: 'code',
                value: val
              })
            }}
          />}
        {backgroundValue.type === 'image' &&
          <>
            <ImageEdit
              value={backgroundValue.value} onChange={val => {
                onChange({
                  type: 'image',
                  value: val
                })
              }}
            />
            {/* <Select
              size='small'
              value={backgroundValue.size} onChange={val => {
                onChange({
                  type: val,
                  value: ''
                })
              }}
            >
              <Select.Option value='contain'>包含</Select.Option>
              <Select.Option value='cover'>覆盖</Select.Option>
            </Select> */}
          </>}
      </div>
    </>
  )
})

export default BackgroundEdit
