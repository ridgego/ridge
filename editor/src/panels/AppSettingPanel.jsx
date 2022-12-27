import React from 'react'
import { Tabs, TabPane, Typography } from '@douyinfe/semi-ui'
import { IconInheritStroked, IconFillStroked, IconUserCircleStroked, IconHistory } from '@douyinfe/semi-icons'
import ObjectForm from '../form/ObjectForm.jsx'
import '../css/setting-panel.less'
const FORM_DEBUG_SECTION = [{
  rows: [
    {
      cols: [{
        label: '启用',
        type: 'boolean',
        field: 'enabled',
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

const FORM_APP_SECTION = [{
  rows: [
    {
      cols: [{
        label: '从本地还原',
        type: 'file',
        field: 'import',
        bindable: false
      }]
    },
    {
      cols: [{
        label: '备份到本地',
        type: 'button',
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
            <ObjectForm
              sections={FORM_APP_SECTION} onValueChange={(v) => {
                console.log(v)
              }}
            />
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
              initValues={{
                enabled: false,
                debugUrl: 'http://localhost:8700'
              }}
              sections={FORM_DEBUG_SECTION} getFormApi={debugFormCallback} onValueChange={(v) => {
                console.log(v)
              }}
            />
          </TabPane>
        </Tabs>
      </div>

    </>
  )
}
