import React from 'react'
import { Popover, Input, withField } from '@douyinfe/semi-ui'
import { IconDelete, IconEdit, IconChainStroked } from '@douyinfe/semi-icons'
import AppImageList from '../../panels/AppImageList.jsx'
const ImageEdit = withField((props) => {
  const AppList = () => {
    return (
      <div style={{
        width: '600px',
        height: '430px'
      }}
      >
        <AppImageList />
      </div>
    )
  }
  return (
    <Input
      size='small'
      showClear
      value={props.value}
      suffix={
        <Popover
          showArrow
          zIndex={2001}
          trigger='click' content={<AppList />}
        >
          <IconChainStroked style={{ cursor: 'pointer' }} />
        </Popover>
      }
    />
  )
})

export default ImageEdit
