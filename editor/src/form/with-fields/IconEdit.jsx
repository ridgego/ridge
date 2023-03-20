import React, { useState } from 'react'
import { Popover, Input, Typography, withField, Button } from '@douyinfe/semi-ui'
import AppImageList from '../../panels/files/AppImageList.jsx'
import { ridge } from '../../service/RidgeEditService.js'
import { dataURLToString } from '../../utils/blob.js'

const { Text } = Typography

const IconEdit = withField(({
  value,
  onChange
}) => {
  const [images, setImages] = useState([])
  const AppList = () => {
    return (
      <div style={{
        width: '420px',
        height: '400px'
      }}
      >
        <Text>选择图标</Text>
        <AppImageList
          images={images} select={(filePath, base64Url) => {
            dataURLToString(base64Url).then(blob => {
              onChange(blob)
            })
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
