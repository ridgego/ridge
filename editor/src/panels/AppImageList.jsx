import React, { useEffect, useState } from 'react'
import { ridge } from '../service/RidgeEditService'
import '../css/app-image-list.less'
export default ({
  select
}) => {
  const [images, setImages] = useState([])
  useEffect(() => {
    const { appService } = ridge
    appService.getByMimeType('image').then(files => {
      setImages(files)
    })
  })

  const onSelect = (file) => {
    // 选择后将filePath传出
    const { appService } = ridge
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
