import React from 'react'
import { Tabs, TabPane } from '@douyinfe/semi-ui'
import ObjectForm from './ObjectForm.jsx'

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
        label: '坐标X',
        control: 'number',
        readonly: (values) => {
          return !(values && values.style && values.style.position === 'absolute')
        },
        field: 'style.x',
        fieldEx: 'ex.style.x'
      }, {
        label: '坐标Y',
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
        label: '宽度',
        control: 'number',
        field: 'style.width',
        fieldEx: 'ex.style.width'
      }, {
        label: '高度',
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
      options: [{
        label: '固定宽高',
        value: 'fixed'
      }, {
        label: '宽高自适应',
        value: 'fit-wh'
      }, {
        label: '宽度自适应',
        value: 'fit-w'
      }]
    }]
  }, {
    cols: [{
      label: '宽度',
      when: 'type === "fixed"',
      bindable: false,
      control: 'number',
      field: 'width'
    }, {
      label: '高度',
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
      pageConfigSection
    }
  }

  loadPage ({
    properties,
    variables
  }) {
    this.pageProperties = properties
    this.pageVariables = variables

    this.pagePropFormApi.setValues(this.pageProperties, {
      notNotify: true
    })

    this.pagePropFormApi.setValue('variables', variables, {
      notNotify: true
    })
  }

  elementMove (el) {
    this.componentPropFormApi.setValue('style', el.elementWrapper.getStyle(), {
      notNotify: true
    })
  }

  elementSelected (el) {
    if (el) {
      const elementWrapper = el.elementWrapper

      if (elementWrapper.componentDefinition) {
        const componentDefiProps = elementWrapper.componentDefinition.props
        const styledProps = []
        // let nodePropsSection = Object.assign()JSON.parse(JSON.stringify(basicStyleSections))
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
        this.setState({
          nodePropsSection
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
        nodePropsSection: []
      })
    }
  }

  nodeRectChange (el) {
    this.styleChange(el)
  }

  componentDidMount () {
    document.getElementById('componentPropPanel').setShow = this.setShow.bind(this)
  }

  setShow (show) {
    this.setState({
      show
    })
  }

  render () {
    const {
      show,
      nodePropsSection,
      pageConfigSection
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

    // 组件属性表单项修改
    const componentPropValueChange = (values, field) => {
      this.currentElement.elementWrapper.propConfigUpdate(values, field)
    }

    const pagePropValueChange = (values, field) => {
      pagePropChange && pagePropChange(values)
    }

    return (
      <MoveablePanel right='10px' bottom='430px' width='420px' top='10px'>
        <div ref={this.ref} className={'component-props-panel ' + (show ? 'is-show' : '')} id='componentPropPanel'>
          <Tabs
            type='card'
            style={{
              display: nodePropsSection.length === 0 ? 'none' : 'initial'
            }}
          >
            <TabPane tab='属性' itemKey='style'>
              <ObjectForm sections={nodePropsSection} getFormApi={basicPropsAPI} onValueChange={componentPropValueChange} />
            </TabPane>
            <TabPane tab='交互' itemKey='interact' />
          </Tabs>
          <Tabs
            type='card'
            style={{
              display: nodePropsSection.length === 0 ? 'initial' : 'none'
            }}
          >
            <TabPane tab='页面属性' itemKey='page-prop'>
              <ObjectForm
                style={{
                }} sections={pageConfigSection} getFormApi={cbPagePropFormApi} onValueChange={pagePropValueChange}
              />
            </TabPane>
          </Tabs>
        </div>
      </MoveablePanel>
    )
  }
}
