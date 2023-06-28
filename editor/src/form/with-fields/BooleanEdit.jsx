import React from 'react'
import { Checkbox, Button, withField } from '@douyinfe/semi-ui'

const BooleanEdit = ({
  value,
  onChange,
  ...options
}) => {
  console.log('Bool')

  if (options.icon) {
    return (
      <Button
        icon={<i style={{ fontSize: 20 }} className={options.icon} />}
        size='small'
        type={value ? 'primary' : 'tertiary'}
        theme={value ? 'solid' : 'borderless'}
        onClick={() => {
          onChange(!value)
        }}
      />
    )
  } else if (options.toggle) {
    return <></>
  } else {
    return <Checkbox size='small' checked={value} onChange={() => onChange(!value)} />
  }
}

export default withField(BooleanEdit)
