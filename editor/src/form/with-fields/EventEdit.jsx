import React from 'react'
import { IconDelete, IconEdit, IconPlus } from '@douyinfe/semi-icons'
import { withField, Button, Select, Input } from '@douyinfe/semi-ui'
import PopUpCodeEdit from '../../utils/PopUpCodeEdit.jsx'

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
      value: ''
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

  const variableOptionList = options.pageVariables.map(v => {
    return {
      label: v.name,
      value: v.name
    }
  })

  const InputAddon = ({ index, value }) => {
    return (
      <PopUpCodeEdit
        completion={{
          variables: options.pageVariables,
          methods: [{
            label: 'Math.floor',
            type: 'method'
          }]
        }}
        msg='请输入取值表达式'
        type='js' value={value} onChange={val => {
          actionChange('value', val, index)
        }}
      >
        <IconEdit className='action-edit' style={{ cursor: 'pointer' }} />
      </PopUpCodeEdit>
    )
  }

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
                <Option value='setState'>设置状态</Option>
                <Option value='doReduce'>调用函数</Option>
              </Select>
            </div>
            {action.name === 'setvar' &&
              <>
                <div className='action-field'>
                  <div className='action-label'>目标</div>
                  <Input size='small' value={action.target} onChange={(value) => actionChange('target', value, index)} />
                </div>
                <div className='action-field'>
                  <div className='action-label'>取值</div>
                  <Input
                    size='small'
                    value={action.value}
                    addonAfter={<InputAddon index={index} value={action.value} />}
                    onChange={value => actionChange('value', value, index)}
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
