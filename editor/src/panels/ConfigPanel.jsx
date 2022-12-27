import React from 'react'
import { Tabs, TabPane } from '@douyinfe/semi-ui'
import ObjectForm from '../form/ObjectForm.jsx'

import MoveablePanel from './MoveablePanel.jsx'
import {
  FORM_COMPONENT_BASIC, FORM_PAGE_PROPS,
  EVENT_ELEMENT_SELECTED, EVENT_PAGE_LOADED, EVENT_PAGE_VAR_CHANGE, EVENT_ELEMENT_PROP_CHANGE, EVENT_ELEMENT_EVENT_CHANGE, EVENT_PAGE_PROP_CHANGE
} from '../constant.js'

import { emit, on } from '../utils/events'

const basicStyleSections = FORM_COMPONENT_BASIC

export default class ComponentPanel extends React.Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
    this.componentPropFormApi = null
    this.componentEventFormApi = null
    this.pagePropFormApi = null

    this.state = {
      pageVariables: [],
      nodePropsSection: [], // 当前节点属性
      nodeEventsSection: [] // 当前节点事件
    }
    this.initEvents()
  }

  initEvents () {
    on(EVENT_PAGE_LOADED, ({ pageProperties, pageVariables }) => {
      this.pagePropFormApi.setValues(pageProperties, {
        notNotify: true
      })
      this.setState({
        pageVariables
      })
    })
    on(EVENT_PAGE_PROP_CHANGE, payload => {
      if (payload.from === 'workspace') {
        this.pagePropFormApi.setValues(payload.properties, {
          notNotify: true
        })
      }
    })
    on(EVENT_PAGE_VAR_CHANGE, pageVariables => {
      this.setState({
        pageVariables
      })
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
      const componentDefiProps = elementWrapper.componentDefinition.props
      const styledProps = []
      let partied = null
      for (const prop of componentDefiProps) {
        const control = {
          label: prop.label,
          type: prop.type,
          bindable: prop.bindable,
          control: prop.control,
          optionList: prop.optionList,
          field: 'props.' + prop.name,
          fieldEx: 'propsEx.' + prop.name
        }
        if (prop.party) {
          partied = control
        } else {
          styledProps.push({
            cols: partied
              ? [partied, control]
              : [
                  control
                ]
          })
          partied = null
        }
      }
      const nodePropsSection = basicStyleSections.concat({
        rows: styledProps
      })

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
      this.setState({
        nodePropsSection,
        nodeEventsSection: [{
          rows: eventRows
        }]
      }, () => {
        this.componentPropFormApi.setValue('name', elementWrapper.config.title, {
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
      pageVariables
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
                pageVariables
              }}
            />
          </TabPane>
          <TabPane tab='交互' itemKey='interact'>
            <ObjectForm
              sections={nodeEventsSection} getFormApi={eventPropsAPI} onValueChange={componentEventValueChange} options={{
                pageVariables
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
                pageVariables
              }}
            />
          </TabPane>
        </Tabs>
      </MoveablePanel>
    )
  }
}
