import React, { useState } from 'react'
import { IconDelete, IconEdit, IconPlus, IconTick } from '@douyinfe/semi-icons'
import { withField, Button, Space, Form, Tree, Typography, Select } from '@douyinfe/semi-ui'
const { Text } = Typography
const { Option } = Select

const ACTION_OPTIONS = [{
  label: '设置状态',
  value: 'setState'
}, {
  label: '调用函数',
  value: 'doReduce'
}]

const EventEdit = withField(({
  value,
  options,
  onChange
}) => {
  const formRef = React.createRef()
  const [visible, setVisible] = useState(false)

  const [actionIndexList, setActionIndexList] = useState([])
  const actions = value || []
  const {
    pageReducers,
    appStates,
    pageStates
  } = options
  // const [actions, setActions] = useState(value || [])

  const getTreeData = () => {
    const tree = [{
      label: options.label,
      key: 'action-root',
      root: true,
      disabled: true,
      children: [...actions.map((action, index) => {
        const leafData = {}
        leafData.key = 'node-' + index
        leafData.index = index
        leafData.method = action.method
        leafData.label = getActionLabel(action)
        return leafData
      })]
    }]
    return tree
  }

  const getActionLabel = (action) => {
    const [target, method] = (action.method || '.').split('.')

    if (target === 'page') {
      const targetReducer = pageReducers.filter(reducer => reducer.name === method)[0]
      if (targetReducer) {
        return targetReducer.label
      } else {
        return '页面方法不存在'
      }
    }
    return action.method
  }

  const renderTreeLabel = (label, data) => {
    return (
      <div className='tree-label'>
        {data.root &&
          <>
            <Text className='label-content'>{label}</Text>
            <Space className='label-action'>
              <Button
                size='small' theme='borderless' type='tertiary' onClick={addAction} icon={<IconPlus />}
              >处理函数
              </Button>
            </Space>
          </>}
        {!data.root && actionIndexList.indexOf(data.index) > -1 && renderActionEdit(data)}
        {!data.root && actionIndexList.indexOf(data.index) === -1 && renderActionNode(data)}
      </div>
    )
  }

  const renderActionEdit = (data) => {
    return (
      <>
        <div className='label-content'>
          <Select
            noLabel defaultValue={data.method} placeholder='请选择处理函数' size='small' onChange={val => {
              data.method = val
            }}
          >
            <Select.OptGroup label='页面函数'>
              {pageReducers && pageReducers.map(reducer => {
                return <Select.Option key={reducer.name} value={'page.' + reducer.name}>{reducer.label}</Select.Option>
              })}
            </Select.OptGroup>
          </Select>

        </div>
        <Space className='label-action'>
          <Button
            size='small' theme='borderless' type='tertiary' onClick={() => {
              confirmActionEdit(data)
            }} icon={<IconTick />}
          />
        </Space>
      </>
    )
  }

  const renderActionNode = (data) => {
    return (
      <>
        <Text className='label-content'>{data.label || '未配置函数'}</Text>
        <Space className='label-action'>
          <Button
            size='small' icon={<IconEdit />} theme='borderless' type='tertiary' onClick={() => {
              editAction(data.index)
            }}
          />
          <Button
            size='small' theme='borderless' type='tertiary' icon={<IconDelete />} onClick={() => {
              removeAction(data.index)
            }}
          />
        </Space>
      </>
    )
  }

  const addAction = () => {
    const newActions = [...actions, {
      method: ''
    }]
    setActionIndexList([...actionIndexList, newActions.length - 1])
    onChange(newActions)
  }

  // 增加新的动作
  const editAction = (index) => {
    setActionIndexList([...actionIndexList, index])
  }
  // 删除动作
  const removeAction = (index) => {
    onChange(actions.filter((a, i) => {
      if (i === index) {
        return false
      } else {
        return true
      }
    }))
  }

  const confirmActionEdit = data => {
    setActionIndexList(actionIndexList.filter(i => i !== data.index))
    onChange(actions.map((action, index) => {
      if (index === data.index) {
        return {
          method: data.method
        }
      } else {
        return action
      }
    }))
  }

  // 新增或保存动作
  const saveUpdateAction = () => {
    const action = formRef.current.formApi.getValues()

    if (actionIndex === -1) {
      onChange([...actions, action])
    } else {
      onChange(actions.map((a, i) => {
        if (i === actionIndex) {
          return action
        } else {
          return a
        }
      }))
    }
    setVisible(false)
  }

  const FormRender = ({ formState, formApi, values }) => {
    return (
      <>
        <Select field='name' label='动作'>
          {ACTION_OPTIONS.map(action => <Option key={action.value} value={action.value}>{action.label}</Option>)}
        </Select>
        {values.name === 'setState' &&
          <Select field='target' label='目标' placeholder='' filter style={{ width: 176 }}>
            {pageStates &&
              <Select.OptGroup label='页面状态'>
                {pageStates.map(state => <Select.Option key={state.name} value={state.name}>{state.label || state.name}</Select.Option>)}
              </Select.OptGroup>}
            {appStates &&
              <Select.OptGroup label='应用状态'>
                {pageStates.map(state => <Select.Option key={state.name} value={state.name}>{state.label || state.name}</Select.Option>)}
              </Select.OptGroup>}
          </Select>}
        {values.name === 'doReduce' &&
          <Select field='target' label='目标' placeholder='' filter style={{ width: 176 }}>
            {pageReducers &&
              <Select.OptGroup label='页面函数'>
                {pageReducers.map(reducer => <Select.Option key={reducer.name} value={reducer.name}>{reducer.label || reducer.name}</Select.Option>)}
              </Select.OptGroup>}
          </Select>}
        <Form.TextArea field='value' label='取值' />
      </>
    )
  }

  const treeData = getTreeData()

  return (
    <div className='event-edit'>
      <Tree
        className='event-tree'
        expandAll
        disabled
        renderLabel={renderTreeLabel}
        treeData={treeData}
      />
      {/* <Modal
        lazyRender={false}
        onCancel={() => {
          setVisible(false)
        }}
        onOk={saveUpdateAction}
        keepDOM
        title='组件事件处理'
        visible={visible}
      >
        <Form labelPosition='left' ref={formRef} render={FormRender} />
      </Modal> */}
      {/* <Collapse>
        <Collapse.Panel header={options.label} itemKey='label'> */}
      {/* <Table size='small' dataSource={actions} pagination={false}>
            <Column
              title='动作' dataIndex='name' key='name'
              render={text => ACTION_OPTIONS.filter(a => a.value === text)[0]?.label}
            />
            <Column
              title='目标' dataIndex='target' width={100} key='label'
              render={(text, record) => {
                if (record.name === 'setState') {
                  const state = pageStates.filter(s => s.name === text)[0]
                  return state ? state.label : text
                } else if (record.name === 'doReduce') {
                  const reducer = pageReducers.filter(r => r.name === text)[0]
                  return reducer ? reducer.label : text
                }
              }}
            />
            <Column
              width={64}
              title='-' dataIndex='operate' key='operate'
              render={(text, record, index) => {
                return (
                  <>
                    <Button size='small' theme='borderless' icon={<IconEdit />} onClick={() => editAction(record, index)} />
                    <Button size='small' theme='borderless' type='danger' icon={<IconDelete />} onClick={() => removeAction(index)} />
                  </>
                )
              }}
            />
          </Table> */}
      {/* <Button
            size='small' icon={<IconPlus />} onClick={() => {
              editAction(null, -1)
            }}
          >增加
          </Button>
        </Collapse.Panel>
      </Collapse> */}
    </div>
  )
})

export default EventEdit
