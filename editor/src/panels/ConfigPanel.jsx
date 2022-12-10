import React from 'react'
import { Tabs, TabPane } from '@douyinfe/semi-ui'
import ObjectForm from '../form/ObjectForm.jsx'

import MoveablePanel from './MoveablePanel.jsx'
import { FORM_COMPONENT_BASIC, FORM_PAGE_PROPS, EVENT_ELEMENT_SELECTED, EVENT_PAGE_LOADED, EVENT_PAGE_VAR_CHANGE, EVENT_ELEMENT_PROP_CHANGE, EVENT_ELEMENT_EVENT_CHANGE, EVENT_PAGE_PROP_CHANGE } from '../constant.js'

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
    const { Ridge } = window

    Ridge.on(EVENT_PAGE_LOADED, ({ pageProperties, pageVariables }) => {
      this.pagePropFormApi.setValues(pageProperties, {
        notNotify: true
      })
      this.setState({
        pageVariables
      })
    })
    Ridge.on(EVENT_PAGE_VAR_CHANGE, pageVariables => {
      this.setState({
        pageVariables
      })
    })
    Ridge.on(EVENT_ELEMENT_SELECTED, el => {
      this.elementSelected(el)
    })
  }

  elementMoved (el) {
    this.componentPropFormApi.setValue('style', el.elementWrapper.getStyle(), {
      notNotify: true
    })
  }

  updatePanelConfig () {
    const elementWrapper = this.currentElement.elementWrapper
    this.componentPropFormApi.setValue('style', elementWrapper.getStyle(), {
      notNotify: true
    })
    if (elementWrapper.componentDefinition) {
      const componentDefiProps = elementWrapper.componentDefinition.props
      const styledProps = []
      for (const prop of componentDefiProps) {
        const control = {
          label: prop.label,
          type: prop.type,
          bindable: prop.bindable,
          control: prop.control,
          field: 'props.' + prop.name
        }
        control.fieldEx = 'propsEx.' + prop.name
        if (!control.control) {
          if (control.type === 'string') {
            control.control = 'text'
          }
        }
        if (prop.optionList) {
          control.optionList = prop.optionList
        }
        styledProps.push({
          cols: [
            control
          ]
        })
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
        this.componentPropFormApi.setValue('name', elementWrapper.getName(), {
          notNotify: true
        })
        this.componentPropFormApi.setValue('props', elementWrapper.getPropsValue(), {
          notNotify: true
        })
        this.componentPropFormApi.setValue('style', elementWrapper.getStyle(), {
          notNotify: true
        })
        this.componentPropFormApi.setValue('propsEx', elementWrapper.getPropsBinding(), {
          notNotify: true
        })
        this.componentPropFormApi.setValue('styleEx', elementWrapper.getStyleBinding(), {
          notNotify: true
        })
        this.componentEventFormApi.setValue('event', elementWrapper.getEventActionsConfig(), {
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

    // 组件属性表单项修改
    const componentPropValueChange = (values, field) => {
      window.Ridge && window.Ridge.emit(EVENT_ELEMENT_PROP_CHANGE, { el: this.currentElement, values, field })
    }

    const componentEventValueChange = (values, field) => {
      window.Ridge && window.Ridge.emit(EVENT_ELEMENT_EVENT_CHANGE, { el: this.currentElement, values, field })
    }

    const pagePropValueChange = (values, field) => {
      window.Ridge && window.Ridge.emit(EVENT_PAGE_PROP_CHANGE, values)
    }

    return (
      <MoveablePanel right='10px' bottom='250px' width='300px' top='10px' {...this.props}>
        <Tabs
          type='card'
          style={{
            display: nodePropsSection.length === 0 ? 'none' : 'initial'
          }}
        >
          <TabPane tab='属性' itemKey='style'>
            <ObjectForm sections={nodePropsSection} getFormApi={basicPropsAPI} onValueChange={componentPropValueChange} />
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
              style={{
                display: nodePropsSection.length === 0 ? 'initial' : 'none'
              }}
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
