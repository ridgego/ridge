import React from 'react'
import trim from 'lodash/trim'
import debug from 'debug'
import { Button, Input, Tree, Dropdown, Typography, Toast, Upload, ImagePreview, Spin, Modal, Popover, Form } from '@douyinfe/semi-ui'
import { IconTick, IconFolderOpen, IconImage, IconExport, IconCloudUploadStroked, IconBriefStroked, IconFont, IconPlusStroked, IconCopy, IconEdit, IconPaperclip, IconFolderStroked, IconFolder, IconMoreStroked, IconDeleteStroked } from '@douyinfe/semi-icons'
import { ridge, emit, on, appService } from '../../service/RidgeEditService.js'
import { eachNode, getFileTree } from './buildFileTree.js'
import { EVENT_PAGE_OPEN, EVENT_PAGE_RENAMED, EVENT_WORKSPACE_RESET, EVENT_FILE_TREE_CHANGE } from '../../constant'
import './file-list.less'
import DialogCodeEdit from './DialogCodeEdit.jsx'

const trace = debug('ridge:file')
const { Text } = Typography

const ACCEPT_FILES = '.png,.jpg,.gif,.woff,.svg,.json,.css,.js'
class AppFileList extends React.Component {
  constructor () {
    super()
    this.ref = React.createRef()
    this.state = {
      currentOpenId: null,
      imagePreviewVisible: false,
      imagePreviewSrc: null,
      expandedKeys: [],
      treeData: null,
      selected: null,
      currentEditKey: null,
      currentParent: -1,
      currentSelectedNode: null,
      createDialogShow: false,
      isCreateFile: false,
      newFileName: '',
      currentEditValid: true,
      currentEditValue: '',
      codeEditNodeId: null,
      codeEditType: '',
      codeEditText: '',
      codeEditVisible: false
    }
  }

  componentDidMount () {
    // this.updateFileTree()
    on(EVENT_FILE_TREE_CHANGE, treeData => {
      eachNode(treeData, file => {
        if (file.mimeType) {
          if (file.mimeType === 'application/font-woff') {
            file.icon = (<IconFont style={{ color: 'var(--semi-color-text-2)' }} />)
          } else if (file.dataUrl) {
            file.icon = <Popover showArrow content={<img className='image-full' src={file.dataUrl} />}><img className='icon-image' src={file.dataUrl} /></Popover>
          } else {
            file.icon = <IconBriefStroked style={{ color: 'var(--semi-color-text-2)' }} />
          }
        }
        if (file.type === 'directory') {
          file.icon = (<IconFolder style={{ color: 'var(--semi-color-text-2)' }} />)
        }
      })
      this.setState({
        treeData
      })
    })
  }

  selectNode (node) {
    this.setState({
      currentSelectedNode: node,
      selected: node.key
    })
  }

  /**
   * 获取当前目录， 未选择则是根目录，选择了就是当前文件所在目录
   * @returns
   */
  getCurrentDir () {
    if (this.state.currentSelectedNode) {
      if (this.state.currentSelectedNode.type === 'directory') {
        return this.state.currentSelectedNode.key
      } else {
        return this.state.currentSelectedNode.parent
      }
    } else {
      return -1
    }
  }

  getCurrentSiblings () {
    if (this.state.currentSelectedNode && this.state.currentSelectedNode.parentNode) {
      return this.state.currentSelectedNode.parentNode.children
    } else {
      return this.state.treeData
    }
  }

  /**
   * 实时检查名称是否冲突，这个只更新currentEditValid状态
   */
  editLabelCheck = (val, key) => {
    const trimVal = trim(val)
    this.setState({
      currentEditValue: trimVal
    })
    if (trimVal === '') {
      this.setState({
        currentEditValid: false
      })
    } else {
      const siblings = this.getCurrentSiblings().filter(sbl => {
        return sbl.label === trimVal && sbl.key !== key
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

  exportPage = (data) => {
    trace('导出页面', data)
    ridge.backUpService.exportFileArchive(data.key)
  }

  /**
   * 更新并保存命名修改
   */
  checkUpdateEditName = async () => {
    if (this.state.currentEditValid) {
      const { appService } = ridge
      await appService.rename(this.state.currentEditKey, this.state.currentEditValue)
      if (this.state.currentOpenId === this.state.currentEditKey) {
        emit(EVENT_PAGE_RENAMED, this.state.currentEditValue)
      }
      this.setState({
        currentEditValid: true,
        currentEditKey: null
      })
    }
  }

  // 新创建目录
  createDirectory = async (dir) => {
    const { appService } = ridge
    await appService.createDirectory(dir || this.getCurrentDir())
    await this.updateFileTree()
  }

  /**
   * 删除指定的资源
   */
  remove = async (data) => {
    const { appService } = ridge

    if (this.state.currentOpenId &&
      (
        data.key === this.state.currentOpenId ||
        (data.type === 'directory' && await appService.isParent(data.key, this.state.currentOpenId))
      )
    ) {
      emit(EVENT_WORKSPACE_RESET)
      this.setState({
        currentOpenId: null
      })
    }

    await appService.trash(data.key)
    this.setState({
      currentParent: -1
    })
    await this.updateFileTree()
  }

  showCreateDialog = (isFile) => {
    this.setState({
      currentEditKey: null,
      createDialogShow: true,
      isCreateFile: isFile,
      newFileName: ''
    })
  }

  confirmCreateFile = async () => {
    const { appService } = ridge
    if (this.state.isCreateFile) {
      await appService.createPage(this.state.currentParent, this.state.currentEditValue)
    } else {
      await appService.createDirectory(this.state.currentParent, this.state.currentEditValue)
    }
    // await this.updateFileTree()

    this.setState({
      createDialogShow: false
    })
  }

  createPage = async (dir) => {
    const { appService } = ridge
    const newPage = await appService.createPage(dir || this.getCurrentDir())
    // await this.updateFileTree()
    this.setState({
      currentEditKey: newPage.id,
      currentEditValue: newPage.name,
      currentEditValid: true
    })
  }

  rename = async (node) => {
    this.setState({
      currentParent: node.parent,
      currentEditKey: node.key,
      currentEditValue: node.label,
      currentEditValid: true
    })
  }

  copy = async node => {
    const { appService } = ridge
    await appService.copy(node.key)
    // await this.updateFileTree()
  }

  open = async (node) => {
    if (node.type === 'page') {
      if (this.state.currentOpenId === node.key) {
        return
      }
      emit(EVENT_PAGE_OPEN, node.key)
      this.setState({
        currentOpenId: node.key
      })
    } else if (node.mimeType && node.mimeType.indexOf('image/') > -1) {
      const otherImageFiles = this.state.files.filter(file => {
        if (file.mimeType && file.mimeType.indexOf('image/') > -1 && file.id !== node.key) {
          return true
        } else {
          return false
        }
      })
      const srcList = []

      srcList.push(await ridge.appService.store.getItem(node.key))
      for (const imageFile of otherImageFiles) {
        srcList.push(await ridge.appService.store.getItem(imageFile.id))
      }

      this.setState({
        imagePreviewSrc: srcList,
        imagePreviewVisible: true
      })
    } else if (node.mimeType && (node.mimeType === 'text/css' || node.mimeType === 'text/javascript')) {
      this.setState({
        codeEditType: node.mimeType,
        codeEditNodeId: node.key,
        codeEditText: node.textContent,
        codeEditVisible: true
      })
    }
  }

  async completeCodeEdit (code) {
    const {
      codeEditNodeId,
      codeEditType
    } = this.state
    await appService.updateFileContent(codeEditNodeId, code, codeEditType)

    this.setState({
      codeEditVisible: false
    })
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
    const { appService } = ridge
    const moveResult = await appService.move(dragNode.key, parentId)
    if (moveResult) {
      // await this.updateFileTree()
    } else {
      Toast.warning({
        content: '目录移动错误：存在同名的文件',
        duration: 3
      })
    }
  }

  fileUpload = async (files, dir) => {
    const { appService } = window.Ridge
    const errors = []
    for (const file of files) {
      const result = await appService.createFile(dir || this.getCurrentDir(), file, file.name)
      if (!result) {
        errors.push(file)
      }
    }

    if (errors.length) {
      Toast.warning({
        content: '文件添加错误：存在相同名称文件',
        duration: 3
      })
    }
  }

  renderFullLabel = (label, data) => {
    const { currentEditKey, currentEditValid, currentOpenId } = this.state
    const MORE_MENUS = []

    if (data.type === 'directory') {
      MORE_MENUS.push(
        <Dropdown.Item
          icon={<IconBriefStroked />} onClick={() => {
            this.setState({
              expandedKeys: [data.key, ...this.state.expandedKeys],
              currentParent: data.key
            })

            this.showCreateDialog(true)
          }}
        >
          创建空页面
        </Dropdown.Item>
      )
      MORE_MENUS.push(
        <Dropdown.Item
          icon={<IconFolderStroked />} onClick={() => {
            this.setState({
              expandedKeys: [data.key, ...this.state.expandedKeys],
              currentParent: data.key
            })
            this.showCreateDialog(false)
          }}
        >
          创建子目录
        </Dropdown.Item>
      )
      MORE_MENUS.push(
        <Dropdown.Item
          icon={<IconCloudUploadStroked />}
        >
          <Upload
            multiple showUploadList={false} uploadTrigger='custom' onFileChange={files => {
              this.fileUpload(files, data.key)
            }} accept={ACCEPT_FILES}
          >
            上传文件
          </Upload>
        </Dropdown.Item>
      )
      MORE_MENUS.push(<Dropdown.Divider />)
    } else {
      MORE_MENUS.push(
        <Dropdown.Item
          icon={<IconFolderOpen />} onClick={() => {
            this.open(data)
          }}
        >打开
        </Dropdown.Item>
      )
      MORE_MENUS.push(
        <Dropdown.Item
          icon={<IconCopy />} onClick={() => {
            this.copy(data)
          }}
        >复制页面
        </Dropdown.Item>
      )
      MORE_MENUS.push(
        <Dropdown.Item
          icon={<IconExport />} onClick={() => {
            this.exportPage(data)
          }}
        >导出
        </Dropdown.Item>
      )
    }
    MORE_MENUS.push(
      <Dropdown.Item
        icon={<IconEdit />} onClick={() => {
          this.rename(data)
        }}
      >重命名
      </Dropdown.Item>
    )
    MORE_MENUS.push(<Dropdown.Divider />)
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
        {data.key === currentEditKey &&
          <Input
            validateStatus={!currentEditValid ? 'error' : 'default'}
            onChange={(val) => {
              this.editLabelCheck(val, currentEditKey)
            }} size='small' defaultValue={label}
            suffix={<IconTick style={{ cursor: 'pointer' }} onClick={() => this.checkUpdateEditName()} color={!currentEditValid ? 'error' : 'default'} />}
          />}
        {data.key !== currentEditKey &&
          <div className={'tree-label' + (currentOpenId === data.key ? ' opened' : '')}>
            <Text ellipsis={{ showTooltip: true }} style={{ width: 'calc(100% - 48px)' }} className='label-content'>{label}</Text>
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

  renderCreateModal = () => {
    const { state, confirmCreateFile } = this
    const { createDialogShow, isCreateFile, currentEditValid, currentParent, currentSelectedNode } = state

    let parentPaths = '/'
    if (currentSelectedNode) {
      if (currentSelectedNode.type === 'directory') {
        parentPaths = currentSelectedNode.path
      } else if (currentSelectedNode.parentNode) {
        parentPaths = currentSelectedNode.parentNode.path
      }
    }

    return (
      <Modal
        title={isCreateFile ? '创建新的页面' : '新增目录'}
        visible={createDialogShow}
        onOk={() => {
          if (trim(this.state.newFileName) === '') {
            this.setState({
              currentEditValid: false
            })
          } else if (this.state.currentEditValid) {
            confirmCreateFile()
          }
        }}
        onCancel={() => {
          this.setState({
            createDialogShow: false
          })
        }}
      >
        <Form
          labelPosition='left'
          labelAlign='right'
          labelWidth={80}
        >
          <Form.Input disabled label='所在目录' initValue={parentPaths} />
          <Form.Input
            validateStatus={currentEditValid ? '' : 'error'}
            label='名称' onChange={val => {
              this.editLabelCheck(val)
              this.setState({
                newFileName: val
              })
            }}
          />
        </Form>
      </Modal>
    )
  }

  render () {
    const { renderFullLabel, showCreateDialog, renderCreateModal, state } = this
    const { treeData, currentSelectedNode, expandedKeys, imagePreviewSrc, imagePreviewVisible, codeEditText, codeEditVisible, codeEditType } = state

    return (
      <>
        <div className='file-actions'>
          <div className='align-right'>
            <Button icon={<IconBriefStroked />} size='small' theme='borderless' type='tertiary' onClick={() => showCreateDialog(true)} />
            <Upload
              multiple showUploadList={false} uploadTrigger='custom' onFileChange={files => {
                this.fileUpload(files)
              }} accept={ACCEPT_FILES}
            >
              <Button icon={<IconCloudUploadStroked />} size='small' theme='borderless' type='tertiary' />
            </Upload>
            <Button icon={<IconFolderStroked />} size='small' theme='borderless' type='tertiary' onClick={() => showCreateDialog(false)} />
          </div>
        </div>
        <ImagePreview
          src={imagePreviewSrc} visible={imagePreviewVisible} onVisibleChange={() => {
            this.setState({
              imagePreviewVisible: false
            })
          }}
        />
        <DialogCodeEdit
          value={codeEditText} visible={codeEditVisible} lang='css' onChange={code => {
            this.completeCodeEdit(code)
          }}
          type={codeEditType}
          onClose={() => {
            this.setState({
              codeEditVisible: false
            })
          }}
        />
        {renderCreateModal()}
        {treeData &&
          <Tree
            className='file-tree'
            directory
            draggable
            expandedKeys={expandedKeys}
            renderLabel={renderFullLabel}
            value={currentSelectedNode}
            treeData={treeData}
            onDrop={({ node, dragNode, dropPosition, dropToGap }) => {
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
            onChangeWithObject
            onChange={(treeNode) => {
              this.selectNode(treeNode)
            }}
          />}
        {!treeData && <div className='tree-loading'><Spin size='middle' /></div>}
      </>
    )
  }
}

export default AppFileList
