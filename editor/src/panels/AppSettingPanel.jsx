import React from 'react'
import { Tabs, TabPane, Typography } from '@douyinfe/semi-ui'
import { IconInheritStroked, IconFillStroked, IconUserCircleStroked, IconHistory } from '@douyinfe/semi-icons'
import ObjectForm from '../form/ObjectForm.jsx'
import '../css/setting-panel.less'
import BackUp from './app/BackUp.jsx'

import { ridge } from '../service/RidgeEditService.js'
const FORM_DEBUG_SECTION = [{
  rows: [
    {
      cols: [{
        label: '启用',
        type: 'boolean',
        field: 'debug',
        bindable: false
      }]
    },
    {
      cols: [{
        label: '本地地址',
        type: 'string',
        field: 'debugUrl',
        bindable: false
      }]
    }
  ]
}]

export default () => {
  const { Title } = Typography

  const debugFormCallback = api => {

  }

  const debugConfig = ridge.configService.getConfig()
  return (
    <>
      <Title heading={5} style={{ margin: '8px 0' }}>Ridge 应用配置</Title>
      <div className='setting-content'>
        <Tabs tabPosition='left' type='button'>
          <TabPane
            tab={
              <span>
                <IconUserCircleStroked />
                您与Ridge
              </span>
            }
            itemKey='user'
          />
          <TabPane
            tab={
              <span>
                <IconHistory />
                备份与清理
              </span>
            }
            itemKey='app-manage'
          >
            <BackUp />
          </TabPane>

          <TabPane
            tab={
              <span>
                <IconFillStroked />
                主题颜色
              </span>
            }
            itemKey='theme'
          />

          <TabPane
            tab={
              <span>
                <IconInheritStroked />
                开发调试
              </span>
            }
            itemKey='debug'
          >
            <ObjectForm
              initValues={debugConfig}
              sections={FORM_DEBUG_SECTION} getFormApi={debugFormCallback} onValueChange={(values) => {
                ridge.configService.updateConfig(values)
              }}
            />
          </TabPane>
        </Tabs>
      </div>

    </>
  )
}
