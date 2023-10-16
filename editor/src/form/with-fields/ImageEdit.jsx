import React, { useState } from 'react'
import { Popover, Input, withField } from '@douyinfe/semi-ui'
import { IconChainStroked, IconFolderOpen } from '@douyinfe/semi-icons'
import AppImageList from '../../panels/files/AppImageList.jsx'
import ridgeEditService from '../../service/RidgeEditService.js'

export const ImageEdit = ({
  value,
  onChange
}) => {
  const [images, setImages] = useState([])
  const AppList = () => {
    return (
      <div style={{
        width: '510px',
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
      const { appService } = ridgeEditService

      const files = Object.entries(appService.dataUrlByPath).map(r => {
        return {
          path: r[0],
          src: r[1]
        }
      })
      setImages(files)
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
          <IconFolderOpen style={{ cursor: 'pointer' }} />
        </Popover>
      }
    />
  )
}

export default withField(ImageEdit)
