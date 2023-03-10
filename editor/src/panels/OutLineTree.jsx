import React from 'react'
import { Tree, Space, Typography, Button } from '@douyinfe/semi-ui'
import { IconUnlock, IconLock, IconEyeOpened, IconEyeClosedSolid } from '@douyinfe/semi-icons'
import { EVENT_PAGE_LOADED, EVENT_ELEMENT_UNSELECT, EVENT_ELEMENT_SELECTED, EVENT_PAGE_OUTLINE_CHANGE, EVENT_ELEMENT_CREATED } from '../constant.js'
import RawSvgIcon from '../utils/RawSvgIcon.jsx'
import { emit, on } from '../service/RidgeEditService.js'
import { ThemeContext } from './MoveablePanel.jsx'

const { Text } = Typography

class OutLineTree extends React.Component {
  constructor () {
    super()
    this.state = {
      elements: [],
      selected: null
    }
  }

  static contextType = ThemeContext

  componentDidMount () {
    on(EVENT_PAGE_LOADED, ({ elements }) => {
      this.setState({
        elements
      })
    })

    on(EVENT_ELEMENT_CREATED, ({
      element,
      elements
    }) => {
      this.setState({
        elements
      })
    })

    on(EVENT_PAGE_OUTLINE_CHANGE, ({ elements }) => {
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
    if (element.componentDefinition && element.componentDefinition.icon) {
      treeNodeObject.icon = (<RawSvgIcon svg={element.componentDefinition.icon} />)
    }
    if (element.config.props.children && element.config.props.children.length) {
      for (const childWrapper of element.config.props.children.filter(n => n)) {
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

  toggleLock = (data) => {
    const lockStatus = !data.element.config.style.locked
    data.element.setConfigLocked(lockStatus)
    this.setState({
      elements: { ...this.state.elements }
    })
    if (lockStatus) {
      emit(EVENT_ELEMENT_UNSELECT, {
        element: data.element.el
      })
    }
  }

  toggleVisible = (data) => {
    const visible = !data.element.config.style.visible
    data.element.setConfigVisible(visible)
    this.setState({
      elements: { ...this.state.elements }
    })
    if (!visible) {
      emit(EVENT_ELEMENT_UNSELECT, {
        element: data.element.el
      })
    }
  }

  renderFullLabel = (label, data) => {
    const { toggleLock, toggleVisible } = this
    return (
      <div className='tree-label'>
        <Space className='label-content'>
          <Text className='label-text'>{label || data.key}</Text>
        </Space>
        <Space spacing={0}>
          <Button
            className={data.element.config.style.locked ? '' : 'hover-show'}
            size='small' theme='borderless' type='tertiary' onClick={() => {
              toggleLock(data)
            }} icon={data.element.config.style.locked ? <IconLock /> : <IconUnlock />}
          />
          <Button
            className={data.element.config.style.visible ? 'hover-show' : ''}
            size='small' theme='borderless' type='tertiary' onClick={() => {
              toggleVisible(data)
            }} icon={data.element.config.style.visible ? <IconEyeOpened /> : <IconEyeClosedSolid />}
          />
        </Space>
      </div>
    )
  }

  render () {
    const { selected, elements } = this.state
    const { renderFullLabel } = this
    const treeData = this.buildElementTree(elements)
    return (
      <Tree
        style={{
          height: '100%',
          overflow: 'auto'
        }}
        value={selected}
        renderLabel={renderFullLabel}
        onChange={(value) => {
          this.onNodeSelected(value)
        }}
        treeData={treeData}
      />
    )
  }
}

export default OutLineTree
