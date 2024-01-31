import React, { useState } from 'react'
import { IconChainStroked } from '@douyinfe/semi-icons'
import { isPlainObject } from 'lodash'
import context from '../../service/RidgeEditorContext'
import { withField, Popover, Button, Space, Tree } from '@douyinfe/semi-ui'

const StateBindEdit = withField(({
  value,
  onChange
}) => {
  const [storeTreeData, setStoreTreeData] = useState([])
  const [visible, setVisible] = useState()

  const buildStateBindTree = (key, value, keyPrefix) => {
    const tree = {
      key: keyPrefix + key,
      label: context.getLocaleText(key)
    }

    if (isPlainObject(value)) {
      tree.children = []

      for (const k in value) {
        tree.children.push(buildStateBindTree(k, value[k], keyPrefix + key + '.'))
      }
    }
    return tree
  }

  const updateStateTree = () => {
    const storeModules = context.editorComposite.getStoreModules()
    const treeData = []

    for (const storeModule of storeModules) {
      const storeNode = {
        key: storeModule.name,
        label: storeModule.label ?? storeModule.name,
        children: []
      }

      for (const state of storeModule.states) {
        storeNode.children.push(buildStateBindTree(state.name, state.value, storeModule.name + '.state.'))
      }
      for (const scope of storeModule.computed) {
        storeNode.children.push({
          key: storeModule.name + '.computed.' + scope.name,
          label: scope.label ?? scope.name
        })
      }
      treeData.push(storeNode)
    }
    setStoreTreeData(treeData)
  }
  const renderSelectState = () => {
    return (
      <div style={{ width: '320px', padding: '0', height: '360px', overflow: 'overlay' }}>
        <Tree
          style={{
            height: 320
          }}
          value={value}
          filterTreeNode
          expandAll
          treeData={storeTreeData}
          onSelect={val => {
            if (value === val) {
              onChange(null)
            }
          }}
          onChange={val => {
            onChange(val)
          }}
        />
        <Space>
          <Button
            theme='solid' onClick={() => {
              setVisible(false)
            }}
          >确定
          </Button>
          <Button
            theme='solid' type='secondary' onClick={() => {
              onChange(null)
              setVisible(false)
            }}
          >取消连接
          </Button>
        </Space>
      </div>
    )
  }

  return (
    <Popover
      content={renderSelectState} trigger='click' showArrow visible={visible} onVisibleChange={visible => {
        setVisible(visible)
        updateStateTree()
      }}
    >
      <div
        style={{
          height: 26,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Button
          className='btn-code'
          placeholder='连接数据'
          type={value ? 'primary' : 'tertiary'}
          size='small'
          theme='borderless'
          onClick={() => {
            setVisible(!visible)
          }}
          icon={<IconChainStroked style={{ margin: '0 2px', flexShrink: 0 }} />}
        />
      </div>
    </Popover>
  )
})

export default StateBindEdit
