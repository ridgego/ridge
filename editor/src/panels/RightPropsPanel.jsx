import React from 'react'
import { Tabs, TabPane } from '@douyinfe/semi-ui'
import ObjectForm from './ObjectForm.jsx'

const basicStyleSections = [{
  rows: [
    {
      cols: [{
        label: '名称',
        control: 'text',
        field: 'name'
      }]
    },
    {
      cols: [{
        label: '坐标X',
        control: 'number',
        field: 'x'
      }, {
        label: '坐标Y',
        control: 'number',
        field: 'y'
      }]
    },
    {
      cols: [{
        label: '宽度',
        control: 'number',
        field: 'width'
      }, {
        label: '高度',
        control: 'number',
        field: 'height'
      }]
    }
  ]
}]

const pageVariableSection = [{
  rows: [{
    cols: [{
      control: 'variable',
      field: 'variables'
    }]
  }]
}]

const pageConfigSection = [{
  rows: [{
    cols: [{
      label: '页面名称',
      control: 'text',
      field: 'name'
    }]
  }, {
    cols: [{
      label: '页面布局',
      control: 'select',
      field: 'type',
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
      control: 'number',
      field: 'width'
    }, {
      label: '高度',
      when: 'type === "fixed"',
      control: 'number',
      field: 'height'
    }]
  }]
}]

export default class ComponentPropsPanel extends React.Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
    this.styleApi = null
    this.currentNode = null
    this.currentStyle = {}
    this.state = {
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
    if (el.style.transform) {
      const matched = el.style.transform.match(/[0-9.]+/g)
      this.currentStyle.x = parseInt(matched[0])
      this.currentStyle.y = parseInt(matched[1])
    } else {
      this.currentStyle.x = 0
      this.currentStyle.y = 0
    }
    this.currentStyle.width = parseInt(el.style.width)
    this.currentStyle.height = parseInt(el.style.height)

    for (const propKey of Object.keys(this.currentStyle)) {
      this.styleApi.setValue(propKey, this.currentStyle[propKey], {
        notNotify: true
      })
    }
  }

  elementSelected (el) {
    if (el) {
      const elementWrapper = el.elementWrapper

      if (elementWrapper.componentDefinition) {
        const componentDefiProps = elementWrapper.componentDefinition.props
        const styledProps = []
        let nodePropsSection = JSON.parse(JSON.stringify(basicStyleSections))
        for (const prop of componentDefiProps) {
          const control = {
            label: prop.label,
            type: prop.type,
            control: prop.control,
            field: 'props.' + prop.name
          }
          if (!control.control) {
            if (control.type === 'string') {
              control.control = 'text'
            }
          }
          styledProps.push({
            cols: [
              control
            ]
          })
        }
        nodePropsSection = nodePropsSection.concat({
          rows: styledProps
        })
        this.setState({
          nodePropsSection
        }, () => {
          this.styleApi.setValue('props', elementWrapper.instancePropConfig, {
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

  render () {
    const {
      nodePropsSection,
      pageConfigSection
    } = this.state
    const {
      inputStyleChange,
      pagePropChange,
      pageVariableChange
    } = this.props

    // 回写styleApi句柄以便直接操作基础form
    const basicStyleAPI = (formApi) => {
      window.componentPropFormApi = formApi
      this.styleApi = formApi
    }
    // 回写styleApi句柄以便直接操作基础form
    const cbPagePropFormApi = (formApi) => {
      window.pagePropFormApi = formApi
      this.pagePropFormApi = formApi
    }

    const cbPageVariableFormApi = formApi => {
      this.pageVariableFormApi = formApi
    }

    // 组件属性表单项修改
    const componentPropValueChange = (values, field) => {
      console.log('prop change', field, values)

      const changedKeys = Object.keys(field)
      const changedKey = changedKeys[0]
      if (changedKey) {
        if (this.currentElement && changedKey.startsWith('props.')) {
          this.currentElement.elementWrapper.updateProperties(values.props)
        }
      }
    }

    const pagePropValueChange = (values, field) => {
      pagePropChange && pagePropChange(values)
    }

    const pageVariableValueChange = (values, field) => {
      pageVariableChange && pageVariableChange(values)
    }

    return (
      <div className='component-props-panel'>
        <Tabs
          type='card'
          style={{
            display: nodePropsSection.length === 0 ? 'none' : 'initial'
          }}
        >
          <TabPane tab='属性' itemKey='style'>
            <ObjectForm sections={nodePropsSection} getFormApi={basicStyleAPI} onValueChange={componentPropValueChange} />
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
          <TabPane
            tab='页面变量' itemKey='variables' style={{
              height: '100%',
              overflow: 'auto'
            }}
          >
            <ObjectForm
              style={{
              }} sections={pageVariableSection} getFormApi={cbPageVariableFormApi} onValueChange={pageVariableValueChange}
            />
          </TabPane>
        </Tabs>

      </div>
    )
  }
}
