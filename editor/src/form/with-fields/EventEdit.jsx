import React, { useState } from 'react'
import { IconDelete, IconEdit, IconPlus } from '@douyinfe/semi-icons'
import { withField, Button, Collapse, Table, Modal, Form, Tree, Typography } from '@douyinfe/semi-ui'
const { Text } = Typography
const { Select, Input } = Form
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
  const [actionIndex, setActionIndex] = useState(-1)
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
      children: [...actions.map((action, index) => {
        const leafData = {}
        leafData.key = action.target + '.' + action.method
        leafData.index = index
        if (action.target === 'page') {
          const targetReducer = pageReducers.filter(reducer => reducer.name === action.method)[0]
          if (targetReducer) {
            leafData.label = targetReducer.label
          } else {
            leafData.label = '页面方法不存在'
          }
        }
        return leafData
      }), {
        key: '__add',
        label: 'Add'
      }]
    }]
    return tree
  }

  const treeData = getTreeData()

  const renderTreeLabel = (label, data) => {
    return (
      <div className='node-label'>
        {data.key !== '__add' && <Text className='label-text'>{label}</Text>}
        {data.key === '__add' &&
          <Button
            size='small' theme='borderless' type='tertiary' onClick={() => {
            }} icon={<IconEdit>增加处理函数</IconEdit>}
          />}
      </div>
    )
  }

  // 增加新的动作
  const editAction = (action, index) => {
    setActionIndex(index)
    setVisible(true)

    if (action) {
      formRef.current.formApi.setValue('name', action.name)
      formRef.current.formApi.setValue('target', action.target)
      formRef.current.formApi.setValue('value', action.value)
    } else {
      formRef.current.formApi.setValue('name', 'setState')
      formRef.current.formApi.setValue('target', '')
      formRef.current.formApi.setValue('value', '')
    }
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

  return (
    <div className='event-edit'>
      <Tree
        className='event-tree'
        expandAll
        renderLabel={renderTreeLabel}
        treeData={treeData}
      />
      <Modal
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
      </Modal>
      <Collapse>
        <Collapse.Panel header={options.label} itemKey='label'>
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
          <Button
            size='small' icon={<IconPlus />} onClick={() => {
              editAction(null, -1)
            }}
          >增加
          </Button>
        </Collapse.Panel>
      </Collapse>
    </div>
  )
})

export default EventEdit
