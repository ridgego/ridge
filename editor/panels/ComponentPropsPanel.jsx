import React from 'react'
import { Tabs, TabPane } from '@douyinfe/semi-ui'
import ObjectForm from './ObjectForm.jsx'

const basicStyleSections = [{
  rows: [
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

export default class ComponentPropsPanel extends React.Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
    this.styleApi = null
    this.currentStyle = {}
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

  nodeChange (node) {

  }

  render () {
    const {
      inputStyleChange
    } = this.props
    const basicStyleAPI = (formApi) => {
      this.styleApi = formApi
    }
    const styleValueChange = (values, field) => {
      for (const fieldKey of Object.keys(field)) {
        if (field[fieldKey] !== this.currentStyle[fieldKey]) {
          inputStyleChange(values, field)
        }
      }
    }
    return (
      <div className='component-props-panel'>
        <Tabs type='card'>
          <TabPane tab='样式' itemKey='style'>
            <ObjectForm sections={basicStyleSections} getFormApi={basicStyleAPI} onValueChange={styleValueChange} />
          </TabPane>
          <TabPane tab='数据' itemKey='data' />
          <TabPane tab='交互' itemKey='interact' />
        </Tabs>
      </div>
    )
  }
}
