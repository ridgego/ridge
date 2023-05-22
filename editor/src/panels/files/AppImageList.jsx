import React from 'react'
import { ridge } from '../../service/RidgeEditService'
import { Typography } from '@douyinfe/semi-ui'
import './app-image-list.less'

const { Text } = Typography
export default ({
  images,
  select
}) => {
  const onSelect = (file) => {
    // 选择后将filePath传出
    const { appService } = ridge
    // select(file.id)
    appService.getFilePath(file).then((filePath) => {
      select(filePath, file.src)
    })
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
