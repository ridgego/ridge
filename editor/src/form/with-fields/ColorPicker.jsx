import React from 'react'
import { HexColorPicker } from 'react-colorful'
import { withField, Button, Popover, Input } from '@douyinfe/semi-ui'

const BorderEdit = withField((props) => {
  return (
    <Popover content={
      <>
        <HexColorPicker
          color={props.value} onChange={value => {
            props.onChange(value)
          }}
        />
        <Input
          size='small' value={props.value} onChange={value => {
            props.onChange(value)
          }}
        />
      </>
    }
    >
      <Button
        size='small' style={{
          backgroundColor: props.value
        }}
      />
    </Popover>
  )
})

export default BorderEdit
