import React, { useState } from 'react'
import { IconDelete, IconEdit, IconPlus, IconTick } from '@douyinfe/semi-icons'
import { withField, Button, Space, Form, Tree, Typography, Select, Tag } from '@douyinfe/semi-ui'
import { ridge } from '../../service/RidgeEditService'
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

    const storeTrees = ridge.pageElementManager.getStoreTrees()

    if (storeTrees[target] && storeTrees[target].actions) {
      const action = storeTrees[target].actions.filter(ac => ac.key === method)[0]
      if (action) {
        return action.label
      } else {
        return ''
      }
    }
    return action.method
  }

  const renderTreeLabel = (label, data) => {
    return (
      <div className='tree-label'>
        {data.root &&
          <>
            <Text className='label-content'>{label}
              <Tag color='green'>事件 </Tag>
            </Text>
            <Space className='action'>
              <Button
                size='small' theme='borderless' type='tertiary' onClick={addAction} icon={<IconPlus />}
              >处理动作
              </Button>
            </Space>
          </>}
        {!data.root && actionIndexList.indexOf(data.index) > -1 && renderActionEdit(data)}
        {!data.root && actionIndexList.indexOf(data.index) === -1 && renderActionNode(data)}
      </div>
    )
  }

  const renderActionEdit = (data) => {
    const storeTrees = ridge.pageElementManager.getStoreTrees()
    return (
      <>
        <div className='label-content'>
          <Select
            noLabel defaultValue={data.method} placeholder='请选择处理动作' size='small' onChange={val => {
              data.method = val
            }}
          >
            {Object.entries(storeTrees).map(([storeName, tree]) => {
              return (
                <Select.OptGroup label={storeName} key={storeName}>
                  {tree.actions.map(action => {
                    return <Select.Option key={action.key} value={storeName + '.' + action.key}>{action.label}</Select.Option>
                  })}
                </Select.OptGroup>
              )
            })}
          </Select>

        </div>
        <Space className='action'>
          <Button
            size='small' onClick={() => {
              confirmActionEdit(data)
            }} icon={<IconTick />}
          >确定
          </Button>
        </Space>
      </>
    )
  }

  const renderActionNode = (data) => {
    return (
      <>
        <Text className='label-content'>{data.label || '未配置动作'}</Text>
        <Space className='action'>
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
    </div>
  )
})

export default EventEdit
