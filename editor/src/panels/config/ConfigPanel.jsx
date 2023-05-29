import React from 'react'
import { Tabs, TabPane } from '@douyinfe/semi-ui'
import ObjectForm from '../../form/ObjectForm.jsx'
import { ThemeContext } from '../movable/MoveablePanel.jsx'
import PageDataConfig from './PageDataConfig.jsx'
import { emit, on } from '../../service/RidgeEditService.js'
import debug from 'debug'

import {
  EVENT_ELEMENT_SELECTED, EVENT_PAGE_LOADED, EVENT_PAGE_CONFIG_CHANGE, EVENT_ELEMENT_PROP_CHANGE, EVENT_ELEMENT_EVENT_CHANGE, EVENT_PAGE_PROP_CHANGE, EVENT_PAGE_RENAMED, EVENT_ELEMENT_DRAG_END
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
    label: '填满页面',
    width: '50%',
    type: 'boolean',
    field: 'style.full'
  }
]

const COMPONENT_STYLE_FIELDS = [{
  label: '显示',
  type: 'boolean',
  control: 'checkbox',
  width: '50%',
  field: 'style.visible',
  fieldEx: 'styleEx.visible'
}, {
  label: '透明度',
  type: 'number',
  width: '50%',
  field: 'style.opacity',
  fieldEx: 'styleEx.opacity'
}, {
  label: '层',
  type: 'number',
  width: '50%',
  field: 'style.zIndex'
}, {
  label: '内边距',
  type: 'padding',
  field: 'style.padding'
}, {
  label: '圆角',
  type: 'padding',
  position: 'corner',
  field: 'style.borderRadius'
}, {
  label: '边框',
  type: 'color',
  width: '72px',
  field: 'style.borderColor'
}, {
  type: 'select',
  width: '80px',
  field: 'style.borderStyle',
  optionList: [{
    label: '实线',
    value: 'solid'
  }, {
    label: '虚线',
    value: 'dashed'
  }]
}, {
  type: 'padding',
  width: 140,
  field: 'style.borderWidth'
}, {
  label: '背景',
  control: 'background',
  field: 'style.background'
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
    label: '运行区域',
    bindable: false,
    control: 'select',
    field: 'type',
    optionList: [{
      label: '固定宽高',
      value: 'static'
    }, {
      label: '宽度自适应',
      value: 'responsive'
    }, {
      label: '宽高自适应',
      value: 'full-responsive'
    }]
  },
  {
    label: '宽度',
    bindable: false,
    control: 'number',
    width: '50%',
    field: 'width'
  }, {
    label: '高度',
    bindable: false,
    width: '50%',
    control: 'number',
    field: 'height'
  }, {
    label: '背景',
    control: 'background',
    field: 'background'
  }
]

export default class ComponentPanel extends React.Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
    this.componentPropFormApi = null
    this.componentEventFormApi = null
    this.pagePropFormApi = null

    this.state = {
      pageStates: [],
      pageReducers: [],
      nodePropFields: [], // 当前节点属性
      nodeEventFields: [], // 当前节点事件
      nodePropsValues: {},
      nodeEventsValues: {}
    }
    // this.initEvents()
  }

  static contextType = ThemeContext

  componentDidMount () {
    this.initEvents()
  }

  initEvents () {
    on(EVENT_PAGE_LOADED, ({ name, properties, states, reducers }) => {
      for (const key of Object.keys(properties)) {
        this.pagePropFormApi.setValue(key, properties[key], {
          notNotify: true
        })
      }
      this.pagePropFormApi.setValue('name', name, {
        notNotify: true
      })
      this.setState({
        pageReducers: reducers,
        pageStates: states
      })
    })
    on(EVENT_PAGE_CONFIG_CHANGE, ({ states, reducers }) => {
      this.setState({
        pageReducers: reducers,
        pageStates: states
      })
    })
    on(EVENT_PAGE_RENAMED, name => {
      this.pagePropFormApi.setValue('name', name, {
        notNotify: true
      })
    })
    on(EVENT_PAGE_PROP_CHANGE, ({ from, properties }) => {
      if (from === 'workspace') {
        for (const key of Object.keys(properties)) {
          this.pagePropFormApi.setValue(key, properties[key], {
            notNotify: true
          })
        }
      }
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
  updatePanelConfig () {
    const elementWrapper = this.currentElement.elementWrapper

    trace('updatePanelConfig', elementWrapper)

    // 节点基本样式 （title/visible)
    const nodePropFields = []

    nodePropFields.push(...COMPONENT_BASIC_FIELDS)

    if (elementWrapper.parentWrapper) {
      // 放置到容器中，有容器赋予的样式配置的
      nodePropFields.push(...(elementWrapper.parentWrapper?.componentDefinition?.childStyle || []))
    } else {
      nodePropFields.push(...COMPONENT_ROOT_FIELDS)
    }

    const nodeEventFields = []
    // 能加载到节点定义
    if (elementWrapper.componentDefinition) {
      nodePropFields.push({
        type: 'divider',
        label: '组件属性'
      })
      for (const prop of elementWrapper.componentDefinition.props) {
        const field = {}
        if (prop.bindable === true) {
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

      for (const event of elementWrapper.componentDefinition.events || []) {
        const control = {
          label: event.label,
          type: 'function',
          control: 'event',
          bindable: false,
          field: 'event.' + event.name
        }
        nodeEventFields.push(control)
      }
    }
    this.setState({
      nodePropFields,
      nodeEventFields,
      nodePropsValues: {
        title: elementWrapper.config.title,
        props: elementWrapper.config.props,
        propsEx: elementWrapper.config.propEx,
        styleEx: elementWrapper.config.styleEx
      },
      nodeEventsValues: {
        event: elementWrapper.config.events
      }
    }, () => {
      this.componentPropFormApi.reset()
      this.componentEventFormApi.reset()
      this.componentStyleFormApi.reset()

      this.componentPropFormApi.setValue('style', elementWrapper.config.style, {
        notNotify: true
      })
      this.componentPropFormApi.setValue('title', elementWrapper.config.title, {
        notNotify: true
      })
      this.componentPropFormApi.setValue('props', elementWrapper.config.props, {
        notNotify: true
      })
      this.componentPropFormApi.setValue('propsEx', elementWrapper.config.propEx, {
        notNotify: true
      })
      this.componentPropFormApi.setValue('styleEx', elementWrapper.config.styleEx, {
        notNotify: true
      })

      this.componentStyleFormApi.setValue('style', elementWrapper.config.style, {
        notNotify: true
      })
      this.componentStyleFormApi.setValue('styleEx', elementWrapper.config.styleEx, {
        notNotify: true
      })

      this.componentEventFormApi.setValue('event', elementWrapper.config.events, {
        notNotify: true
      })
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
      pageReducers,
      pageStates,
      nodeEventsValues
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
      emit(EVENT_PAGE_PROP_CHANGE, {
        from: 'panel',
        properties: values
      })
    }

    return (
      <>
        <Tabs
          type='card'
          className='on-title'
          style={{
            display: nodePropFields.length === 0 ? 'none' : 'block'
          }}
        >
          {/* 组件属性配置 */}
          <TabPane tab='属性' itemKey='props'>
            <ObjectForm
              fields={nodePropFields}
              getFormApi={basicPropsAPI} onValueChange={componentPropValueChange} options={{
                pageReducers,
                pageStates
              }}
            />
          </TabPane>
          <TabPane tab='交互' itemKey='interact'>
            <ObjectForm
              initValues={nodeEventsValues}
              fields={nodeEventFields}
              getFormApi={eventPropsAPI} onValueChange={componentEventValueChange} options={{
                pageReducers,
                pageStates
              }}
            />
          </TabPane>
          <TabPane tab='样式' itemKey='style'>
            <ObjectForm
              fields={COMPONENT_STYLE_FIELDS}
              getFormApi={basicStylesAPI} onValueChange={componentStyleValueChange} options={{
                pageReducers,
                pageStates
              }}
            />
          </TabPane>
        </Tabs>
        <Tabs
          type='card'
          className='on-title'
          style={{
            display: nodePropFields.length === 0 ? 'block' : 'none'
          }}
        >
          {/* 页面属性配置 */}
          <TabPane tab='属性' itemKey='style'>
            <ObjectForm
              fields={PAGE_FIELDS}
              getFormApi={cbPagePropFormApi} onValueChange={pagePropValueChange}
            />
          </TabPane>
          <TabPane tab='交互' itemKey='interact'>
            <ObjectForm
              getFormApi={pageEventPropsAPI} onValueChange={componentEventValueChange} options={{
                pageReducers,
                pageStates
              }}
            />
          </TabPane>
          <TabPane tab='数据' itemKey='data'>
            <PageDataConfig />
          </TabPane>
        </Tabs>
      </>
    )
  }
}
