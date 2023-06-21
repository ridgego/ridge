import React, { useState, useEffect } from 'react'
import { Select, withField } from '@douyinfe/semi-ui'
import { ridge } from '../../service/RidgeEditService'

const ClassEdit = ({
  value,
  onChange
}) => {
  const [classNames, setClassNames] = useState([])

  useEffect(() => {
    setClassNames(ridge.pageElementManager.classNames.map(c => {
      return {
        label: c.label,
        value: c.className
      }
    }))
  })

  return (
    <Select multiple value={value} onChange={onChange}>
      {classNames.map(clz => <Select.Option value={clz.value} key={clz.value}>{clz.label}</Select.Option>)}
    </Select>
  )
}

export default withField(ClassEdit)
