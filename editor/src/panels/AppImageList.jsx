import React, { useEffect, useState } from 'react'
import { ridge } from '../service/RidgeEditService'
import '../css/app-image-list.less'
export default ({
  images,
  select
}) => {
  const onSelect = (file) => {
    // 选择后将filePath传出
    const { appService } = ridge
    // select(file.id)
    appService.getFilePath(file).then((filePath) => {
      select(filePath)
    })
  }

  return (
    <div
      zIndex={3001}
      className='app-image-list'
      style={{
        display: 'flex',
        flexWrap: 'wrap'
      }}
    >
      {images.map((img, index) => {
        return (
          <div
            key={index} className='image-item'
          >
            <img
              onClick={() => onSelect(img)}
              src={img.src}
            />
            <div className='image-title'>{img.name}</div>
          </div>
        )
      })}
    </div>
  )
}
