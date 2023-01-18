import React, { useState } from 'react'
import * as SEMI_ICONS from '@douyinfe/semi-icons'
import { withField, TextArea, RadioGroup, Radio } from '@douyinfe/semi-ui'

const RadioGroupEdit = withField(({
  value,
  options,
  onChange
}) => {
  return (
    <RadioGroup type='button' buttonSize='small' value={value}>
      {options &&
      options.map(option => {
        const Icon = SEMI_ICONS[option.icon]
        return <Radio key={option.value} value={option.value}><Icon rotate={option.rotate || 0} /></Radio>
      })}
    </RadioGroup>
  )
})

export default RadioGroupEdit
