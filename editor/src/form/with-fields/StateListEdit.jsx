import React, { useState } from 'react'
import { withField, Button, Input, List } from '@douyinfe/semi-ui'

const StateListEdit = ({
  value,
  onChange
}) => {
  const [currentEditIndex, setCurrentEditIndex] = useState(-1)
  const [currentStateName, setCurrentStateName] = useState('')
  const [stateEditValid, setStateEditValid] = useState(true)

  const stateValue = value || { current: '', list: [] }

  const { current, list } = stateValue

  const addState = () => {
    let name = 'State'

    let index = 1
    while (list.indexOf(name) > -1) {
      name = 'State' + index
      index++
    }

    onChange({ current, list: [...list, name] })
    setCurrentStateName(name)
    setCurrentEditIndex(list.length)
  }

  const removeState = index => {
    list.splice(index, 1)
    onChange({ current, list })
    setCurrentEditIndex(-1)
  }

  const editState = index => {
    setCurrentEditIndex(index)
    setCurrentStateName(list[index])
  }

  const checkStateNameValid = (name) => {
    if (name.trim() === '') {
      setStateEditValid(false)
    } else if (list.filter((v, index) => index !== currentEditIndex).indexOf(name) === -1) {
      setStateEditValid(true)
    } else {
      setStateEditValid(false)
    }
  }

  const confirmState = () => {
    if (list.filter((v, index) => index !== currentEditIndex).indexOf(currentStateName) === -1) {
      list[currentEditIndex] = currentStateName
      setCurrentEditIndex(-1)
      setCurrentStateName('')
      onChange({ current, list })
    } else {
      // dup
    }
  }

  const setCurrentState = (index) => {
    onChange({ current: list[index], list })
  }
  return (
    <div className='state-list-edit'>
      <List
        className='state-list'
        dataSource={list}
        split
        size='small'
        renderItem={(item, index) => {
          if (index === currentEditIndex) {
            return (
              <div style={{ display: 'flex', height: '32px', alignItems: 'center' }} className='list-item'>
                <div style={{ flex: 1 }}>
                  <Input
                    validateStatus={stateEditValid ? '' : 'error'}
                    value={currentStateName} size='small' onChange={val => {
                      setCurrentStateName(val)
                      checkStateNameValid(val)
                    }}
                  />
                </div>
                <Button disabled={!stateEditValid} type='danger' size='small' theme='borderless' icon={<i class='bi bi-check-lg' />} onClick={() => confirmState(item)} style={{ marginRight: 4 }} />
              </div>
            )
          } else {
            return (
              <div
                className={'list-item' + (current === item ? ' is-current' : '')} onClick={() => {
                  setCurrentState(index)
                }}
              >
                <div className='state-name' style={{ flex: 1 }}>{item}</div>
                <Button type='danger' theme='borderless' icon={<i class='bi bi-pencil' />} onClick={() => editState(index)} style={{ marginRight: 4 }} />
                <Button theme='borderless' icon={<i class='bi bi-trash' />} onClick={() => removeState(index)} style={{ marginRight: 4 }} />
              </div>
            )
          }
        }}
      />
      <div style={{ margin: 4, fontSize: 14 }} onClick={() => addState()}>
        <Button size='small' theme='borderless' icon={<i class='bi bi-plus-lg' />} style={{ marginRight: 4, color: 'var(--semi-color-info)' }} />
      </div>
    </div>
  )
}

export default withField(StateListEdit)
