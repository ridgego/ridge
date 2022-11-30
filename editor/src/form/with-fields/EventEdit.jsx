import React, { useState } from 'react'
import { IconDelete, IconEdit } from '@douyinfe/semi-icons'
import { withField, Button, Select, TextArea, Space, Input } from '@douyinfe/semi-ui'

const EventEdit = withField(({
  value,
  options,
  onChange
}) => {
  const { Option } = Select
  const actions = value || []
  // const [actions, setActions] = useState(value || [])
  const addEventHandler = () => {
    const newActions = actions.concat({
      name: 'setvar',
      target: '',
      expr: ''
    })
    // setActions(newActions)
    onChange(newActions)
  }

  const actionChange = (key, val, i) => {
    const newActions = actions.map((action, index) => {
      if (index === i) {
        action[key] = val
      }
      return action
    })
    // setActions(newActions)
    onChange(newActions)
  }

  const removeAction = (index) => {
    actions.splice(index - 1, 1)
    onChange(actions)
  }

  const openEditCode = (value, index) => {
    const { Ridge } = window

    Ridge && Ridge.openCodeEditor &&
    Ridge.openCodeEditor({
      lang: 'js',
      code: value,
      completed: (newCode) => {
        actionChange('value', newCode, index)
      }
    })
  }

  const variableOptionList = options.pageVariables.map(v => {
    return {
      label: v.name,
      value: v.name
    }
  })

  console.log('actions', actions)
  return (
    <div>
      {actions.map((action, index) => {
        return (
          <div key={index} className='event-action-config'>
            <Space style={{ marginTop: '4px', marginBottom: '4px' }}>
              <span>{index + 1}.</span>
              <Select value={action.name} size='small' onChange={(value) => actionChange('name', value, index)}>
                <Option value='setvar'>设置页面变量</Option>
                <Option value='setglobal'>设置全局变量</Option>
              </Select>
              {action.name === 'setvar' &&
                <Select
                  allowCreate size='small'
                  style={{ width: 120 }}
                  filter
                  optionList={variableOptionList}
                  value={action.target}
                  onChange={(value) => actionChange('target', value, index)}
                />}
              {action.name === 'setglobal' && <Select />}
            </Space>
            <Space>
              <Input
                size='small'
                value={action.value} onChange={value => {
                  actionChange('value', value, index)
                }}
              />
              <Button
                size='small'
                type='tertiary'
                icon={<IconDelete />} onClick={() => {
                  removeAction(index)
                }}
              />
              <Button
                size='small'
                type='tertiary'
                icon={<IconEdit />} onClick={() => openEditCode(action.value, index)}
              />
            </Space>
          </div>
        )
      })}
      <Button size='small' onClick={addEventHandler}>增加</Button>
    </div>
  )
})

export default EventEdit
