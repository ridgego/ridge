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
      componentTreeData: [],
      expandedKeys: [],
      elements: [],
      selected: null
    }
    context.services.outlinePanel = this
  }

  static contextType = ThemeContext

  updateOutline () {
    if (context.editorView) {
      const elements = context.editorView.getComponentViews()
      this.setState({
        elements,
        componentTreeData: this.buildElementTree(elements)
      })
    }
  }

  /**
   * 对外提供方法，工作区选择节点调用
   **/
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
    context.workspaceControl.selectElements([this.state.elements[val].el], true)
    this.setState({
      selected: val
    })
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
      label: element.config.title,
      // tags: tags ? [element.componentDefinition.title, ...tags] : [element.componentDefinition.title], 
      tags,
      view: element
    }

    // update icon
    if (element.componentDefinition && element.componentDefinition.icon) {
      treeNodeObject.icon = <img className='item-icon' src={element.componentDefinition.icon} />

      // 递归处理子节点树
      const childProps = element.componentDefinition.props.filter(p => p.type === 'children')
      if (childProps.length) {
        treeNodeObject.children = []
        for (const childProp of childProps) {
          if (element.config.props[childProp.name] && element.config.props[childProp.name].length) {
            for (let i = 0; i < element.config.props[childProp.name].length; i++) {
              const elementId = element.config.props[childProp.name][i]
              if (elementId && elements[elementId]) {
                const childTreeNode = this.getElementTree(elements[elementId], elements)
                childTreeNode.parent = treeNodeObject
                treeNodeObject.children.push(childTreeNode)
              }
            }
          }
        }
      }

      // 递归处理插槽节点
      const slotProps = element.componentDefinition.props.filter(p => p.type === 'slot')
      if (slotProps.length) {
        if (treeNodeObject.children == null) {
          treeNodeObject.children = []
        }
        for (const childProp of slotProps) {
          if (element.config.props[childProp.name] && elements[element.config.props[childProp.name]]) {
            const childTreeNode = this.getElementTree(elements[element.config.props[childProp.name]], elements, [childProp.label])
            childTreeNode.parent = treeNodeObject
            treeNodeObject.children.push(childTreeNode)
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
    const { visible, locked } = data.view.config.style
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
            className={visible ? 'hover-show' : ''}
            size='small' theme='borderless' type='tertiary' onClick={() => {
              toggleVisible(data)
            }} icon={visible ? <IconEyeOpened /> : <IconEyeClosedSolid />}
          />
        </Space>
      </div>
    )
  }

  /**
   * 拖拽 dragNode 到一个排序子节点列表之中，放置位置为dropPosition (-1为最前)
   * dropPosition: 指的是被拖拽节点在当前层级中被 drop 的位置，如插入在同级的第0个节点前则为 -1，在第0个节点后则为 1，落在其上则为 0，以此类推 为空时表示追加到最后
   */
  ordering (siblingNodes, dragNode, dropPosition) {
    const finals = []

    if (dropPosition === -1) {
      finals.push(dragNode.key)
    }

    for (let i = 0; i < siblingNodes.length; i++) {
      if (siblingNodes[i].key === dragNode.key) {
        continue
      }
      if (dropPosition === i) {
        finals.push(dragNode.key)
      }
      finals.push(siblingNodes[i].key)
    }
    if (dropPosition == null) {
      finals.push(dragNode.key)
    }
    return finals
  }

  /**
   * 树拖拽放置到目标位置
   **/
  onTreeDrop ({ event, node, dragNode, dragNodesKeys, dropPosition, dropToGap }) {
    if (dropToGap === true) {
      // 放置到节点之间
      if (node.parent === dragNode.parent) {
        // 同层次的排序
        if (node.parent == null) {
          // 1.根节点重排序
          const orders = this.ordering(this.state.componentTreeData, dragNode, dropPosition)
          context.editorView.updateChildOrder(null, orders)
        } else {
          // 2.同容器内排序
          const orders = this.ordering(node.parent.children, dragNode, dropPosition)
          context.editorView.updateChildOrder(node.parent.view, orders)
        }
      } else {
        // 3-4.跨父节点
        if (dragNode.parent) {
          // 移除之前父节点
          context.editorView.detachChildView(dragNode.view)
        }
        if (node.parent) {
          // 3.放入新容器
          const orders = this.ordering(node.parent.children, dragNode, dropPosition)
          context.editorView.updateChildOrder(node.parent.view, orders)
        } else {
          // 4.放置到根节点
          const orders = this.ordering(this.state.componentTreeData, dragNode, dropPosition)
          context.editorView.updateChildOrder(null, orders)
        }
      }
    } else {
      if (!node.view.isContainer) {
        return
      } else {
        // 0.追加到node之下
        if (dragNode.parent) {
          context.editorView.detachChildView(dragNode.view)
        }
        context.editorView.appendChild(dragNode.view, node.view)
      }
    }
    // const targetNodePos = node.pos.split('-') // 放置对比目标
    // const dragNodePos = dragNode.pos.split('-') // 拖拽的节点

    // log(node, dragNode, dropPosition, dropToGap)
    // if (dropToGap) {
    //   if (parseInt(targetNodePos[targetNodePos.length - 1]) > parseInt(dragNodePos[dragNodePos.length - 1])) { // 向后拖拽
    //     context.editorView.setPositionAfter(dragNode.element, node.element)
    //   } else {
    //     // 向前拖拽
    //     context.editorView.setPositionBefore(dragNode.element, node.element)
    //   }
    //   // 按更新后节点关系重新更新树结构
    // }
    this.updateOutline()
    context.workspaceControl.selectElements([dragNode.view.el], true)
  }

  render () {
    const { selected, componentTreeData, expandedKeys } = this.state
    const { renderFullLabel, onTreeDrop } = this
    // const treeData = this.buildElementTree(elements)
    return (
      <Tree
        className='outline-tree'
        autoExpandWhenDragEnter
        draggable
        renderLabel={renderFullLabel}
        onDrop={onTreeDrop.bind(this)}
        onChange={(value) => {
          this.onNodeSelected(value)
        }}
        onExpand={expandedKeys => {
          this.setState({
            expandedKeys
          })
        }}
        expandedKeys={expandedKeys}
        value={selected}
        treeData={componentTreeData}
      />
    )
  }
}

export default OutLineTree
