import React from 'react'
import { Tabs, TabPane, Image, ImagePreview, Upload, Button } from '@douyinfe/semi-ui'
import { IconFile, IconGlobe, IconHelpCircle, IconUpload } from '@douyinfe/semi-icons'

export default class FileManager extends React.Component {
  constructor () {
    super()
    this.state = {
      images: [],
      audios: [],
      videos: [],
      files: []
    }
  }

  componentDidMount () {
    this.reloadImages()
  }

  reloadImages () {
    const { appService } = window
    appService.getImages().then(images => {
      this.setState({
        images
      })
    })
  }

  render () {
    const { images } = this.state
    const beforeUpload = ({ file }, fileList) => {
      const { appService } = window

      appService.addImage(file.name, file.fileInstance).then(() => {
        this.reloadImages()
      })
    }
    return (
      <Tabs tabPosition='left' type='button'>
        <TabPane
          tab={
            <span>
              <IconFile />
              图片
            </span>
        }
          itemKey='file'
        >
          <div>
            <Upload accept='image/*' multiple beforeUpload={beforeUpload}>
              <Button icon={<IconUpload />} theme='light'>
                点击上传
              </Button>
            </Upload>
            <ImagePreview
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
          </div>
        </TabPane>
        <TabPane
          tab={
            <span>
              <IconFile />
              音频
            </span>
        }
          itemKey='audio'
        >
          <div />
        </TabPane>
        <TabPane
          tab={
            <span>
              <IconFile />
              视频
            </span>
        }
          itemKey='video'
        >
          <div />
        </TabPane>
        <TabPane
          tab={
            <span>
              <IconFile />
              其他文件
            </span>
        }
          itemKey='other'
        >
          <div />
        </TabPane>
      </Tabs>
    )
  }
}
