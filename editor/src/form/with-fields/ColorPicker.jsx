import React from 'react'
import { withField, Button, Popover, Input } from '@douyinfe/semi-ui'
import PopColorPicker from './PopColorPicker.jsx'

const BorderEdit = withField((props) => {
  return (
    <PopColorPicker {...props} />
  )
})

export default BorderEdit
