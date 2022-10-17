import React from 'react'
import { Tabs, TabPane } from '@douyinfe/semi-ui'
import { List } from 'immutable'
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

const pageConfigSection = [{
  rows: [{
    cols: [{
      label: '页面名称',
      control: 'text',
      field: 'name'
    }]
  }, {
    cols: [{
      label: '页面宽度',
      control: 'text',
      field: 'name'
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
      styleSections: [],
      pageConfigSection
    }
  }

  styleChange (el) {
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
      this.styleApi.setValue(propKey, this.currentStyle[propKey])
    }
  }

  // 画布上选择节点触发
  nodeChange (node, el) {
    if (el) {
      this.styleChange(el)
    }

    this.currentNode = node

    if (node) {
      // 更新组件属性
      const { fcViewManager } = window
      const fcView = fcViewManager.componentViews[node.id]
      this.fcView = fcView
      const componentDefiProps = fcView.componentDefinition.props
      const styledProps = []
      let styleSections = List(basicStyleSections)
      for (const prop of componentDefiProps) {
        styledProps.push({
          cols: [
            {
              label: prop.label,
              control: prop.type,
              field: 'props.' + prop.name
            }
          ]
        })
        if (prop.type === 'css-style' && fcView.instancePropConfig[prop.name]) {
          fcView.instancePropConfig[prop.name] = JSON.stringify(fcView.instancePropConfig[prop.name], '\\n', 2)
        }
      }
      styleSections = styleSections.concat({
        rows: styledProps
      })
      this.setState({
        styleSections
      }, () => {
        this.styleApi.setValue('props', fcView.instancePropConfig, {
          notNotify: true
        })
      })
    } else {
      this.setState({
        styleSections: []
      }, () => {
      })
    }
  }

  render () {
    const {
      styleSections,
      pageConfigSection
    } = this.state
    const {
      inputStyleChange
    } = this.props

    // 回写styleApi句柄以便直接操作基础form
    const basicStyleAPI = (formApi) => {
      this.styleApi = formApi
    }

    // 基础表单修改
    const propChange = (values, field) => {
      console.log('prop change', field, values)
      let isStyleChanged = false
      for (const fieldKey of Object.keys(field)) {
        if (field[fieldKey] !== this.currentStyle[fieldKey] && fieldKey !== 'props') {
          isStyleChanged = true
        }
      }
      if (isStyleChanged) {
        console.log('trigger canvas change')
        inputStyleChange(values, field)
      }

      if (this.currentNode && Object.keys(field).filter(p => p.indexOf('props.') > -1)) {
        const { fcViewManager } = window
        const fcView = fcViewManager.componentViews[this.currentNode.id]

        const componentDefiProps = fcView.componentDefinition.props
        for (const prop of componentDefiProps) {
          if (prop.type === 'css-style' && values.props[prop.name]) {
            try {
              values.props[prop.name] = JSON.parse(values.props[prop.name])
            } catch (e) {
              values.props[prop.name] = fcView.instancePropConfig[prop.name]
            }
          }
        }

        fcView.patchProps(values.props)
      }
    }
    return (
      <div className='component-props-panel'>
        <Tabs
          type='card'
          style={{
            display: styleSections.length === 0 ? 'none' : 'initial'
          }}
        >
          <TabPane tab='属性' itemKey='style'>
            <ObjectForm sections={styleSections} getFormApi={basicStyleAPI} onValueChange={propChange} />
          </TabPane>
          <TabPane tab='交互' itemKey='interact' />
        </Tabs>
        <Tabs ype='card'>
          <TabPane tab='页面属性' itemKey='page'>
            <ObjectForm sections={pageConfigSection} />
          </TabPane>
        </Tabs>
      </div>
    )
  }
}
