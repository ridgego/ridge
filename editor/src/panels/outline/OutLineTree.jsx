import React from 'react'
import Debug from 'debug'
import { Tree, Space, Typography, Button, Tag, Toast } from '@douyinfe/semi-ui'
import * as SemiIcons from '@douyinfe/semi-icons'
import './outline.less'
import context from '../../service/RidgeEditorContext.js'
import { ThemeContext } from '../movable/MoveablePanel.jsx'

const { IconUnlock, IconLock, IconEyeOpened, IconEyeClosedSolid } = SemiIcons
const { Text } = Typography
const debug = Debug('ridge:outline')

class OutLineTree extends React.Component {
  constructor () {
    super()
    this.state = {
      componentTreeData: [],
      expandedKeys: [],
      selected: null
    }
    context.services.outlinePanel = this
  }

  static contextType = ThemeContext

  updateOutline (reset) {
    if (reset) {
      this.setState({
        expandedKeys: [],
        selected: null
      })
    }
    if (context.editorComposite) {
      const componentTreeData = this.buildElementTree(context.editorComposite.children)

      debug('updateOutline', componentTreeData)
      this.setState({
        componentTreeData
      })
    }
  }

  /**
   * 对外提供方法，工作区选择节点调用
   **/
  setCurrentNode (node) {
    if (node) {
      let treeNode = this.findNode(this.state.componentTreeData, node.getId())
      const keys = []

      while (treeNode) {
        keys.push(treeNode.key)
        treeNode = treeNode.parent
      }

      this.setState({
        selected: node.getId(),
        expandedKeys: Array.from(new Set([...keys, ...this.state.expandedKeys]))
      })
    } else {
      this.setState({
        selected: null
      })
    }
  }

  findNode (treeData, key) {
    for (const node of treeData) {
      if (node.key === key) {
        return node
      }
      if (node.children) {
        const c = this.findNode(node.children, key)
        if (c) {
          return c
        }
      }
    }
  }

  onNodeSelected (val) {
    const node = context.getNode(val)
    if (node && node.el) {
      context.workspaceControl.selectElements([node.el], true)
    }
    this.setState({
      selected: val
    })
  }

  buildElementTree (elements) {
    const treeData = []
    for (const element of elements) {
      treeData.push(this.getElementTree(element))
    }
    return treeData
  }

  /**
   * 根据节点列表转换为树结构
   **/
  getElementTree (element) {
    const treeNodeObject = {
      key: element.getId(),
      value: element.getId(),
      label: element.config.title,
      element
    }
    // update icon
    if (element.componentDefinition && element.componentDefinition.icon) {
      treeNodeObject.icon = <img className='item-icon' src={element.componentDefinition.icon} />
    }

    if (element.children) {
      treeNodeObject.children = element.children.map(child => {
        return {
          ...this.getElementTree(child),
          parent: treeNodeObject
        }
      })
    }
    return treeNodeObject
  }

  toggleLock = (data) => {
    const view = context.getNode(data.element)
    const lockStatus = !view.config.style.locked
    view.updateStyleConfig({ locked: lockStatus })
    context.workspaceControl.selectElements([view.el])
  }

  toggleVisible = (data) => {
    const view = context.getNode(data.element)
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
          <Text className='label-text'>{label ?? data.key}</Text>
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
   * 拖拽 dragNode 到一个排序子节点列表之中, 放置到node之前(-1)或之后(1)
   */
  ordering (siblingNodes, dragNode, node, beforeOrAfter) {
    const finals = []
    for (let i = 0; i < siblingNodes.length; i++) {
      if (siblingNodes[i].key === node.key) {
        if (beforeOrAfter === -1) {
          finals.push(dragNode.key)
          finals.push(node.key)
        } else if (beforeOrAfter === 1) {
          finals.push(node.key)
          finals.push(dragNode.key)
        }
      } else if (siblingNodes[i].key !== dragNode.key) {
        finals.push(siblingNodes[i].key)
      }
    }
    return finals
  }

  /**
   * 树拖拽放置到目标位置
   **/
  onTreeDrop ({ event, node, dragNode, dragNodesKeys, dropPosition, dropToGap }) {
    // 首先根据dropPosition和node.pos计算出来目标位置相对于node的前后关系,直接用dropPosition存在问题
    const dropPos = node.pos.split('-')
    const beforeOrAfter = dropPosition - Number(dropPos[dropPos.length - 1])
    const targetParent = node.parent ? node.parent.element : context.editorComposite
    const dragParent = dragNode.parent ? dragNode.parent.element : context.editorComposite

    if (dropToGap === true) {
      const siblings = node.parent ? node.parent.children : this.state.componentTreeData
      const orders = this.ordering(siblings, dragNode, node, beforeOrAfter)
      // removeChild
      if (targetParent !== dragParent) {
        dragParent.removeChild(dragNode.element)
      }
      // appendChild
      if (orders.length !== siblings.length) {
        targetParent.appendChild(dragNode.element)
      }
      targetParent.updateChildList(orders)
    } else {
      if (node.element.children == null) {
        Toast.warning({
          content: '目标节点无法再放入子节点',
          duration: 3
        })
        return
      } else {
        dragParent.removeChild(dragNode.element)
        node.element.appendChild(dragNode.element)
      }
    }
    this.updateOutline()
    context.workspaceControl.selectElements([dragNode.element.el], true)
  }

  render () {
    const { selected, componentTreeData, expandedKeys } = this.state
    const { renderFullLabel, onTreeDrop } = this
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
