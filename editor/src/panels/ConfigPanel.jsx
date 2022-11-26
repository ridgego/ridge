import React from 'react'
import { Tabs, TabPane } from '@douyinfe/semi-ui'
import ObjectForm from '../form/ObjectForm.jsx'

import MoveablePanel from './MoveablePanel.jsx'
import './config-panel.less'

const basicStyleSections = [{
  rows: [
    {
      cols: [{
        label: '名称',
        control: 'text',
        bindable: false,
        field: 'name'
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
        fieldEx: 'ex.style.x'
      }, {
        label: 'Y',
        control: 'number',
        readonly: (values) => {
          return !(values && values.style && values.style.position === 'absolute')
        },
        field: 'style.y',
        fieldEx: 'ex.style.Y'
      }]
    },
    {
      cols: [{
        label: 'W',
        control: 'number',
        field: 'style.width',
        fieldEx: 'ex.style.width'
      }, {
        label: 'H',
        control: 'number',
        field: 'style.height',
        fieldEx: 'ex.style.height'
      }]
    },
    {
      cols: [{
        label: '显示',
        type: 'boolean',
        control: 'checkbox',
        field: 'style.visible',
        fieldEx: 'ex.style.visible'
      }]
    }
  ]
}]

const pageConfigSection = [{
  rows: [{
    cols: [{
      label: '页面名称',
      control: 'text',
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
  }]
}]

export default class ComponentPanel extends React.Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
    this.componentPropFormApi = null
    this.currentNode = null
    this.currentStyle = {}
    this.state = {
      show: true,
      nodePropsSection: [],
      nodeEventsSection: []
    }
  }

  setPageManager (pageManager) {
    this.pageManager = pageManager
    this.pageProperties = pageManager.getPageProperties()

    this.pagePropFormApi.setValues(this.pageProperties, {
      notNotify: true
    })
  }

  elementMove (el) {
    this.componentPropFormApi.setValue('style', el.elementWrapper.getStyle(), {
      notNotify: true
    })
  }

  /**
   * 节点元素被选中事件
   * @param {DOM} el
   */
  elementSelected (el) {
    if (el) {
      const elementWrapper = el.elementWrapper

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
          control.fieldEx = 'ex.props.' + prop.name
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
            field: 'event.' + event.name
          }
          eventRows.push({
            cols: control
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
          this.componentPropFormApi.setValue('style', el.elementWrapper.getStyle(), {
            notNotify: true
          })
          this.componentPropFormApi.setValue('ex.props', elementWrapper.getPropsBinding(), {
            notNotify: true
          })
          this.componentPropFormApi.setValue('ex.style', elementWrapper.getStyleBinding(), {
            notNotify: true
          })
        })
      }

      this.currentElement = el
      this.elementMove(el)
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
      nodeEventsSection
    } = this.state
    const {
      pagePropChange
    } = this.props

    // 回写styleApi句柄以便直接操作基础form
    const basicPropsAPI = (formApi) => {
      window.Ridge.componentPropFormApi = formApi
      this.componentPropFormApi = formApi
    }
    // 回写styleApi句柄以便直接操作基础form
    const cbPagePropFormApi = (formApi) => {
      window.Ridge.pagePropFormApi = formApi
      this.pagePropFormApi = formApi
    }

    const eventPropsAPI = (formApi) => {
      this.componentEventFormApi = formApi
    }

    // 组件属性表单项修改
    const componentPropValueChange = (values, field) => {
      this.currentElement.elementWrapper.propConfigUpdate(values, field)
    }

    const componentEventValueChange = (values, field) => {
      this.currentElement.elementWrapper.eventConfigUpdate(values, field)
    }

    const pagePropValueChange = (values, field) => {
      pagePropChange && pagePropChange(values)
    }

    console.log('render section', nodePropsSection, nodeEventsSection, pageConfigSection)
    return (
      <MoveablePanel right='10px' bottom='370px' width='420px' top='10px' {...this.props}>
        <div ref={this.ref}>
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
              <ObjectForm sections={nodeEventsSection} getFormApi={eventPropsAPI} onValueChange={componentEventValueChange} />
            </TabPane>
          </Tabs>
          <ObjectForm
            style={{
              display: nodePropsSection.length === 0 ? 'initial' : 'none'
            }}
            sections={pageConfigSection} getFormApi={cbPagePropFormApi} onValueChange={pagePropValueChange}
          />
        </div>
      </MoveablePanel>
    )
  }
}
