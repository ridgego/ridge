import React, { useState } from 'react'
import { IconCode } from '@douyinfe/semi-icons'
import { withField, Button } from '@douyinfe/semi-ui'
import PopUpCodeEdit from '../../utils/PopUpCodeEdit.jsx'

const CodeExprEdit = withField(({
  value,
  options,
  onChange
}) => {
  const [open, setOpen] = useState(false)
  return (
    <PopUpCodeEdit
      type='js'
      completion={{
        variables: options.pageVariables,
        methods: [{
          label: 'Math.floor',
          type: 'method'
        }]
      }}
      msg='请输入取值表达式'
      value={value}
      onChange={onChange}
      toggleOpen={open => {
        setOpen(open)
      }}
    >
      {value && <Button className='btn-code' placeholder='绑定表达式' type='primary' size='small' theme='borderless' icon={<IconCode />} />}
      {!value && <Button className={open ? 'is-open btn-code' : 'btn-code'} type='tertiary' size='small' theme='borderless' icon={<IconCode />} />}
    </PopUpCodeEdit>
  )
})

export default CodeExprEdit
