import React from 'react'
import trim from 'lodash/trim'
import { Button, Input, Tree } from '@douyinfe/semi-ui'
import { IconPlusStroked, IconImageStroked, IconFolderStroked, IconFolder } from '@douyinfe/semi-icons'

class AppFileList extends React.Component {
  constructor () {
    super()
    this.ref = React.createRef()
    this.state = {
      files: [],
      treeData: [],
      selected: null,
      currentEditKey: null,
      currentEditValid: true,
      currentEditValue: ''
    }
  }

  getFileTree (files) {
    const roots = files.filter(file => file.parent === -1).map(file => {
      const treeNode = {
        key: file.id,
        label: file.name,
        value: file.id
      }
      if (file.type === 'directory') {
        treeNode.children = this.buildDirTree(file, files)
        if (treeNode.children.length === 0) {
          treeNode.icon = (<IconFolder style={{ color: 'var(--semi-color-text-2)' }} />)
        }
      }
      return treeNode
    })
    return roots
  }

  buildDirTree (dir, files) {
    const children = files.filter(file => file.parent === dir.id).map(file => {
      const treeNode = {
        key: file.id,
        label: file.name,
        value: file.id
      }
      if (file.type === 'directory') {
        treeNode.children = this.buildDirTree(file, files)
        if (treeNode.children.length === 0) {
          treeNode.icon = (<IconFolder style={{ color: 'var(--semi-color-text-2)' }} />)
        }
      }
      return treeNode
    })
    return children
  }

  componentDidMount () {
    this.updateFileTree()
  }

  async updateFileTree () {
    if (window.Ridge) {
      const { appService } = window.Ridge
      const files = await appService.getFiles(this.props.filter)
      const treeData = this.getFileTree(files)
      this.setState({
        treeData,
        files
      })
    }
  }

  selectNode (val) {
    this.setState({
      selected: val
    })
    if (val !== this.state.currentEditKey) {
      if (this.state.currentEditKey) {
        this.checkUpdateEditName()
      }
      this.setState({
        currentEditKey: null
      })
    }
  }

  /**
   * 获取当前目录， 未选择则是根目录，选择了就是当前文件所在目录
   * @returns
   */
  getCurrentDir () {
    const currentNode = this.state.files.filter(file => file.id === this.state.selected)[0]

    if (currentNode == null) {
      return -1
    } else {
      if (currentNode.type !== 'directory') {
        return currentNode.parent
      } else {
        return currentNode.id
      }
    }
  }

  /**
   * 实时检查名称是否冲突
   */
  editLabelCheck = val => {
    this.setState({
      currentEditValue: trim(val)
    })
    if (trim(val) === '') {
      this.setState({
        currentEditValid: false
      })
    } else {
      const currentNode = this.state.files.filter(file => file.id === this.state.currentEditKey)[0]
      const siblings = this.state.files.filter(file => {
        return (file.parent === currentNode.parent && file.id !== this.state.currentEditKey && file.name === trim(val))
      })
      if (siblings.length === 0) {
        this.setState({
          currentEditValid: true
        })
      } else {
        this.setState({
          currentEditValid: false
        })
      }
    }
  }

  checkUpdateEditName = async () => {
    if (this.state.currentEditValid) {
      if (window.Ridge) {
        const { appService } = window.Ridge
        await appService.rename(this.state.currentEditKey, this.state.currentEditValue)
        this.updateFileTree()
      }
      this.setState({
        currentEditValid: true
      })
    }
  }

  createDirectory = async () => {
    if (window.Ridge) {
      const { appService } = window.Ridge
      await appService.createDirectory(this.getCurrentDir())
      await this.updateFileTree()
    }
  }

  renderFullLabel = (label, data) => {
    const { currentEditKey, currentEditValid } = this.state
    return (
      <div>
        {data.key === currentEditKey && <Input
          validateStatus={!currentEditValid ? 'error' : 'default'}
          onChange={(val) => {
            this.editLabelCheck(val)
          }} size='small' defaultValue={label}
                                        />}
        {data.key !== currentEditKey && label}
      </div>
    )
  }

  onEditNode = (event, node) => {
    this.setState({
      currentEditKey: node.key,
      currentEditValue: node.label,
      currentEditValid: true
    })
  }

  render () {
    const { treeData, selected } = this.state
    const { createDirectory, renderFullLabel, onEditNode } = this

    return (
      <>
        <div className='file-actions'>
          <Button icon={<IconPlusStroked />} size='small' type='primary' />
          <Button icon={<IconImageStroked />} size='small' theme='borderless' type='tertiary' />
          <Button icon={<IconFolderStroked />} onClick={createDirectory} size='small' theme='borderless' type='tertiary' />
        </div>
        <Tree
          directory
          renderLabel={renderFullLabel}
          onDoubleClick={onEditNode}
          value={selected}
          onChange={(value) => {
            this.selectNode(value)
          }}
          treeData={treeData}
        />

      </>
    )
  }
}

export default AppFileList
