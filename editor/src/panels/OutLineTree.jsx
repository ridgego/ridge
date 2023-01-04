import React from 'react'
import { Tree } from '@douyinfe/semi-ui'
import { EVENT_PAGE_LOADED, EVENT_ELEMENT_DRAG_END, EVENT_ELEMENT_SELECTED } from '../constant.js'
import { ridge, emit, on } from '../service/RidgeEditService.js'

class OutLineTree extends React.Component {
  constructor () {
    super()
    this.state = {
      elements: [],
      selected: null
    }
  }

  componentDidMount () {
    on(EVENT_PAGE_LOADED, ({ elements }) => {
      this.setState({
        elements
      })
    })

    on(EVENT_ELEMENT_DRAG_END, ({
      elements
    }) => {
      this.setState({
        elements
      })
    })

    on(EVENT_ELEMENT_SELECTED, payload => {
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
    emit(EVENT_ELEMENT_SELECTED, {
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
      <Tree
        value={selected}
        onChange={(value) => {
          this.onNodeSelected(value)
        }}
        treeData={treeData}
      />
    )
  }
}

export default OutLineTree
