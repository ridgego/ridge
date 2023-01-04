import React, { useState } from 'react'
import { Popover, Input, withField } from '@douyinfe/semi-ui'
import { IconDelete, IconEdit, IconChainStroked } from '@douyinfe/semi-icons'
import AppImageList from '../../panels/AppImageList.jsx'

const ImageEdit = withField(({
  value,
  onChange
}) => {
  const AppList = () => {
    return (
      <div style={{
        width: '620px',
        height: '430px'
      }}
      >
        <AppImageList select={filePath => {
          onChange(filePath)
        }}
        />
      </div>
    )
  }
  return (
    <Input
      size='small'
      showClear
      onClear={() => onChange('')}
      value={value}
      onChange={val => onChange(val)}
      suffix={
        <Popover
          trigger='click'
          showArrow
          zIndex={2001}
          content={
            <AppList />
          }
        >
          <IconChainStroked
            style={{ cursor: 'pointer' }}
          />
        </Popover>
      }
    />
  )
})

export default ImageEdit
