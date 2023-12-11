import React from 'react'
import { withField } from '@douyinfe/semi-ui'
import { RidgeReact } from 'ridge'

export const PropertiesEdit = ({
  page,
  value,
  onChange
}) => {
  return (
    <RidgeReact value={value} onChange={onChange} app='ridge-editor-components' page={page} />
  )
}

export default withField(PropertiesEdit)
