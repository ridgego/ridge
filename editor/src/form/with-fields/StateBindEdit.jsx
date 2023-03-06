import React, { useState } from 'react'
import { IconChainStroked } from '@douyinfe/semi-icons'
import { withField, Popover, Button, Space, Tree } from '@douyinfe/semi-ui'

const StateBindEdit = withField(({
  value,
  options,
  onChange
}) => {
  const { scopeStates, pageStates, appStates } = options
  const [visible, setVisible] = useState()

  const renderSelectState = () => {
    if (!pageStates) {
      console.log('Where is pageState', value, options)
    }
    const treeData = []
    const pageStateTree = {
      label: '页面状态',
      key: 'pageState',
      disabled: true,
      children: pageStates.map(state => ({
        label: state.label,
        key: state.name,
        value: state.name
      }))
    }
    treeData.push(pageStateTree)

    return (
      <div style={{ width: '320px', padding: '0', height: '360px', overflow: 'overlay' }}>
        <Tree
          style={{
            height: 320
          }}
          value={value}
          filterTreeNode
          expandAll
          treeData={treeData}
          onChange={onChange}
        />
        <Space>
          <Button onClick={() => {
            setVisible(false)
          }}
          >关闭
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
      }}
    >
      <div
        style={{
          height: 24,
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
