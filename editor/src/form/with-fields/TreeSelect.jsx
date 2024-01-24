import React, { useEffect, useState } from 'react'
import { withField, TreeSelect } from '@douyinfe/semi-ui'

const FieldTreeSelect = withField(({
  value, onChange, options
}) => {
  const [treeData, setTreeData] = useState([])

  useEffect(() => {
    if (options.treeData) {
      options.treeData().then(d => {
        setTreeData(d.default)
      })
    }
  }, [options])
  return (
    <TreeSelect
      style={{ width: 250 }}
      checkRelation='unRelated'
      multiple
      leafOnly
      value={value}
      onChange={onChange}
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
      treeData={treeData}
      placeholder='请选择'
    />
  )
})

export default FieldTreeSelect
