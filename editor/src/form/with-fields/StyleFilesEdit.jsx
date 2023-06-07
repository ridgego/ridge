import React, { useState, useEffect } from 'react'
import { withField, Select } from '@douyinfe/semi-ui'
import { appService } from '../../service/RidgeEditService'
import { filterTree } from '../../panels/files/buildFileTree'

const StyleFilesEdit = ({
  value,
  options,
  onChange
}) => {
  const [styleFiles, setStyleFiles] = useState([])
  useEffect(async () => {
    const cssFiles = await appService.getByMimeType('text/css')

    console.log(cssFiles)

    appService.treeChange(async treeData => {
      const styleFiles = filterTree(treeData, node => node.mimeType === 'text/css')
      console.log('styleFiles', styleFiles)
      setStyleFiles(styleFiles.map(file => {
        return {
          value: file.path,
          label: file.label
        }
      }))
    })
  })

  return (
    <>
      <Select multiple style={{ width: '320px' }} defaultValue={['abc', 'ulikecam']}>
        <Select.Option value='abc'>抖音</Select.Option>
        <Select.Option value='ulikecam'>轻颜相机</Select.Option>
        <Select.Option value='jianying'>剪映</Select.Option>
        <Select.Option value='xigua'>西瓜视频</Select.Option>
      </Select>
    </>
  // <Select multiple>
  //   <Select.Option value='abc'>抖音</Select.Option>
  //   <Select.Option value='ulikecam'>轻颜相机</Select.Option>
  //   {/* <Select.Option value='1'>zagfdafd</Select.Option>
  //   <Select.Option value='2'>zag2333fdafd</Select.Option> */}
  //   {/* {styleFiles.map((styleFile, index) => {
  //     return <Select.Option key={styleFile.key} value={index}>123</Select.Option>
  //   })} */}
  // </Select>
  )
}

export default withField(StyleFilesEdit)
