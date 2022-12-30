import React from 'react'
import trim from 'lodash/trim'
import { Button, Input, Tree, Dropdown, Typography, Toast, Upload } from '@douyinfe/semi-ui'
import { IconImage, IconEditStroked, IconFont, IconPlusStroked, IconPaperclip, IconFolderStroked, IconFolder, IconMoreStroked, IconDeleteStroked } from '@douyinfe/semi-icons'
import { emit } from '../utils/events'
import { EVENT_PAGE_OPEN } from '../constant'
import '../css/app-file-panel.less'

const { Text } = Typography

const ACCEPT_FILES = '.png,.jpg,.gif,.woff,.svg'
class AppFileList extends React.Component {
  constructor () {
    super()
    this.ref = React.createRef()
    this.state = {
      expandedKeys: [],
      files: [],
      treeData: [],
      selected: null,
      currentEditKey: null,
      currentEditValid: true,
      currentEditValue: ''
    }
  }

  getFileTree (files) {
    const roots = files.filter(file => file.parent === -1).map(file => this.buildFileTree(file, files)).sort((a, b) => {
      return a.label > b.label ? 1 : -1
    })
    return roots
  }

  buildFileTree (file, files) {
    const treeNode = {
      key: file.id,
      label: file.name,
      type: file.type,
      parent: file.parent,
      value: file.id
    }
    if (file.mimeType) {
      if (file.mimeType === 'application/font-woff') {
        treeNode.icon = (<IconFont />)
      }
      if (file.mimeType.indexOf('image/') > -1) {
        treeNode.icon = (<IconImage />)
      }
    }

    if (treeNode.type === 'directory') {
      const children = files.filter(item => item.parent === file.id)

      treeNode.children = children.map(child => this.buildFileTree(child, files)).sort((a, b) => {
        return a.label > b.label ? 1 : -1
      })
      if (treeNode.children.length === 0) {
        treeNode.icon = (<IconFolder style={{ color: 'var(--semi-color-text-2)' }} />)
      }
    }
    return treeNode
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
   * 实时检查名称是否冲突，这个只更新currentEditValid状态
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

  /**
   * 更新并保存命名修改
   */
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

  // 新创建目录
  createDirectory = async (dir) => {
    if (window.Ridge) {
      const { appService } = window.Ridge
      await appService.createDirectory(dir || this.getCurrentDir())
      await this.updateFileTree()
    }
  }

  remove = async (data) => {
    if (window.Ridge) {
      const { appService } = window.Ridge
      await appService.trash(data.key)
      await this.updateFileTree()
    }
  }

  createPage = async (dir) => {
    if (window.Ridge) {
      const { appService } = window.Ridge
      await appService.createPage(dir || this.getCurrentDir())
      await this.updateFileTree()
    }
  }

  rename = async (node) => {
    this.setState({
      currentEditKey: node.key,
      currentEditValue: node.label,
      currentEditValid: true
    })
  }

  open = async (node) => {
    if (node.type === 'page') {
      emit(EVENT_PAGE_OPEN, node.key)
    }
  }

  move = async (node, dragNode, dropToGap) => {
    let parentId = -1

    if (dropToGap === false) { // 放置于node内
      if (node.type === 'directory') {
        parentId = node.key
      } else {
        parentId = node.parent
      }
    } else {
      parentId = node.parent
    }
    if (window.Ridge) {
      const { appService } = window.Ridge
      const moveResult = await appService.move(dragNode.key, parentId)
      if (moveResult) {
        await this.updateFileTree()
      } else {
        Toast.warning({
          content: '目录移动错误：存在同名的文件',
          duration: 3
        })
      }
    }
  }

  fileUpload = async (files, dir) => {
    const { appService } = window.Ridge
    const errors = []
    for (const file of files) {
      const result = await appService.createFile(file, dir || this.getCurrentDir())
      if (!result) {
        errors.push(file)
      }
    }
    await this.updateFileTree()

    if (errors.length) {
      Toast.warning({
        content: '文件添加错误：存在相同名称文件',
        duration: 3
      })
    }
  }

  renderFullLabel = (label, data) => {
    const { currentEditKey, currentEditValid } = this.state
    const MORE_MENUS = []

    if (data.type === 'directory') {
      MORE_MENUS.push(
        <Dropdown.Item
          icon={<IconFolderStroked />} onClick={() => {
            this.setState({
              expandedKeys: [data.key, ...this.state.expandedKeys]
            })
            this.createDirectory(data.key)
          }}
        >
          创建子目录
        </Dropdown.Item>
      )
      MORE_MENUS.push(
        <Dropdown.Item
          icon={<IconPlusStroked />} onClick={() => {
            this.setState({
              expandedKeys: [data.key, ...this.state.expandedKeys]
            })
            this.createPage(data.key)
          }}
        >
          创建空页面
        </Dropdown.Item>
      )
      MORE_MENUS.push(
        <Dropdown.Item
          icon={<IconPaperclip />}
        >
          <Upload
            multiple showUploadList={false} uploadTrigger='custom' onFileChange={files => {
              this.fileUpload(files, data.key)
            }} accept={ACCEPT_FILES}
          >
            上传图片/资源
          </Upload>
        </Dropdown.Item>
      )

      MORE_MENUS.push(<Dropdown.Divider />)
    } else {
      MORE_MENUS.push(
        <Dropdown.Item onClick={() => {
          this.open(data)
        }}
        >打开
        </Dropdown.Item>
      )
    }
    MORE_MENUS.push(
      <Dropdown.Item
        icon={<IconEditStroked />} onClick={() => {
          this.rename(data)
        }}
      >重命名
      </Dropdown.Item>
    )
    MORE_MENUS.push(
      <Dropdown.Item
        type='danger'
        icon={<IconDeleteStroked />}
        onClick={() => {
          this.remove(data)
        }}
      >删除
      </Dropdown.Item>
    )
    return (
      <div>
        {data.key === currentEditKey && <Input
          validateStatus={!currentEditValid ? 'error' : 'default'}
          onChange={(val) => {
            this.editLabelCheck(val)
          }} size='small' defaultValue={label}
                                        />}
        {data.key !== currentEditKey &&
          <div className='tree-label'>
            <Text className='label-content'>{label}</Text>
            <Dropdown
              trigger='click' showTick
              render={<Dropdown.Menu>{MORE_MENUS}</Dropdown.Menu>}
            >
              <Button className='more-button' size='small' theme='borderless' type='tertiary' icon={<IconMoreStroked rotate={90} />} />
            </Dropdown>
          </div>}
      </div>
    )
  }

  render () {
    const { treeData, selected, expandedKeys } = this.state
    const { createDirectory, renderFullLabel, createPage } = this

    return (
      <>
        <div className='file-actions'>
          <div className='align-right'>
            <Button icon={<IconPlusStroked />} size='small' theme='borderless' type='tertiary' onClick={createPage} />
            <Upload
              multiple showUploadList={false} uploadTrigger='custom' onFileChange={files => {
                this.fileUpload(files)
              }} accept={ACCEPT_FILES}
            >
              <Button icon={<IconPaperclip />} size='small' theme='borderless' type='tertiary' />
            </Upload>
            <Button icon={<IconFolderStroked />} size='small' theme='borderless' type='tertiary' onClick={createDirectory} />
          </div>
        </div>
        <Tree
          className='file-tree'
          directory
          draggable
          expandedKeys={expandedKeys}
          renderLabel={renderFullLabel}
          value={selected}
          treeData={treeData}
          onDrop={({ node, dragNode, dropPosition, dropToGap }) => {
            console.log(node, dragNode, dropPosition, dropToGap)
            this.move(node, dragNode, dropToGap)
          }}
          onExpand={expandedKeys => {
            this.setState({
              expandedKeys
            })
          }}
          onDoubleClick={(ev, node) => {
            this.open(node)
          }}
          onChange={(value) => {
            this.selectNode(value)
          }}
        />

      </>
    )
  }
}

export default AppFileList
