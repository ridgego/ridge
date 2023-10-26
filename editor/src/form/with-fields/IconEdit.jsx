import React, { useState } from 'react'
import { Popover, Input, Typography, withField, Tabs, TabPane } from '@douyinfe/semi-ui'
import { IconAppCenter } from '@douyinfe/semi-icons'
import ridgeEditService from '../../service/RidgeEditorContext.js'

const { Text } = Typography

const IconEdit = withField(({
  value,
  onChange
}) => {
  const { icons } = window.Ridge
  const IconList = () => {
    return (
      <>
        <Tabs type='button' size='small'>
          {Object.values(icons).map((iconModule, index) => {
            return (
              <TabPane
                key={index}
                itemKey={index} tab={<div className={iconModule.options.icon} />}
              >
                <div className='icon-list'>
                  {iconModule.icons.map(ico =>
                    <i
                      onClick={() => {
                        onChange(ico)
                      }} key={ico} className={ico}
                    />)}
                </div>

              </TabPane>
            )
          })}
        </Tabs>
      </>
    )
  }

  return (
    <Input
      size='small'
      showClear
      onClear={() => onChange('')}
      value={value}
      onChange={val => onChange(val)}
      suffix={
        <Popover
          trigger='click'
          className='pop-icon-container'
          showArrow
          zIndex={2001}
          content={
            <IconList />
          }
        >
          <span className='picker-button'><IconAppCenter />
          </span>
        </Popover>
      }
    />
  )
})

export default IconEdit
