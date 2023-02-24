import React, { useState } from 'react'
import { IconCode, IconChainStroked } from '@douyinfe/semi-icons'
import { withField, Popover, Select, Input, Button, Typography, Checkbox, Space, RadioGroup, Section } from '@douyinfe/semi-ui'

const { Title, Text } = Typography

const StateBindEdit = withField(({
  value,
  options,
  onChange
}) => {
  const { pageStates, appState } = options
  const [visible, setVisible] = useState()
  
  const renderSelectState = () => {
    return (
      <div style={{ width: '320px', padding: '0', height: '260px', overflow: 'overlay', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Title
          heading={6}
          style={{
            margin: '10px 0'
          }}
        >设置实时值
        </Title>
        <Text
          style={{
            margin: '10px 0'
          }}
          type='success'
        >状态值改变后，组件会跟随变化
        </Text>
        <Select
          style={{ width: '240px' }}
          value={value}
          label='来自状态'
          onChange={onChange}
          showClear
          multiple={false}
        >
          <Select.OptGroup label='页面状态'>
            {pageStates && pageStates.map(state => <Select.Option value={state.name} key={state.name}>{state.label || state.name}</Select.Option>)}
          </Select.OptGroup>
          <Select.OptGroup label='应用状态'>
            {appState && appState.map(state => <Select.Option value={state.name} key={state.name}>{state.label || state.name}</Select.Option>)}
          </Select.OptGroup>
        </Select>
        {/* <Checkbox checked={useExpression}>使用表达式</Checkbox> */}
        <Input
          value={value} onChange={val => {
            onChange(val)
          }}
        />
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
