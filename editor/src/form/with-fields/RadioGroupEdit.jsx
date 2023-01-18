import React, { useState } from 'react'
import * as SEMI_ICONS from '@douyinfe/semi-icons'
import { withField, TextArea, RadioGroup, Radio } from '@douyinfe/semi-ui'

const RadioGroupEdit = withField(({
  value,
  options,
  onChange
}) => {
  return (
    <RadioGroup
      type='button' buttonSize='small' value={value} onChange={e => {
        onChange(e.target.value)
      }}
    >
      {options &&
      options.map(option => {
        if (option.icon) {
          const Icon = SEMI_ICONS[option.icon]
          return <Radio key={option.value} value={option.value}><Icon rotate={option.rotate || 0} /></Radio>
        } else if (option.label) {
          return (
            <Radio key={option.value} value={option.value}>
              <div style={{
                fontSize: '14px',
                ...option.style
              }}
              >{option.label}
              </div>
            </Radio>
          )
        } else {
          return <Radio key={option.value} value={option.value} />
        }
      })}
    </RadioGroup>
  )
})

export default RadioGroupEdit
