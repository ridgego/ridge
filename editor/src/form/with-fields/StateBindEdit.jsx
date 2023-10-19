import React, { useState } from 'react'
import { IconChainStroked } from '@douyinfe/semi-icons'
import ridgeEditService from '../../service/RidgeEditorService'
import { withField, Popover, Button, Space, Tree } from '@douyinfe/semi-ui'

const StateBindEdit = withField(({
  value,
  onChange
}) => {
  const [storeTreeData, setStoreTreeData] = useState([])
  const [visible, setVisible] = useState()

  const updateStateTree = () => {
    const treeData = []
    const storeTrees = ridge.pageElementManager.getStoreTrees()
    Object.keys(storeTrees).forEach(storeName => {
      treeData.push({
        key: storeName,
        label: storeName,
        disabled: true,
        value: storeName,
        children: storeTrees[storeName].states
      })
    })
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
