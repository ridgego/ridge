import React, { useEffect, useState } from 'react'
import { withField, TreeSelect } from '@douyinfe/semi-ui'

import { getClassTreeData } from './external'

const ClassSelect = withField(({
  value, onChange
}) => {
  return (
    <TreeSelect
      size='small'
      style={{ width: 250 }}
      checkRelation='unRelated'
      multiple
      leafOnly
      value={value}
      onChange={onChange}
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
      treeData={getClassTreeData()}
      placeholder='请选择'
    />
  )
})

export default ClassSelect
