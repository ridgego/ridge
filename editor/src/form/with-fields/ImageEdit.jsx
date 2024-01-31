import React from 'react'
import { withField, TreeSelect } from '@douyinfe/semi-ui'
import ridgeEditService from '../../service/RidgeEditorContext.js'

export const ImageEdit = ({
  value,
  onChange
}) => {
  const { appService } = ridgeEditService.services
  const treeData = appService.mapFileTree(node => {
    if (node.type === 'directory' || (node.mimeType && node.mimeType.indexOf('image') > -1)) {
      return {
        label: node.label,
        value: node.path,
        key: node.path
      }
    } else {
      return null
    }
  })

  const renderLabel = (label, data) => {
    return <div>{label}</div>
  }

  return (
    <TreeSelect
      size='small'
      onChange={val => {
        onChange(val)
      }}
      value={value}
      style={{ width: 180 }}
      dropdownStyle={{ maxHeight: 320, overflow: 'auto' }}
      renderLabel={renderLabel}
      treeData={treeData}
      placeholder='请选择'
    />
  )
}

export default withField(ImageEdit)
