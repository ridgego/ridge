import React from 'react'
import { Tree, Input } from '@douyinfe/semi-ui'
import MoveablePanel from './MoveablePanel.jsx'
import { EVENT_PAGE_LOADED, EVENT_ELEMENT_PARENT_CHANGE, EVENT_ELEMENT_SELECTED } from '../constant.js'

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

    Ridge.on(EVENT_ELEMENT_SELECTED, payload => {
      if (payload.from === 'workspace') {
        this.setState({
          selected: payload.element ? payload.element.elementWrapper.id : null
        })
        if (payload.elements) {
          this.setState({
            elements: payload.elements
          })
        }
      }
    })
  }

  onNodeSelected (val) {
    const { Ridge } = window
    Ridge.emit(EVENT_ELEMENT_SELECTED, {
      from: 'outline',
      element: this.state.elements[val].el
    })
  }

  buildElementTree (elements) {
    const treeData = []
    const rootElements = Object.values(elements).filter(el => el.isRoot())
    for (const element of rootElements) {
      treeData.push(this.getElementTree(element))
    }
    return treeData
  }

  getElementTree (element, tags) {
    const treeNodeObject = {
      key: element.id,
      label: element.config.title,
      value: element.id,
      tags,
      element,
      children: []
    }
    if (element.config.props.children && element.config.props.children.length) {
      for (const childWrapper of element.config.props.children) {
        if (childWrapper.id) {
          treeNodeObject.children.push(this.getElementTree(childWrapper))
        }
      }
    }

    const slotChildrenElements = element.getSlotChildren()

    for (const slotChild of slotChildrenElements) {
      if (slotChild.element && slotChild.element.id) {
        treeNodeObject.children.push(this.getElementTree(slotChild.element, {
          tag: slotChild.name
        }))
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
          value={selected}
          searchRender={({ prefix, ...restProps }) => (
            <Input
              prefix='Search'
              {...restProps}
            />
          )}
          onChange={(value) => {
            this.onNodeSelected(value)
          }}
          treeData={treeData}
        />
      </MoveablePanel>
    )
  }
}

export default OutLinePanel
