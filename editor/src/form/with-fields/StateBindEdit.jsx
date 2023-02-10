import React, { useState } from 'react'
import { IconCode, IconChainStroked } from '@douyinfe/semi-icons'
import { withField, Popover, Tree, Button } from '@douyinfe/semi-ui'

const StateBindEdit = withField(({
  value,
  options,
  onChange
}) => {
  const [visible, setVisible] = useState(false)
  const { pageStates } = options

  const treeData = [{
    label: '页面状态',
    value: 'pageState',
    key: 'pageState',
    children: pageStates.map(state => {
      return {
        label: state.label || state.name,
        value: state.name,
        key: state.name
      }
    })
  }, {
    label: '应用状态',
    value: 'appState',
    key: 'appState'
  }]

  const renderSelectState = () => {
    return (
      <div style={{ width: '240px', height: '360px', overflow: 'overlay' }}>
        <div>
          设置属性数据跟随状态变化
          <Button
            size='small' style={{
              margin: '5px 10px 0 10px'
            }} onClick={() => {
              onChange(null)
            }}
          >取消
          </Button>
        </div>
        <Tree
          expandAll
          filterTreeNode
          value={value}
          treeData={treeData}
          onChange={value => {
            onChange(value)
          }}
        />
      </div>
    )
  }

  return (
    <Popover content={renderSelectState} trigger='click'>
      <div
        style={{
          height: 24,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Button
          onClick={() => {
            setVisible(true)
          }}
          className='btn-code'
          placeholder='绑定表达式'
          type={value ? 'primary' : 'tertiary'}
          size='small'
          theme='borderless'
          icon={<IconChainStroked style={{ margin: '0 2px', flexShrink: 0 }} />}
        />

      </div>
    </Popover>
  )
})

export default StateBindEdit
