import React from 'react'
import { IconDelete, IconEdit, IconPlus } from '@douyinfe/semi-icons'
import { withField, Button, Select, Input } from '@douyinfe/semi-ui'

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
    onChange(newActions)
  }

  const removeAction = (index) => {
    actions.splice(index, 1)
    onChange(JSON.parse(JSON.stringify(actions)))
  }

  const openEditCode = (value, index) => {
    const { Ridge } = window

    Ridge && Ridge.openCodeEditor &&
    Ridge.openCodeEditor({
      lang: 'js',
      code: value,
      completed: (newCode) => {
        actionChange('expr', newCode, index)
      }
    })
  }

  const variableOptionList = options.pageVariables.map(v => {
    return {
      label: v.name,
      value: v.name
    }
  })

  return (
    <div className='event-edit'>
      {actions.map((action, index) => {
        return (
          <div key={index} className='event-action-config'>
            <IconDelete
              className='action-delete' onClick={() => {
                removeAction(index)
              }}
            />
            <div className='action-field'>
              <div className='action-label'>
                动作
              </div>
              <Select label='动作' value={action.name} size='small' onChange={(value) => actionChange('name', value, index)}>
                <Option value='setvar'>设置页面变量</Option>
                <Option value='setglobal'>设置全局变量</Option>
              </Select>
            </div>
            {action.name === 'setvar' &&
              <>
                <div className='action-field'>
                  <div className='action-label'>目标</div>
                  <Select
                    size='small'
                    style={{ width: 120 }}
                    filter
                    optionList={variableOptionList}
                    value={action.target}
                    onChange={(value) => actionChange('target', value, index)}
                  />
                </div>
                <div className='action-field'>
                  <div className='action-label'>取值</div>
                  <Input
                    size='small'
                    value={action.expr}
                    addonAfter={<IconEdit onClick={() => openEditCode(action.value, index)} />}
                    onChange={value => actionChange('expr', value, index)}
                  />
                </div>
              </>}
            {action.name === 'setglobal' && <Select />}
          </div>
        )
      })}
      <Button size='small' className='action-add' icon={<IconPlus />} onClick={addEventHandler} />
    </div>
  )
})

export default EventEdit
