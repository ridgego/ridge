import React, { useState } from 'react'
import { IconDelete, IconEdit, IconPlus, IconTick, IconBrackets } from '@douyinfe/semi-icons'
import { withField, Button, Space, Form, TextArea, Tree, Popover, Typography, Select, Tag } from '@douyinfe/semi-ui'
import context from '../../service/RidgeEditorContext'
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
  const [payloadValue, setPayloadValue] = useState('')
  const [actionIndexList, setActionIndexList] = useState([])

  const actions = value || []

  const getTreeData = () => {
    const tree = [{
      label: options.label,
      key: 'action-root',
      root: true,
      disabled: true,
      children: [...actions.map((action, index) => {
        const node = {}
        node.key = 'node-' + index
        node.index = index
        node.store = action.store
        node.method = action.method
        node.payload = action.payload || ''
        node.label = getActionLabel(action)
        return node
      })]
    }]
    return tree
  }

  const getActionLabel = (action) => {
    if (context.editorComposite == null) {
      return action.method
    }
    const {
      storeName,
      method
    } = action

    const storeTrees = context.editorComposite.getStoreModules()

    return storeTrees[storeName]?.actions.filter(ac => ac.name === method)[0]?.label ?? method
  }

  const renderTreeLabel = (label, data) => {
    return (
      <div className='tree-label'>
        {data.root &&
          <>
            <Text className='label-content'>
              <Tag color='green'>{label} </Tag>
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
    const storeModules = context.editorComposite.getStoreModules()
    return (
      <>
        <div className='label-content'>
          <Select
            noLabel defaultValue={data.store + '.' + data.method} placeholder='请选择处理动作' size='small' onChange={val => {
              const [store, method] = val.split('.')
              data.store = store
              data.method = method
            }}
          >
            {storeModules.map(({ label, name, actions }) => {
              return (
                <Select.OptGroup label={label ?? name} key={name}>
                  {actions.map(action => {
                    return <Select.Option key={action.name} value={name + '.' + action.name}>{action.label || action.name}</Select.Option>
                  })}
                </Select.OptGroup>
              )
            })}
          </Select>
          <Popover
            trigger='click'
            content={
              <div style={{ padding: 10 }}>
                <Text>请输入方法参数</Text>
                <TextArea
                  value={payloadValue} onChange={val => {
                    setPayloadValue(val)
                  }}
                />
                <Button
                  aria-label='确定' onClick={() => {
                    data.payload = payloadValue
                    confirmActionEdit(data)
                  }}
                >确定
                </Button>
              </div>
              }
          >
            <Button
              theme='borderless'
              type='primary'
              onClick={() => {
                setPayloadValue(data.payload)
              }}
              size='small'
              icon={<IconBrackets />}
            />
          </Popover>

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
        <Text className='label-content'>
          {data.label || '未配置动作'}
          {data.payload ? `(${data.payload})` : ''}
        </Text>

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
      store: '',
      method: '',
      payload: ''
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
          store: data.store,
          method: data.method,
          payload: data.payload
        }
      } else {
        return action
      }
    }))
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
