import React, { useState } from 'react'
import * as SEMI_ICONS from '@douyinfe/semi-icons'
import { withField, TextArea, RadioGroup, CheckboxGroup, Radio, Checkbox, Tooltip } from '@douyinfe/semi-ui'

const CheckBoxGroupEdit = withField(({
  value,
  optionList,
  selectAll,
  onChange
}) => {
  const indeterminate = value && optionList && value.length > 0 && (value.length < optionList.length)
  // const [indeterminate, setIndeterminate] = useState(value && optionList && value.length > 0 && (value.length < optionList.length))
  const [checkAll, setCheckall] = useState(false)
  const onCheckAllChange = (e) => {
    onChange(e.target.checked ? (optionList && optionList.map(op => op.value)) : [])
    setCheckall(e.target.checked)
  }
  return (
    <>
      {selectAll &&
        <div style={{ paddingBottom: 6, paddingLeft: 4, borderBottom: '1px solid var(--semi-color-border)' }}>
          <Checkbox
            indeterminate={indeterminate}
            onChange={onCheckAllChange}
            checked={checkAll}
            aria-label='Checkbox 示例'
          >
            全选
          </Checkbox>
        </div>}
      <CheckboxGroup
        direction='horizontal'
        type={(optionList && optionList[0] && optionList[0].icon) ? 'pureCard' : 'card'} buttonSize='small' value={value} onChange={value => {
          onChange(value)
        }}
      >
        {optionList &&
      optionList.map(option => {
        if (option.icon) {
          const Icon = SEMI_ICONS[option.icon]
          return (
            <Tooltip content={option.label} key={option.value}>
              <Checkbox value={option.value} aria-label={option.label}>
                <Icon rotate={option.rotate || 0} />
              </Checkbox>
            </Tooltip>
          )
        } else if (option.label) {
          return (
            <Checkbox key={option.value} value={option.value}>{option.label}</Checkbox>
          )
        } else {
          return <Checkbox key={option.value} value={option.value} />
        }
      })}
      </CheckboxGroup>
    </>
  )
})

export default CheckBoxGroupEdit
