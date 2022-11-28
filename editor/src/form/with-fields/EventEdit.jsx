import React, { useState } from 'react'
import { IconDelete } from '@douyinfe/semi-icons'
import { withField, Button, Select, TextArea, Space } from '@douyinfe/semi-ui'

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
    onChange(actions.splice(index, 1))
  }

  const variableOptionList = options.pageVariables.map(v => {
    return {
      label: v.name,
      value: v.name
    }
  })
  return (
    <div>
      {actions.map((action, index) => {
        return (
          <div key={index}>
            <Space style={{ marginTop: '4px', marginBottom: '4px' }}>
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
              <Button
                size='small'
                icon={<IconDelete />} onClick={() => {
                  removeAction(index)
                }}
              />
            </Space>
            <TextArea
              cols={3}
              value={action.value}
              onChange={(value) => actionChange('value', value, index)}
            />
          </div>
        )
      })}
      <Button size='small' onClick={addEventHandler}>增加</Button>
    </div>
  )
})

export default EventEdit
