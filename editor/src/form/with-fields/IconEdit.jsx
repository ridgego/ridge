import React, { useEffect, useState } from 'react'
import { Popover, Input, withField } from '@douyinfe/semi-ui'
import { IconChainStroked } from '@douyinfe/semi-icons'
import AppImageList from '../../panels/AppImageList.jsx'
import { ridge } from '../../service/RidgeEditService.js'

const IconEdit = withField(({
  value,
  onChange
}) => {
  const [images, setImages] = useState([])
  const AppList = () => {
    return (
      <div style={{
        width: '620px',
        height: '430px'
      }}
      >
        <AppImageList
          images={images} select={filePath => {
            onChange(filePath)
          }}
        />
      </div>
    )
  }

  const visibleChange = visible => {
    if (visible) {
      const { appService } = ridge
      appService.getByMimeType('image/svg').then(async files => {
        for (const file of files) {
          file.src = await appService.store.getItem(file.id)
        }
        setImages(files)
      })
    }
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
          onVisibleChange={visibleChange}
          trigger='click'
          showArrow
          zIndex={2001}
          content={
            <AppList />
          }
        >
          <span style={{
            fontSize: '12px',
            width: '33px',
            cursor: 'pointer',
            textAlign: 'center'
          }}
          >选择
          </span>
        </Popover>
      }
    />
  )
})

export default IconEdit
