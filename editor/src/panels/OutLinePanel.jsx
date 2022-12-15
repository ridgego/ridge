import React from 'react'
import { Tree, Input } from '@douyinfe/semi-ui'
import MoveablePanel from './MoveablePanel.jsx'
import { EVENT_PAGE_LOADED, EVENT_ELEMENT_PARENT_CHANGE } from '../constant.js'

class OutLinePanel extends React.Component {
  constructor () {
    super()
    this.el = document.createElement('div')
    this.ref = React.createRef()
    this.state = {
      elements: [],
      selected: null
    }
  }

  componentDidMount () {
    const { Ridge } = window

    Ridge.on(EVENT_PAGE_LOADED, ({ elements }) => {
      this.setState({
        elements
      })
    })

    Ridge.on(EVENT_ELEMENT_PARENT_CHANGE, ({
      elements
    }) => {
      this.setState({
        elements
      })
    })
  }

  buildElementTree (elements) {
    const treeData = []
    const rootElements = Object.values(elements).filter(el => el.isRoot())
    for (const element of rootElements) {
      treeData.push(this.getElementTree(element, elements))
    }
    return treeData
  }

  getElementTree (element, elementsDic) {
    const treeNodeObject = {
      key: element.id,
      label: element.config.title,
      value: element.id,
      children: []
    }
    if (element.config.props.children && element.config.props.children.length) {
      for (const childId of element.config.props.children) {
        treeNodeObject.children.push(this.getElementTree(elementsDic[childId], elementsDic))
      }
    }
    return treeNodeObject
  }

  render () {
    const { selected, elements } = this.state
    const treeData = this.buildElementTree(elements)
    return (
      <MoveablePanel title='大纲' left='45px' width='320px' bottom='10px' top='400px' {...this.props}>
        <Tree
          filterTreeNode
          searchRender={({ prefix, ...restProps }) => (
            <Input
              prefix='Search'
              {...restProps}
            />
          )}
          treeData={treeData}
        />
      </MoveablePanel>
    )
  }
}

export default OutLinePanel
