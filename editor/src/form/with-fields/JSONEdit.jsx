import React, { useState } from 'react'
import { withField, TextArea } from '@douyinfe/semi-ui'

const JSONEdit = withField(({
  value,
  options,
  onChange
}) => {
  return (
    <TextArea
      size='small'
      autosize
      defaultValue={JSON.stringify(value)}
      rows={1} onBlur={(e) => {
        onChange(JSON.parse(e.target.value))
      }}
    />
  )
})

export default JSONEdit
