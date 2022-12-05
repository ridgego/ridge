import React, { useState } from 'react'
import { IconDelete, IconEdit } from '@douyinfe/semi-icons'
import { withField, Button, Select, TextArea, Space, Input, useFieldState } from '@douyinfe/semi-ui'

export const variableOptionList = withField((props) => {
  const fieldState = useFieldState(props.id)
  const onValueChange = (values, changed) => {
    props.onChange(values)
  }
  return (
    <ArrayField noLabel field={props.id} initValue={value} onValueChange={onValueChange}>
      {({ add, arrayFields, addWithInitValue, ...args }) => (
        <>
          <Button onClick={() => addWithInitValue({
              name: '',
              type: 'string'
            })}
            >添加
            </Button>
          {arrayFields.map(({ field, key, remove }, i) => {
              return (
                <div key={key} style={{ width: 300, display: 'flex' }}>
                  <Form.Input
                    noLabel
                    style={{ width: '115px' }}
                    field={`${field}[name]`}
                  />
                  <Form.Select
                    noLabel
                    style={{ margin: '0 4px' }}
                    field={`${field}[type]`}
                  >
                    <Form.Select.Option value='number'>数字</Form.Select.Option>
                    <Form.Select.Option value='string'>字符</Form.Select.Option>
                    <Form.Select.Option value='boolean'>布尔</Form.Select.Option>
                    <Form.Select.Option value='object'>对象</Form.Select.Option>
                    <Form.Select.Option value='array'>列表</Form.Select.Option>
                  </Form.Select>
                  {fieldState.value && fieldState.value[i] && fieldState.value[i].type}
                </div>

              )
            })}
        </>
      )}
    </ArrayField>
  )
}, { })
