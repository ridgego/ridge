import React, { useEffect, useState } from 'react'
import { Tabs, TabPane, Image, ImagePreview, Upload, Button } from '@douyinfe/semi-ui'
export default () => {
  const [images, setImages] = useState([])
  useEffect(() => {
    if (window.Ridge) {
      const { appService } = window.Ridge
      appService.getByMimeType('image').then(files => {
        setImages(files)
      })
    }
  })
  return (
    <ImagePreview
      zIndex={3001}
      className='app-image-list'
      lazyLoad={false}
      preLoad={false}
      defaultVisible
      style={{
        display: 'flex',
        flexWrap: 'wrap'
      }}
    >
      {images.map((img, index) => {
        return (
          <div
            key={index} style={{
              padding: '4px'
            }}
          >
            <Image
              lazyLoad={false}
              src={img.src}
              width={160}
              height={160}
              style={{ marginRight: 5 }}
            />
            <div>{img.name}</div>
          </div>
        )
      })}
    </ImagePreview>
  )
}
