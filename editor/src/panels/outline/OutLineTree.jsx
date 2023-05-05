import React from 'react'
import { Tree, Space, Typography, Button } from '@douyinfe/semi-ui'
import * as SemiIcons from '@douyinfe/semi-icons'
import { EVENT_PAGE_LOADED, EVENT_ELEMENT_SELECTED, EVENT_PAGE_OUTLINE_CHANGE, EVENT_ELEMENT_CREATED, EVENT_ELEMENT_DRAG_END } from '../../constant.js'
import RawSvgIcon from '../../utils/RawSvgIcon.jsx'
import { workspaceControl, on, emit } from '../../service/RidgeEditService.js'
import { ThemeContext } from '../movable/MoveablePanel.jsx'

const { IconUnlock, IconLock, IconEyeOpened, IconEyeClosedSolid } = SemiIcons
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

    on(EVENT_ELEMENT_DRAG_END, payload => {
      this.setState({
        elements: payload.elements
      })
    })
  }

  onNodeSelected (val) {
    this.setState({
      selected: val
    })
    workspaceControl.selectElements([this.state.elements[val].el])
  }

  buildElementTree (elements) {
    const treeData = []
    const rootElements = Object.values(elements).filter(el => el.isRoot())
    for (const element of rootElements) {
      treeData.push(this.getElementTree(element, elements))
    }
    return treeData
  }

  getElementTree (element, elements, tags) {
    const treeNodeObject = {
      key: element.id,
      label: element.config.title,
      value: element.id,
      tags,
      element,
      children: []
    }
    if (element.componentDefinition && element.componentDefinition.icon) {
      if (SemiIcons[element.componentDefinition.icon]) {
        const Icon = SemiIcons[element.componentDefinition.icon]
        treeNodeObject.icon = <Icon />
      } else {
        treeNodeObject.icon = (<RawSvgIcon svg={element.componentDefinition.icon} />)
      }
    }
    if (element.config.props.children && element.config.props.children.length) {
      for (const childId of element.config.props.children.filter(n => n)) {
        if (elements[childId]) {
          treeNodeObject.children.push(this.getElementTree(elements[childId]))
        }
      }
    }

    for (const value of Object.values(element.properties)) {
      if (value && value.componentPath) {
        treeNodeObject.children.push(this.getElementTree(value))
      }
    }
    return treeNodeObject
  }

  toggleLock = (data) => {
    const lockStatus = !data.element.config.style.locked
    data.element.setPropsConfig({}, {
      'style.locked': lockStatus
    })
    this.setState({
      elements: { ...this.state.elements }
    })
    workspaceControl.selectElements([data.element.el])
  }

  toggleVisible = (data) => {
    const visible = !data.element.config.style.visible
    if (!visible) {
      workspaceControl.selectElements([])
    }
    data.element.setPropsConfig({}, {
      'style.visible': visible
    })
    if (visible) {
      workspaceControl.selectElements([data.element.el])
    }
    this.setState({
      elements: { ...this.state.elements }
    })
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
