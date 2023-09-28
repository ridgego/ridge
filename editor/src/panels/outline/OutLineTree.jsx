import React from 'react'
import debug from 'debug'
import { Tree, Space, Typography, Button, Tag } from '@douyinfe/semi-ui'
import * as SemiIcons from '@douyinfe/semi-icons'
import { EVENT_PAGE_LOADED, EVENT_ELEMENT_SELECTED, EVENT_PAGE_OUTLINE_CHANGE, EVENT_ELEMENT_CREATED, EVENT_ELEMENT_DRAG_END } from '../../constant.js'
import { workspaceControl, ridge, on, emit } from '../../service/RidgeEditService.js'
import { ThemeContext } from '../movable/MoveablePanel.jsx'

const { IconUnlock, IconLock, IconEyeOpened, IconEyeClosedSolid } = SemiIcons
const { Text } = Typography
const log = debug('ridge:outline')

class OutLineTree extends React.Component {
  constructor () {
    super()
    this.state = {
      elements: [],
      selected: null
    }
    ridge.services.outline = this
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

  updateTree (elements) {
    this.setState({
      elements
    })
  }

  onNodeSelected (val) {
    this.setState({
      selected: val
    })
    const element = this.state.elements[val]

    if (element.parentWrapper && element.parentWrapper.componentDefinition && element.parentWrapper.componentDefinition.name === 'switch-container') {
      // 在切换容器内，需要切换容器当前状态
      const index = element.parentWrapper.config.props.children.indexOf(val)

      element.parentWrapper.setPropsConfig(null, {
        'props.states': {
          current: element.parentWrapper.config.props.states.list[index],
          list: element.parentWrapper.config.props.states.list
        }
      })
    }

    workspaceControl.selectElements([this.state.elements[val].el], true)
  }

  buildElementTree (elements) {
    const treeData = []
    const rootElements = Object.values(elements).filter(el => el.isRoot()).sort((a, b) => a.i - b.i)
    for (const element of rootElements) {
      treeData.push(this.getElementTree(element, elements))
    }
    return treeData
  }

  getElementTree (element, elements, tags) {
    const treeNodeObject = {
      key: element.id,
      label: element.config.props.text || element.config.title,
      value: element.id,
      tags,
      element,
      children: []
    }

    if (element.componentDefinition) {
      // 更改Icon
      if (element.componentDefinition.icon) {
        if (SemiIcons[element.componentDefinition.icon]) {
          const Icon = SemiIcons[element.componentDefinition.icon]
          treeNodeObject.icon = <Icon />
        } else if (element.componentDefinition.icon.startsWith('')) {
          treeNodeObject.icon = <i style={{ fontSize: '16px', marginRight: '5px' }} className={element.componentDefinition.icon} />
          // treeNodeObject.icon = (<RawSvgIcon svg={element.componentDefinition.icon} />)
        }
      }

      // 递归处理子节点树
      const childProps = element.componentDefinition.props.filter(p => p.type === 'children')
      if (childProps.length) {
        for (const childProp of childProps) {
          if (element.config.props[childProp.name] && element.config.props[childProp.name].length) {
            for (let i = 0; i < element.config.props[childProp.name].length; i++) {
              const elementId = element.config.props[childProp.name][i]
              if (elementId && elements[elementId]) {
                if (element.componentDefinition.name === 'switch-container') {
                  elements[elementId].parent = element
                  const stateName = element.config.props.states.list[i]
                  treeNodeObject.children.push(this.getElementTree(elements[elementId], elements, [stateName]))
                } else {
                  treeNodeObject.children.push(this.getElementTree(elements[elementId], elements, [childProps.label]))
                }
              }
            }
          }
        }
      }

      // 递归处理插槽节点
      const slotProps = element.componentDefinition.props.filter(p => p.type === 'slot')
      if (slotProps.length) {
        for (const childProp of slotProps) {
          if (element.config.props[childProp.name] && elements[element.config.props[childProp.name]]) {
            treeNodeObject.children.push(this.getElementTree(elements[element.config.props[childProp.name]], elements, childProps.label))
          }
        }
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
          {data.tags && data.tags.map(tag => <Tag size='small' color='amber' key={tag}> {tag} </Tag>)}
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

  onTreeDrop ({ event, node, dragNode, dragNodesKeys, dropPosition, dropToGap }) {
    const targetNodePos = node.pos.split('-') // 放置对比目标
    const dragNodePos = dragNode.pos.split('-') // 拖拽的节点

    log(node, dragNode, dropPosition, dropToGap)
    if (dropToGap) {
      if (parseInt(targetNodePos[targetNodePos.length - 1]) > parseInt(dragNodePos[dragNodePos.length - 1])) { // 向后拖拽
        dragNode.element.pageManager.setPositionAfter(dragNode.element, node.element)
      } else {
        // 向前拖拽
        dragNode.element.pageManager.setPositionBefore(dragNode.element, node.element)
      }
    }
  }

  render () {
    const { selected, elements } = this.state
    const { renderFullLabel, onTreeDrop } = this
    const treeData = this.buildElementTree(elements)
    return (
      <Tree
        style={{
          height: '100%',
          overflow: 'auto'
        }}
        draggable
        value={selected}
        renderLabel={renderFullLabel}
        onDrop={onTreeDrop}
        onChange={(value) => {
          this.onNodeSelected(value)
        }}
        treeData={treeData}
      />
    )
  }
}

export default OutLineTree
