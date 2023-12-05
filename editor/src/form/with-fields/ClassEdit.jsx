import React, { useState, useEffect } from 'react'
import { Select, withField } from '@douyinfe/semi-ui'
import context from '../../service/RidgeEditorContext'

const ClassEdit = ({
  value,
  onChange
}) => {
  const [classNames, setClassNames] = useState([])

  useEffect(() => {
    if (context.editorComposite) {
      setClassNames(context.editorComposite.getClassNames().map(c => {
        return {
          label: c.label,
          value: c.className
        }
      }))
    }
  }, [value])

  return (
    <Select size='small' multiple value={value} onChange={onChange}>
      {classNames.map(clz => <Select.Option value={clz.value} key={clz.value}>{clz.label}</Select.Option>)}
    </Select>
  )
}

export default withField(ClassEdit)
