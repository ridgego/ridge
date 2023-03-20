import React from 'react'
import { Tabs, TabPane, Typography } from '@douyinfe/semi-ui'
import { IconInheritStroked, IconFillStroked, IconUserCircleStroked, IconHistory } from '@douyinfe/semi-icons'
import ObjectForm from '../../form/ObjectForm.jsx'
import './setting-panel.less'
import BackUp from './BackUp.jsx'

import { ridge } from '../../service/RidgeEditService.js'
const FORM_DEBUG_SECTION = [
  {
    label: '启用',
    type: 'boolean',
    field: 'debug',
    bindable: false
  }, {
    label: '本地地址',
    type: 'string',
    field: 'debugUrl',
    bindable: false
  }, {
    label: '控制台调试输出',
    type: 'array',
    field: 'console',
    control: 'checkboxgroup',
    optionList: [{
      label: '编辑器整体',
      value: 'ridge:editor'
    }, {
      label: '数据库存取',
      value: 'db:nedb'
    }, {
      label: '应用资源',
      value: 'ridge:file-list'
    }, {
      label: '页面组件',
      value: 'ridge:element'
    }, {
      label: '拖拽动作',
      value: 'ridge:workspace'
    }],
    selectAll: true,
    bindable: false
  }
]

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
              fields={FORM_DEBUG_SECTION} getFormApi={debugFormCallback} onValueChange={(values) => {
                ridge.configService.updateConfig(values)
              }}
            />
          </TabPane>
        </Tabs>
      </div>

    </>
  )
}
