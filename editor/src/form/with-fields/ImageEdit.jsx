import React, { useEffect, useState } from 'react'
import { Popover, Input, withField } from '@douyinfe/semi-ui'
import { IconChainStroked } from '@douyinfe/semi-icons'
import AppImageList from '../../panels/AppImageList.jsx'
import { ridge } from '../../service/RidgeEditService.js'

const ImageEdit = withField(({
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
      appService.getByMimeType('image').then(files => {
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
          <IconChainStroked
            style={{ cursor: 'pointer' }}
          />
        </Popover>
      }
    />
  )
})

export default ImageEdit
