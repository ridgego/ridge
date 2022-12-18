import React from 'react'
import { IconEdit } from '@douyinfe/semi-icons'
import { withField, Input } from '@douyinfe/semi-ui'

const JSONEdit = withField(({
  value,
  options,
  onChange
}) => {
  const strigifid = JSON.stringify(value)
  const openEditCode = (strigifid) => {
    const { Ridge } = window

    Ridge && Ridge.openCodeEditor &&
    Ridge.openCodeEditor({
      lang: 'json',
      code: strigifid,
      completed: (newCode) => {
        onChange(JSON.parse(newCode))
      }
    })
  }
  return (
    <Input
      size='small'
      value={strigifid}
      addonAfter={<IconEdit style={{ cursor: 'pointer' }} onClick={() => openEditCode(strigifid)} />}
      onChange={val => onChange(JSON.parse(val))}
    />
  )
})

export default JSONEdit
