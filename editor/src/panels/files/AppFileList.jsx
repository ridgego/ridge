import React from 'react'
import trim from 'lodash/trim'
import debug from 'debug'
import { Button, Input, Tree, Dropdown, Typography, Toast, Upload, ImagePreview, Spin, Modal, Popover, Form } from '@douyinfe/semi-ui'
import { IconTick, IconFolderOpen, IconMusic, IconImage, IconExport, IconCloudUploadStroked, IconBriefStroked, IconFont, IconPlusStroked, IconCopy, IconEdit, IconPaperclip, IconFolderStroked, IconFolder, IconMoreStroked, IconDeleteStroked } from '@douyinfe/semi-icons'
import { ridge, emit, on, appService } from '../../service/RidgeEditService.js'
import { eachNode, getFileTree } from './buildFileTree.js'
import { EVENT_PAGE_OPEN, EVENT_PAGE_RENAMED, EVENT_WORKSPACE_RESET, EVENT_FILE_TREE_CHANGE } from '../../constant'
import './file-list.less'
import DialogCodeEdit from './DialogCodeEdit.jsx'
import { stringToBlob } from '../../utils/blob.js'

const trace = debug('ridge:file')
const { Text } = Typography
const JS_TEMPLATE = `
window.moduleName = {
  state: () => {
    return {
      name: ''
    }
  },
  getters: {
    hello: (state) => {
      return 'Hello ' + state.name
    }
  },
  actions: {
  }
}`
const ACCEPT_FILES = 'image/*,video/*,audio/*,.woff,.json,.css,.js'
class AppFileList extends React.Component {
  constructor () {
    super()
    this.ref = React.createRef()
    this.state = {
      currentOpenId: null,
      imagePreviewVisible: false,
      imagePreviewSrc: null,
      treeData: null,
      expandedKeys: [],
      selected: null,
      currentParent: -1,
      currentSelectedNode: null,
      createDialogShow: false,
      isCreateFile: false,

      currentEditKey: null,
      currentEditFileName: '',
      currentEditValid: true,

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
          } else if (file.mimeType.indexOf('audio') > -1) {
            file.icon = (<IconMusic style={{ color: 'var(--semi-color-text-2)' }} />)
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

    on(EVENT_WORKSPACE_RESET, () => {
      this.setState({
        currentOpenId: null
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
    const { currentEditKey } = this.state

    if (currentEditKey) {
      if (this.state.currentSelectedNode && this.state.currentSelectedNode.parentNode) {
        return this.state.currentSelectedNode.parentNode.children
      } else {
        return this.state.treeData
      }
    } else {
      if (this.state.currentSelectedNode) {
        return this.state.currentSelectedNode.children
      } else {
        return this.state.treeData
      }
    }
  }

  /**
   * 实时检查名称是否冲突，这个只更新currentEditValid状态
   */
  editLabelCheck = (val, key) => {
    const trimVal = trim(val)
    this.setState({
      currentEditFileName: trimVal
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
  confirmRename = async () => {
    if (this.state.currentEditValid) {
      const { appService } = ridge
      await appService.rename(this.state.currentEditKey, this.state.currentEditFileName)
      if (this.state.currentOpenId === this.state.currentEditKey) {
        emit(EVENT_PAGE_RENAMED, this.state.currentEditFileName)
      }
      this.setState({
        createDialogShow: false,
        currentEditFileName: '',
        currentEditValid: true,
        currentEditKey: null
      })
      Toast.success('文件已经重新命名为：' + this.state.currentEditFileName)
    }
  }

  // 新创建目录
  createDirectory = async (dir) => {
    const { appService } = ridge
    await appService.createDirectory(dir || this.getCurrentDir())
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
    }

    if (this.state.currentSelectedNode && this.state.currentSelectedNode.id === data.key) {
      this.setState({
        currentSelectedNode: null
      })
    }
    await appService.trash(data.key)
    this.setState({
      currentParent: -1
    })
    Toast.success('文件已经删除')
  }

  showCreateDialog = (isFile, createFileType) => {
    this.setState({
      currentEditKey: null,
      currentEditFileName: '',
      createDialogShow: true,
      createFileType,
      isCreateFile: isFile
    })
  }

  confirmCreateFile = async () => {
    const { appService } = ridge
    const { isCreateFile, createFileType } = this.state
    if (isCreateFile) {
      if (createFileType === 'js') {
        await appService.createFile(this.state.currentParent, this.state.currentEditFileName, stringToBlob(JS_TEMPLATE, 'text/javascript'))
      } else if (createFileType === 'css') {
        await appService.createFile(this.state.currentParent, this.state.currentEditFileName, stringToBlob('', 'text/css'))
      } else {
        await appService.createPage(this.state.currentParent, this.state.currentEditFileName)
      }
    } else {
      await appService.createDirectory(this.state.currentParent, this.state.currentEditFileName)
    }

    this.setState({
      createDialogShow: false
    })
  }

  createPage = async (dir) => {
    const { appService } = ridge
    const newPage = await appService.createPage(dir || this.getCurrentDir())
    this.setState({
      currentEditKey: newPage.id,
      currentEditValue: newPage.name,
      currentEditValid: true
    })
    Toast.success('文件创建完成')
  }

  rename = async (node) => {
    this.setState({
      createDialogShow: true,
      currentParent: node.parent,
      currentEditKey: node.key,
      currentEditFileName: node.label,
      currentEditValid: true
    })
  }

  copy = async node => {
    const { appService } = ridge
    await appService.copy(node.key)
    Toast.success('文件复制完成')
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
      // const otherImageFiles = this.state.files.filter(file => {
      //   if (file.mimeType && file.mimeType.indexOf('image/') > -1 && file.id !== node.key) {
      //     return true
      //   } else {
      //     return false
      //   }
      // })
      // const srcList = []

      // srcList.push(await ridge.appService.store.getItem(node.key))
      // for (const imageFile of otherImageFiles) {
      //   srcList.push(await ridge.appService.store.getItem(imageFile.id))
      // }

      this.setState({
        imagePreviewSrc: node.dataUrl,
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

    if (ridge.pageElementManager) {
      ridge.pageElementManager.updateImportedStyle()
      ridge.pageElementManager.updateImportedJS()
    }
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
      const result = await appService.createFile(dir || this.getCurrentDir(), file.name, file)
      if (!result) {
        errors.push(file)
      }
    }

    Toast.success('文件上传完成')

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
      MORE_MENUS.push(
        <Dropdown.Item
          icon={<i class='bi bi-filetype-js' />} onClick={() => {
            this.setState({
              expandedKeys: [data.key, ...this.state.expandedKeys],
              currentParent: data.key
            })

            this.showCreateDialog(true, 'js')
          }}
        >
          创建程序文件
        </Dropdown.Item>
      )
      MORE_MENUS.push(
        <Dropdown.Item
          icon={<i class='bi bi-filetype-css' />} onClick={() => {
            this.setState({
              expandedKeys: [data.key, ...this.state.expandedKeys],
              currentParent: data.key
            })

            this.showCreateDialog(true, 'css')
          }}
        >
          创建样式文件
        </Dropdown.Item>
      )
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
      <div className={'tree-label' + (currentOpenId === data.key ? ' opened' : '')}>
        <Text ellipsis={{ showTooltip: true }} style={{ width: 'calc(100% - 48px)' }} className='label-content'>{label}</Text>
        <Dropdown
          trigger='click' showTick
          render={<Dropdown.Menu>{MORE_MENUS}</Dropdown.Menu>}
        >
          <Button className='more-button' size='small' theme='borderless' type='tertiary' icon={<IconMoreStroked rotate={90} />} />
        </Dropdown>
      </div>

    // <div>
    //   {data.key === currentEditKey &&
    //     <Input
    //       validateStatus={!currentEditValid ? 'error' : 'default'}
    //       onChange={(val) => {
    //         this.editLabelCheck(val, currentEditKey)
    //       }} size='small' defaultValue={label}
    //       suffix={<IconTick style={{ cursor: 'pointer' }} onClick={() => this.checkUpdateEditName()} color={!currentEditValid ? 'error' : 'default'} />}
    //     />}
    //   {data.key !== currentEditKey &&
    //     }
    // </div>
    )
  }

  renderCreateModal = () => {
    const { state, confirmCreateFile, confirmRename } = this
    const { createDialogShow, isCreateFile, currentEditKey, currentEditValid, currentParent, currentSelectedNode, currentEditFileName } = state

    let parentPaths = '/'
    if (currentEditKey) {
      if (currentSelectedNode.parentNode) {
        parentPaths = currentSelectedNode.parentNode.path
      }
    } else {
      if (currentSelectedNode) {
        if (currentSelectedNode.type === 'directory') {
          parentPaths = currentSelectedNode.path
        } else if (currentSelectedNode.parentNode) {
          parentPaths = currentSelectedNode.parentNode.path
        }
      }
    }

    return (
      <Modal
        title={currentEditKey ? '重命名' : (isCreateFile ? '创建新的页面' : '新增目录')}
        visible={createDialogShow}
        onOk={() => {
          if (this.state.currentEditValid) {
            if (currentEditKey) {
              confirmRename()
            } else {
              confirmCreateFile()
            }
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
            initValue={currentEditFileName}
            validateStatus={currentEditValid ? '' : 'error'}
            label='名称' onChange={val => {
              this.editLabelCheck(val, currentEditKey)
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
