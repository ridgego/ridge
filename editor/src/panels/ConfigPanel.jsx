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
    cols: [{
      label: '背景',
      bindable: false,
      field: 'background',
      type: 'string'
    }]
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
      nodePropsSection: [], // 当前节点属性
      nodePropsValues: {},
      nodeEventsSection: [], // 当前节点事件
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

  updatePanelConfig () {
    const elementWrapper = this.currentElement.elementWrapper
    this.componentPropFormApi.setValue('style', elementWrapper.config.style, {
      notNotify: true
    })

    if (elementWrapper.componentDefinition) {
      const componentProps = []
      let partied = null
      for (const prop of elementWrapper.componentDefinition.props) {
        const control = {}
        Object.assign(control, prop, {
          field: 'props.' + prop.name,
          fieldEx: 'propsEx.' + prop.name
        })
        if (prop.party) {
          partied = control
        } else {
          componentProps.push({
            cols: partied
              ? [partied, control]
              : [
                  control
                ]
          })
          partied = null
        }
      }
      const styleSection = JSON.parse(JSON.stringify(FORM_COMPONENT_BASIC))
      for (const style of elementWrapper.parentWrapper?.componentDefinition?.childStyle || []) {
        const control = {}
        Object.assign(control, style, {
          field: 'style.' + style.name,
          fieldEx: 'styleEl.' + style.name
        })
        styleSection[0].rows.push({
          cols: [control]
        })
      }

      const nodePropsSection = [...styleSection, {
        rows: componentProps
      }]

      const eventRows = []
      for (const event of elementWrapper.componentDefinition.events || []) {
        const control = {
          label: event.label,
          type: 'function',
          control: 'event',
          bindable: false,
          field: 'event.' + event.name
        }
        eventRows.push({
          cols: [
            control
          ]
        })
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
        nodePropsSection,
        nodePropsValues: {
          title: elementWrapper.config.title,
          props: elementWrapper.config.props,
          propsEx: elementWrapper.config.propEx,
          styleEx: elementWrapper.config.styleEx
        },
        nodeEventsSection: [{
          rows: eventRows
        }],
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
        nodePropsSection: [],
        nodeEventsSection: []
      })
    }
  }

  nodeRectChange (el) {
    this.styleChange(el)
  }

  render () {
    const {
      nodePropsSection,
      nodeEventsSection,
      nodePropsValues,
      pageReducers,
      pageStates,
      nodeEventsValues
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
            display: nodePropsSection.length === 0 ? 'none' : 'initial'
          }}
        >
          <TabPane tab='属性' itemKey='style'>
            <ObjectForm
              sections={nodePropsSection} getFormApi={basicPropsAPI} onValueChange={componentPropValueChange} options={{
                pageReducers,
                pageStates
              }}
            />
          </TabPane>
          <TabPane tab='交互' itemKey='interact'>
            <ObjectForm
              initValues={nodeEventsValues}
              sections={nodeEventsSection} getFormApi={eventPropsAPI} onValueChange={componentEventValueChange} options={{
                pageReducers,
                pageStates
              }}
            />
          </TabPane>
        </Tabs>
        <Tabs
          type='card'
          style={{
            display: nodePropsSection.length === 0 ? 'initial' : 'none'
          }}
        >
          <TabPane tab='属性' itemKey='style'>
            <ObjectForm
              sections={FORM_PAGE_PROPS} getFormApi={cbPagePropFormApi} onValueChange={pagePropValueChange}
            />
          </TabPane>
          <TabPane tab='交互' itemKey='interact'>
            <ObjectForm
              sections={nodeEventsSection} getFormApi={pageEventPropsAPI} onValueChange={componentEventValueChange} options={{
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
