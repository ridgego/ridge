import React from 'react'
import PopColorPicker from './PopColorPicker.jsx'
import { Select, Space, withField, Button, InputNumber, Popover } from '@douyinfe/semi-ui'

const BackgroundEdit = withField((props) => {
  return (
    <Space>
      <PopColorPicker value={props.value} onChange={props.onChange} />
    </Space>
  )
})

export default BackgroundEdit
