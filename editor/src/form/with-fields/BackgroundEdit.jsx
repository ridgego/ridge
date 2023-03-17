import React from 'react'
import { SketchPicker } from 'react-color'
import { Select, Space, Input, withField, Button, Tabs, TabPane, Popover } from '@douyinfe/semi-ui'

const BackgroundEdit = withField(({
  value,
  onChange
}) => {
  const renderPopContent = () => {
    return (
      <Tabs type='button'>
        <TabPane tab='纯色' itemKey='1'>
          <SketchPicker
            color={value} onChangeComplete={val => {
              onChange(val.hex + parseInt(val.rgb.a * 255).toString(16))
            }}
          />
        </TabPane>
        <TabPane tab='自定义' itemKey='2'>
          <div style={{ height: 317, padding: 5, width: 220, display: 'flex', flexWrap: 'wrap' }}>
            <Input value={value} onChange={val => onChange(val)} />
          </div>
        </TabPane>
      </Tabs>
    )
  }
  return (
    <Popover content={renderPopContent} trigger='click'>
      <Button
        size='small' style={{
          background: value,
          height: '22px',
          width: '22px',
          padding: 0,
          border: '1px solid #ccc'
        }}
      />
    </Popover>
  )
})

export default BackgroundEdit
