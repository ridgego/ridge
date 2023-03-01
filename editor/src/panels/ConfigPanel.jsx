import React from 'react'
import { Tabs, TabPane } from '@douyinfe/semi-ui'
import ObjectForm from '../form/ObjectForm.jsx'
import MoveablePanel from './MoveablePanel.jsx'
import PageDataPanel from './PageDataPanel.jsx'
import { ridge, emit, on } from '../service/RidgeEditService.js'

import {
  EVENT_ELEMENT_SELECTED, EVENT_PAGE_LOADED, EVENT_PAGE_CONFIG_CHANGE, EVENT_ELEMENT_PROP_CHANGE, EVENT_ELEMENT_EVENT_CHANGE, EVENT_PAGE_PROP_CHANGE, EVENT_PAGE_RENAMED
} from '../constant.js'

const FORM_COMPONENT_BASIC = [{
  rows: [
    {
      cols: [{
        label: '名称',
        control: 'text',
        bindable: false,
        field: 'title'
      }]
    },
    {
      cols: [{
        label: 'X',
        control: 'number',
        readonly: (values) => {
          return !(values && values.style && values.style.position === 'absolute')
        },
        field: 'style.x',
        fieldEx: 'styleEx.x'
      }, {
        label: 'Y',
        control: 'number',
        readonly: (values) => {
          return !(values && values.style && values.style.position === 'absolute')
        },
        field: 'style.y',
        fieldEx: 'styleEx.Y'
      }]
    },
    {
      cols: [{
        label: 'W',
        control: 'number',
        field: 'style.width',
        fieldEx: 'styleEx.width'
      }, {
        label: 'H',
        control: 'number',
        field: 'style.height',
        fieldEx: 'styleEx.height'
      }]
    },
    {
      cols: [{
        label: '显示',
        type: 'boolean',
        control: 'checkbox',
        field: 'style.visible',
        fieldEx: 'styleEx.visible'
      }]
    }
  ]
}]

const COMPONENT_BASIC_FIELDS = [
  {
    label: '名称',
    control: 'text',
    bindable: false,
    field: 'title'
  },
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
  },
  {
    label: '显示',
    type: 'boolean',
    control: 'checkbox',
    field: 'style.visible',
    fieldEx: 'styleEx.visible'
  }
]

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
      label: '按设计宽高',
      value: 'fixed'
    }, {
      label: '缩放适应',
      value: 'scale-fixed'
    }, {
      label: '横向适应',
      value: 'fit-w'
    }, {
      label: '全填充适应',
      value: 'fit-wh'
    }]
  },
  {
    label: '设计宽度',
    bindable: false,
    control: 'number',
    field: 'width'
  }, {
    label: '设计高度',
    bindable: false,
    control: 'number',
    field: 'height'
  }, {
    label: '背景',
    bindable: false,
    field: 'background',
    type: 'string'
  }
]

const FORM_PAGE_PROPS = [{
  rows: [{
    cols: [{
      label: '页面名称',
      control: 'text',
      readonly: true,
      bindable: false,
      field: 'name'
    }]
  }, {
    cols: [{
      label: '页面布局',
      control: 'select',
      field: 'type',
      bindable: false,
      optionList: [{
        label: '固定宽高',
        value: 'fixed'
      }, {
        label: '宽度自适应',
        value: 'fit-w'
      }, {
        label: '宽高自适应',
        value: 'fit-wh'
      }]
    }]
  }, {
    cols: [{
      label: 'W',
      when: 'type === "fixed"',
      bindable: false,
      control: 'number',
      field: 'width'
    }, {
      label: 'H',
      when: 'type === "fixed"',
      bindable: false,
      control: 'number',
      field: 'height'
    }]
  }, {
    cols: []
  }]
}]

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
      if (payload.from === 'workspace') {
        this.elementSelected(payload.element)
      }
    })
  }

  elementMoved (el) {
    this.componentPropFormApi.setValue('style', el.elementWrapper.getStyle(), {
      notNotify: true
    })
  }

  // 按照选择的组件更新面板配置表单
  updatePanelConfig () {
    const elementWrapper = this.currentElement.elementWrapper
    this.componentPropFormApi.setValue('style', elementWrapper.config.style, {
      notNotify: true
    })

    // 节点基本样式 （x/y/w/h)
    const nodePropFields = JSON.parse(JSON.stringify(COMPONENT_BASIC_FIELDS))
    const nodeEventFields = []

    // 放置到容器中，有容器赋予的样式配置的
    for (const style of elementWrapper.parentWrapper?.componentDefinition?.childStyle || []) {
      const field = {}
      Object.assign(field, style, {
        field: 'style.' + style.name,
        fieldEx: 'styleEl.' + style.name
      })
      nodePropFields.push(field)
    }

    // 能加载到节点定义
    if (elementWrapper.componentDefinition) {
      nodePropFields.push({
        type: 'divider',
        label: '组件属性'
      })
      for (const prop of elementWrapper.componentDefinition.props) {
        const field = {}
        Object.assign(field, prop, {
          field: 'props.' + prop.name,
          fieldEx: 'propsEx.' + prop.name
        })
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
    this.componentEventFormApi.setValue('event', elementWrapper.config.events, {
      notNotify: true
    })

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
      // this.componentPropFormApi.setValue('title', elementWrapper.config.title, {
      //   notNotify: true
      // })
      // this.componentPropFormApi.setValue('props', elementWrapper.config.props, {
      //   notNotify: true
      // })
      // this.componentPropFormApi.setValue('propsEx', elementWrapper.config.propEx, {
      //   notNotify: true
      // })
      // this.componentPropFormApi.setValue('styleEx', elementWrapper.config.styleEx, {
      //   notNotify: true
      // })
      // this.componentEventFormApi.setValue('event', elementWrapper.config.events, {
      //   notNotify: true
      // })
    })
  }

  /**
   * 节点元素被选中事件
   * @param {DOM} el
   */
  elementSelected (el) {
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
      pageStates
    } = this.state

    // 回写styleApi句柄以便直接操作基础form
    const basicPropsAPI = (formApi) => {
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

    const pagePropValueChange = (values, field) => {
      emit(EVENT_PAGE_PROP_CHANGE, {
        from: 'panel',
        properties: values
      })
    }

    return (
      <MoveablePanel {...this.props}>
        <Tabs
          type='card'
          style={{
            display: nodePropFields.length === 0 ? 'none' : 'initial'
          }}
        >
          {/* 组件属性配置 */}
          <TabPane tab='属性' itemKey='style'>
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
              fields={nodeEventFields}
              getFormApi={eventPropsAPI} onValueChange={componentEventValueChange} options={{
                pageReducers,
                pageStates
              }}
            />
          </TabPane>
        </Tabs>
        <Tabs
          type='card'
          style={{
            display: nodePropFields.length === 0 ? 'initial' : 'none'
          }}
        >
          {/* 页面属性配置 */}
          <TabPane tab='属性' itemKey='style'>
            <ObjectForm
              fields={PAGE_FIELDS}
              tableStyle
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
            <PageDataPanel />
          </TabPane>
        </Tabs>
      </MoveablePanel>
    )
  }
}
