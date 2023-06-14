import React, { useState } from 'react'
import { IconChainStroked } from '@douyinfe/semi-icons'
import { ridge } from '../../service/RidgeEditService'
import { withField, Popover, Button, Space, Tree } from '@douyinfe/semi-ui'

const StateBindEdit = withField(({
  value,
  onChange
}) => {
  const [storeTreeData, setStoreTreeData] = useState([])
  const [visible, setVisible] = useState()

  const updateStateTree = () => {
    const storeTrees = ridge.pageElementManager.getStoreTrees()
    const treeData = []
    for (const [storeName, tree] of Object.entries(storeTrees)) {
      const storeTree = {
        label: storeName,
        key: storeName,
        disabled: true,
        children: tree.states.map(state => ({
          label: state.alias,
          key: state.key,
          value: storeName + '.' + state.key
        }))
      }
      treeData.push(storeTree)
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
          onChange={onChange}
        />
        <Space>
          <Button
            theme='solid' onClick={() => {
              setVisible(false)
            }}
          >确定
          </Button>
          <Button
            theme='solid' type='warn' onClick={() => {
              onChange(null)
              setVisible(false)
            }}
          >取消绑点
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
          placeholder='绑定表达式'
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
