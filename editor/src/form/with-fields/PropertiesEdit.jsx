import React from 'react'
import { withField } from '@douyinfe/semi-ui'
import { RidgeReact } from 'ridge-runtime'

export const PropertiesEdit = ({
  page,
  value,
  onChange
}) => {
  return (
    <RidgeReact
      app='ridge-editor-components' page={page}
      value={value} input={val => {
        onChange(val)
      }}
    />
  )
}

export default withField(PropertiesEdit)
