import React, { useState } from 'react'
import { withField, Button, Input, List } from '@douyinfe/semi-ui'

const StateListEdit = ({
  value,
  onChange
}) => {
  const [currentEditIndex, setCurrentEditIndex] = useState(-1)
  const [currentStateName, setCurrentStateName] = useState('')

  const addState = () => {
    let name = 'State'

    let index = 1
    while (value.indexOf(name) > -1) {
      name = 'State' + index
      index++
    }

    setCurrentStateName(name)
    onChange([...value, name])
    setCurrentEditIndex(value.length)
  }

  const removeState = state => {
    onChange(value.filter(v => v !== state))
    setCurrentEditIndex(-1)
  }

  const editState = state => {
    setCurrentEditIndex(value.indexOf(state))
  }

  const confirmState = () => {
    if (value.filter((v, index) => index !== currentEditIndex).indexOf(currentStateName) === -1) {
      value[currentEditIndex] = currentStateName
      setCurrentEditIndex(-1)
      setCurrentStateName('')
      onChange(value)
    } else {
      // dup
    }
  }
  return (
    <>
      <List
        className='state-list'
        dataSource={value}
        split
        size='small'
        style={{ flexBasis: '100%', flexShrink: 0, borderBottom: '1px solid var(--semi-color-border)' }}
        renderItem={(item, index) => {
          if (index === currentEditIndex) {
            return (
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1 }}>
                  <Input
                    value={currentStateName} size='small' onChange={val => {
                      setCurrentStateName(val)
                    }}
                  />
                </div>
                <Button type='danger' size='small' theme='borderless' icon={<i class='bi bi-check-lg' />} onClick={() => confirmState(item)} style={{ marginRight: 4 }} />
              </div>
            )
          } else {
            return (
              <div style={{ display: 'flex' }} className='list-item'>
                <div style={{ flex: 1 }}>{item}</div>
                <Button type='danger' theme='borderless' icon={<i class='bi bi-pencil' />} onClick={() => editState(item)} style={{ marginRight: 4 }} />
                <Button theme='borderless' icon={<i class='bi bi-x-lg' />} onClick={() => removeState(item)} style={{ marginRight: 4 }} />
              </div>
            )
          }
        }}
      />
      <div style={{ margin: 4, fontSize: 14 }} onClick={() => addState()}>
        <Button size='small' theme='borderless' icon={<i class='bi bi-plus-lg' />} style={{ marginRight: 4, color: 'var(--semi-color-info)' }}>新增</Button>
      </div>
    </>
  )
}

export default withField(StateListEdit)
