import React, { useState } from 'react'
import trim from 'lodash/trim'
import { Modal, Input } from '@douyinfe/semi-ui'

export default ({
  show,
  value,
  siblingNames,
  change,
  confirm,
  cancel
}) => {
  const [nameValid, setNameValid] = useState(true)

  /**
   * 实时检查名称是否冲突
   */
  const checkFileName = (val) => {
    const trimVal = trim(val)
    setNameValid(true)
    if (trimVal === '') {
      setNameValid(false)
    } else {
      if (siblingNames && siblingNames.indexOf(trimVal) > -1) {
        setNameValid(false)
      }
    }
  }

  return (
    <Modal
      title='重命名'
      visible={show}
      onOk={() => {
        if (nameValid) {
          confirm()
        }
      }}
      onCancel={() => {
        cancel()
      }}
    >
      <Input
        value={value}
        validateStatus={nameValid ? '' : 'error'}
        label='名称' onChange={val => {
          change(val)
          checkFileName(val)
        }}
      />
    </Modal>
  )
}
