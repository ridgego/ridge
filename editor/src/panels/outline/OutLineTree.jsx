import React from 'react'
import debug from 'debug'
import { Tree, Space, Typography, Button, Tag } from '@douyinfe/semi-ui'
import * as SemiIcons from '@douyinfe/semi-icons'
import './outline.less'
import context from '../../service/RidgeEditorContext.js'
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
    context.services.outlinePanel = this
  }

  static contextType = ThemeContext

  updateOutline () {
    if (context.editorView) {
      this.setState({
        elements: context.editorView.getComponentViews()
      })
    }
  }

  updateComponentConfig (componentView) {

  }

  updateTree (elements) {
    this.setState({
      elements
    })
  }

  setCurrentNode (view) {
    if (view) {
      this.setState({
        selected: view.config.id
      })
    } else {
      this.setState({
        selected: null
      })
    }
  }

  onNodeSelected (val) {
    this.setState({
      selected: val
    })
    const element = this.state.elements[val]

    if (element.containerView && element.containerView.componentDefinition && element.containerView.componentDefinition.name === 'switch-container') {
      // 在切换容器内，需要切换容器当前状态
      const index = element.containerView.config.props.children.indexOf(val)

      element.containerView.updateConfig({
        props: {
          current: element.containerView.config.props.states.list[index]
        }
      })
    }

    context.workspaceControl.selectElements([this.state.elements[val].el], true)
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
      key: element.getId(),
      value: element.getId(),
      label: element.config.props.text || element.config.title,
      tags,
      element,
      children: []
    }

    // update icon
    if (element.componentDefinition && element.componentDefinition.icon) {
      treeNodeObject.icon = <img className='item-icon' src={element.componentDefinition.icon} />

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
    const view = context.getComponentView(data.element)
    const lockStatus = !view.config.style.locked
    view.updateStyleConfig({ locked: lockStatus })
    context.workspaceControl.selectElements([view.el])
  }

  toggleVisible = (data) => {
    const view = context.getComponentView(data.element)
    const visible = !view.config.style.visible
    view.updateStyleConfig({ visible })
    context.workspaceControl.selectElements([view.el])
    
    this.updateOutline()
  }

  renderFullLabel = (label, data) => {
    const { toggleLock, toggleVisible } = this
    const { visible, locked } = data.element.config.style
    return (
      <div className={'tree-label ' + (visible ? 'is-visible' : 'is-hidden') + ' ' + (locked ? 'is-locked' : '')}>
        <Space className='label-content'>
          <Text className='label-text'>{label || data.key}</Text>
          {data.tags && data.tags.map(tag => <Tag size='small' color='amber' key={tag}> {tag} </Tag>)}
        </Space>
        <Space spacing={2}>
          <Button
            className={locked ? '' : 'hover-show'}
            size='small' theme='borderless' type='tertiary' onClick={() => {
              toggleLock(data)
            }} icon={locked ? <IconLock /> : <IconUnlock />}
          />
          <Button
            className={data.element.config.style.visible ? 'hover-show' : ''}
            size='small' theme='borderless' type='tertiary' onClick={() => {
              toggleVisible(data)
            }} icon={visible ? <IconEyeOpened /> : <IconEyeClosedSolid />}
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
        context.editorView.setPositionAfter(dragNode.element, node.element)
      } else {
        // 向前拖拽
        context.editorView.setPositionBefore(dragNode.element, node.element)
      }
      // 按更新后节点关系重新更新树结构
      this.updateOutline()
    }
  }

  render () {
    const { selected, elements } = this.state
    const { renderFullLabel, onTreeDrop } = this
    const treeData = this.buildElementTree(elements)
    return (
      <Tree
        className='outline-tree'
        style={{
          height: '100%',
          overflow: 'auto'
        }}
        draggable
        value={selected}
        renderLabel={renderFullLabel}
        onDrop={onTreeDrop.bind(this)}
        onChange={(value) => {
          this.onNodeSelected(value)
        }}
        treeData={treeData}
      />
    )
  }
}

export default OutLineTree
