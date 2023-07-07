import React, { useState } from 'react'
import { IconPlusCircle, IconMinusCircle } from '@douyinfe/semi-icons'
import { InputNumber, withField, Select, InputGroup } from '@douyinfe/semi-ui'

/**
 * 支持对html长度进行编辑 类似  10px  3.2em  90%  12.3rem等
 * em/px/rem/%/vh/vw
 * @param {*} param0
 */
const LengthEdit = ({
  value,
  onChange
}) => {
  const [num, unit] = (value || '100px').match(/[0-9.]+|em|pt|px/g)

  return (
    <InputGroup size='small'>
      <InputNumber
        value={num} style={{ width: 80 }} onChange={val => {
          onChange(val + unit)
        }}
      />
      <Select
        style={{ width: '100px' }} value={unit}
        onChange={val => {
          onChange(num + val)
        }}
      >
        <Select.Option value='px'>像素</Select.Option>
        <Select.Option value='%'>父级百分比</Select.Option>
        <Select.Option value='em'>相比当前字体</Select.Option>
        <Select.Option value='rem'>相比根字体</Select.Option>
        <Select.Option value='vh'>页面高度</Select.Option>
        <Select.Option value='vw'>页面宽度</Select.Option>
      </Select>
    </InputGroup>
  )
}

export default withField(LengthEdit)
