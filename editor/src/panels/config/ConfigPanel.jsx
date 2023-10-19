import React from 'react'
import { Tabs, TabPane } from '@douyinfe/semi-ui'
import ObjectForm from '../../form/ObjectForm.jsx'
import { ThemeContext } from '../movable/MoveablePanel.jsx'
import debug from 'debug'

import ridgeEditorService from '../../service/RidgeEditorService.js'

import {
  EVENT_FILE_TREE_CHANGE, EVENT_ELEMENT_SELECTED, EVENT_PAGE_LOADED, EVENT_PAGE_CONFIG_CHANGE, EVENT_ELEMENT_PROP_CHANGE, EVENT_ELEMENT_EVENT_CHANGE, EVENT_PAGE_PROP_CHANGE, EVENT_PAGE_RENAMED, EVENT_ELEMENT_DRAG_END
} from '../../constant.js'
const trace = debug('editor:config-panel')

const COMPONENT_BASIC_FIELDS = [
  {
    label: '名称',
    control: 'text',
    bindable: false,
    field: 'title'
  }
]

const COMPONENT_ROOT_FIELDS = [
  {
    label: 'X',
    control: 'number',
    width: '50%',
    readonly: (values) => {
      return !(values && values.style && values.style.position === 'absolute')
    },
    field: 'style.x',
    fieldEx: 'styleEx.x'
  }, {
    label: 'Y',
    width: '50%',
    control: 'number',
    readonly: (values) => {
      return !(values && values.style && values.style.position === 'absolute')
    },
    field: 'style.y',
    fieldEx: 'styleEx.Y'
  },
  {
    label: 'W',
    width: '50%',
    control: 'number',
    field: 'style.width',
    fieldEx: 'styleEx.width'
  }, {
    label: 'H',
    width: '50%',
    control: 'number',
    field: 'style.height',
    fieldEx: 'styleEx.height'
  }, {
    label: '显示',
    type: 'boolean',
    control: 'checkbox',
    width: '50%',
    field: 'style.visible',
    fieldEx: 'styleEx.visible'
  }
]

const COMPONENT_STYLE_FIELDS = [{
  label: '填满页面',
  width: '50%',
  type: 'boolean',
  field: 'style.full'
}, {
  label: '透明度',
  type: 'number',
  width: '50%',
  field: 'style.opacity',
  fieldEx: 'styleEx.opacity'
}, {
  label: '层高',
  type: 'number',
  width: '50%',
  field: 'style.zIndex'
}]

const PAGE_FIELDS = [
  {
    label: '页面名称',
    control: 'text',
    readonly: true,
    bindable: false,
    field: 'name'
  },
  {
    label: '宽度',
    bindable: false,
    control: 'number',
    width: '50%',
    field: 'style.width'
  }, {
    label: '高度',
    bindable: false,
    width: '50%',
    control: 'number',
    field: 'style.height'
  }, {
    label: '背景',
    control: 'background',
    field: 'style.background'
  }
]

export default class ComponentPanel extends React.Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
    this.componentPropFormApi = null
    this.componentEventFormApi = null
    this.pagePropFormApi = null

    ridgeEditorService.services.configPanel = this

    this.state = {
      configPage: true,
      pageFields: [],
      pageEventFields: [], 
      nodePropFields: [], // 当前节点属性
      nodeEventFields: [], // 当前节点事件
    }
  }

  static contextType = ThemeContext

  componentDidMount () {
    // this.initEvents()
  }

  initEvents () {
    on(EVENT_PAGE_LOADED, ({ name, properties }) => {
      for (const key of Object.keys(properties)) {
        this.pagePropFormApi.setValue(key, properties[key], {
          notNotify: true
        })
      }
      this.pagePropFormApi.setValue('name', name, {
        notNotify: true
      })
      this.updatePageConfigFields()
    })
    on(EVENT_PAGE_RENAMED, name => {
      this.pagePropFormApi.setValue('name', name, {
        notNotify: true
      })
    })
    // on(EVENT_PAGE_PROP_CHANGE, ({ from, properties }) => {
    //   if (from === 'workspace') {
    //     for (const key of Object.keys(properties)) {
    //       this.pagePropFormApi.setValue(key, properties[key], {
    //         notNotify: true
    //       })
    //     }
    //   }
    // })

    on(EVENT_FILE_TREE_CHANGE, payload => {
      this.updatePageConfigFields()
    })
    on(EVENT_ELEMENT_SELECTED, payload => {
      // if (payload.from === 'workspace') {
      this.elementSelected(payload.element)
      // }
    })
    on(EVENT_ELEMENT_DRAG_END, payload => {
      this.elementSelected(payload.sourceElement)
    })
  }

  // 按照选择的组件更新面板配置表单
  updateComponentConfig (componentView) {
    let view = componentView
    if (componentView instanceof Node) {
      view = componentView.view
    }

    trace('updatePanelConfig', view)

    // 节点基本样式 （title/visible)
    const nodePropFields = []

    nodePropFields.push(...COMPONENT_BASIC_FIELDS)

    if (view.containerView) {
      // 放置到容器中，有容器赋予的样式配置的
      nodePropFields.push(...(view.containerView?.componentDefinition?.childStyle || []))
    } else {
      nodePropFields.push(...COMPONENT_ROOT_FIELDS)
    }

    const nodeEventFields = []
    // 能加载到节点定义
    if (view.componentDefinition) {
      for (const prop of view.componentDefinition.props) {
        const field = {}
        if (prop.connect) {
          Object.assign(field, prop, {
            field: 'props.' + prop.name,
            fieldEx: 'propsEx.' + prop.name
          })
        } else {
          Object.assign(field, prop, {
            field: 'props.' + prop.name
          })
        }
        nodePropFields.push(field)
      }

      for (const event of view.componentDefinition.events || []) {
        const control = {
          label: event.label,
          type: 'function',
          control: 'event',
          field: 'events.' + event.name
        }
        nodeEventFields.push(control)
      }
    }
    this.setState({
      configPage: false,
      nodePropFields,
      nodeEventFields,
      // nodePropsValues: {
      //   title: view.config.title,
      //   props: view.config.props,
      //   propsEx: view.config.propEx,
      //   styleEx: view.config.styleEx
      // },
      // nodeEventsValues: {
      //   event: view.config.events
      // }
    }, () => {
      this.componentPropFormApi.reset()
      this.componentEventFormApi.reset()
      this.componentStyleFormApi.reset()

      for (const key of Object.keys(view.config)) {
        this.componentPropFormApi.setValue(key, view.config[key], {
          notNotify: true
        })
      }
    })
  }

  updatePageConfigFields () {
    const { editorView } = ridgeEditorService
    const { appService } = ridgeEditorService.services
    this.setState({
      configPage: true,
      pageFields: [...PAGE_FIELDS, {
        field: 'cssFiles',
        label: '样式表',
        control: 'select',
        placeholder: '请选择样式文件',
        optionList: appService.filterFiles(node => node.mimeType === 'text/css').map(file => {
          return {
            value: file.path,
            label: file.label
          }
        }),
        required: false,
        multiple: true
      }, {
        field: 'jsFiles',
        label: '脚本库',
        control: 'select',
        placeholder: '请选择脚本文件',
        optionList: appService.filterFiles(node => node.mimeType === 'text/javascript').map(file => {
          return {
            value: file.path,
            label: file.label
          }
        }),
        required: false,
        multiple: true
      }, {
        field: 'storeFiles',
        label: '状态库',
        control: 'select',
        placeholder: '请选择脚本文件',
        optionList: appService.filterFiles(node => node.mimeType === 'text/javascript' && node.label.endsWith('.store.js')).map(file => {
          return {
            value: file.path,
            label: file.label
          }
        }),
        required: false,
        multiple: true
      }, {
        field: 'style.classNames',
        label: '样式库',
        control: 'select',
        placeholder: '请选择样式',
        optionList: editorView.classNames.map(c => {
          return {
            label: c.label,
            value: c.className
          }
        }),
        required: false,
        multiple: true
      }]
    })

    const { cssFiles, jsFiles, storeFiles, style, name } = editorView.config

    this.pagePropFormApi.setValue('cssFiles', cssFiles, {
      notNotify: true
    })
    this.pagePropFormApi.setValue('jsFiles', jsFiles, {
      notNotify: true
    })
    this.pagePropFormApi.setValue('storeFiles', storeFiles, {
      notNotify: true
    })
    this.pagePropFormApi.setValue('style', style, {
      notNotify: true
    })
    this.pagePropFormApi.setValue('name', name, {
      notNotify: true
    })
  }

  /**
   * 节点元素被选中事件
   * @param {DOM} el
   */
  elementSelected (el) {
    // if (this.currentElement === el) {
    //   return
    // }
    this.currentElement = el
    if (this.interval) {
      window.clearInterval(this.interval)
      this.interval = null
    }
    if (el) {
      const elementWrapper = this.currentElement.elementWrapper
      if (elementWrapper && elementWrapper.componentDefinition) {
        this.updatePanelConfig()
      } else {
        this.interval = setInterval(() => {
          if (elementWrapper && elementWrapper.componentDefinition) {
            this.updatePanelConfig()
            window.clearInterval(this.interval)
            this.interval = null
          }
        }, 200)
      }
    } else {
      this.updatePageConfigFields()
      this.currentElement = null
      this.setState({
        nodePropFields: [],
        nodeEventFields: []
      })
    }
  }

  nodeRectChange (el) {
    this.styleChange(el)
  }

  render () {
    const {
      nodePropFields,
      nodeEventFields,
      pageFields,
      configPage
    } = this.state
    const basicStylesAPI = formApi => {
      this.componentStyleFormApi = formApi
    }

    // 回写styleApi句柄以便直接操作基础form
    const basicPropsAPI = (formApi) => {
      window.componentPropFormApi = this.componentEventFormApi
      this.componentPropFormApi = formApi
    }

    const eventPropsAPI = (formApi) => {
      this.componentEventFormApi = formApi
    }
    // 回写styleApi句柄以便直接操作基础form
    const cbPagePropFormApi = (formApi) => {
      this.pagePropFormApi = formApi
    }

    const pageEventPropsAPI = formApi => {

    }

    // 组件属性表单项修改  组件样式和属性变动
    const componentPropValueChange = (values, field) => {
      emit(EVENT_ELEMENT_PROP_CHANGE, { el: this.currentElement, values, field })
    }

    const componentEventValueChange = (values, field) => {
      emit(EVENT_ELEMENT_EVENT_CHANGE, { el: this.currentElement, values, field })
    }
    const componentStyleValueChange = (values, field) => {
      emit(EVENT_ELEMENT_PROP_CHANGE, { el: this.currentElement, values, field })
    }

    const pagePropValueChange = (values, field) => {
      ridgeEditorService.updatePageConfig(values, field)
      // ridge.pageElementManager.updatePageConfig(field)
    }

    return (
      <>
        <Tabs
          type='card'
          className='on-title'
          style={{
            display: configPage ? 'none' : 'block'
          }}
        >
          {/* 组件属性配置 */}
          <TabPane tab='属性' itemKey='props'>
            <ObjectForm
              fields={nodePropFields}
              getFormApi={basicPropsAPI} onValueChange={componentPropValueChange}
            />
          </TabPane>
          <TabPane tab='交互' itemKey='interact'>
            <ObjectForm
              fields={nodeEventFields}
              getFormApi={eventPropsAPI} onValueChange={componentEventValueChange}
            />
          </TabPane>
          <TabPane tab='样式' itemKey='style'>
            <ObjectForm
              fields={COMPONENT_STYLE_FIELDS}
              getFormApi={basicStylesAPI} onValueChange={componentStyleValueChange}
            />
          </TabPane>
        </Tabs>

        <Tabs
          type='card'
          className='on-title'
          style={{
            display: configPage ? 'block' : 'none'
          }}
        >
          {/* 页面属性配置 */}
          <TabPane tab='基础' itemKey='style'>
            <ObjectForm
              fields={pageFields}
              getFormApi={cbPagePropFormApi} onValueChange={pagePropValueChange}
            />
          </TabPane>
          <TabPane tab='交互' itemKey='interact'>
            <ObjectForm
              getFormApi={pageEventPropsAPI} onValueChange={componentEventValueChange}
            />
          </TabPane>
        </Tabs>
      </>
    )
  }
}
