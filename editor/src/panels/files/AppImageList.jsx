import React from 'react'
import './app-image-list.less'

export default ({
  images,
  select
}) => {
  const onSelect = (file) => {
    select(file.path, file.src)
  }

  return (
    <div
      zIndex={3001}
      className='app-image-list'
    >
      {images.map((img, index) => {
        return (
          <div
            key={index} className='image-item'
          >
            <div className='image-wrapper'>
              <img
                onClick={() => onSelect(img)}
                src={img.src}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
