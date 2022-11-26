import React, { useState } from 'react'
import { IconCode } from '@douyinfe/semi-icons'
import { withField, Button, Popover, TextArea } from '@douyinfe/semi-ui'

const CodeExprEdit = withField(props => {
  const [open, setOpen] = useState(false)
  const popVisibleChange = visible => {
    setOpen(visible)
  }
  const exprChange = value => {
    props && props.onChange(value)
  }
  return (
    <Popover
      position='leftTop'
      onVisibleChange={popVisibleChange}
      showArrow
      trigger='click'
      content={
        <article style={{ padding: 8, width: 360 }}>
          <span> 请输入表达式 </span>
          <TextArea value={props.value} onChange={exprChange} />
        </article>
      }
    >
      {props.value && <Button type='primary' size='small' theme='borderless' icon={<IconCode />} />}
      {!props.value && <Button className={open ? 'is-open' : ''} type='tertiary' size='small' theme='borderless' icon={<IconCode />} />}
    </Popover>
  )
})

export default CodeExprEdit
