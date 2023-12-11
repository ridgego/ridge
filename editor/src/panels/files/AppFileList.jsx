import React from 'react'
import debug from 'debug'

import { Button, Input, Tree, Dropdown, Typography, Toast, Upload, ImagePreview, Spin, Modal, Popover, Form } from '@douyinfe/semi-ui'
import { IconPlus, IconImport, IconSetting, IconFolderOpen, IconMusic, IconImage, IconExport, IconCloudUploadStroked, IconBriefStroked, IconFont, IconPlusStroked, IconCopy, IconEdit, IconPaperclip, IconFolderStroked, IconFolder, IconMoreStroked, IconDeleteStroked } from '@douyinfe/semi-icons'
import context from '../../service/RidgeEditorContext.js'
import { eachNode, getFileTree } from './buildFileTree.js'
import DialogRename from './DialogRename.jsx'
import DialogCreate from './DialogCreate.jsx'
import { stringToBlob } from '../../utils/blob.js'
import IconFileCode from '../../icons/IconFileCode.jsx'
import IconFolderAdd from '../../icons/IconFolderAdd.jsx'
import IconPageAdd from '../../icons/IconPageAdd.jsx'
import IconUpload from '../../icons/IconUpload.jsx'
import IconFileCopy from '../../icons/IconFileCopy.jsx'
import IconRename from '../../icons/IconRename.jsx'
import './file-list.less'

const trace = debug('ridge:file')
const { Text } = Typography

const ACCEPT_FILES = 'image/*,video/*,audio/*,.woff,.json,.css,.js'
class AppFileList extends React.Component {
  constructor () {
    super()
    this.ref = React.createRef()
    this.state = {
      treeData: [],
      selectedNodeKey: null,

      dialgeCreateFileType: '',
      dialogCreateShow: false,
      dialogCreateTitle: '',

      dialogRenameShow: false,
      valueRename: ''
    }
  }

  componentDidMount () {
    this.loadAndUpdateFileTree()
  }

  async loadAndUpdateFileTree () {
    const { appService } = context.services
    await appService.updateAppFileTree()
    const appTreeData = await appService.getAppFileTree()

    this.rebuildTreeIcons(appTreeData)
    this.setState({
      treeData: appTreeData
    })
  }

  rebuildTreeIcons (treeData) {
    this.nodeMap = {}
    // TODO update icons
    eachNode(treeData, file => {
      this.nodeMap[file.id] = file
      if (file.mimeType) {
        if (file.mimeType === 'application/font-woff') {
          file.icon = (<IconFont style={{ color: 'var(--semi-color-text-2)' }} />)
        } else if (file.mimeType.indexOf('audio') > -1) {
          file.icon = (<IconMusic style={{ color: 'var(--semi-color-text-2)' }} />)
        } else if (file.mimeType.indexOf('image') > -1) {
          file.icon = (<IconImage style={{ color: 'var(--semi-color-text-2)' }} />)
        } else {
          file.icon = <IconBriefStroked style={{ color: 'var(--semi-color-text-2)' }} />
        }
      }
      if (file.type === 'directory') {
        file.icon = (<IconFolder style={{ color: 'var(--semi-color-text-2)' }} />)
      }
    })
  }

  // computed
  getCurrentSiblingNames () {
    const { selectedNodeKey, treeData } = this.state
    let siblings = []
    if (selectedNodeKey) {
      const node = this.nodeMap[selectedNodeKey]
      siblings = node.parent === -1 ? treeData : node.parentNode.children
    } else {
      siblings = treeData
    }
    return siblings.map(node => node.label)
  }

  getCurrentPath () {
    const { selectedNodeKey } = this.state
    if (selectedNodeKey) {
      const node = this.nodeMap[selectedNodeKey]
      return node.path
    } else {
      return '/'
    }
  }

  getCurrentParentId () {
    const { selectedNodeKey } = this.state
    if (selectedNodeKey) {
      const node = this.nodeMap[selectedNodeKey]
      if (node.type === 'directory') {
        return node.key
      } else {
        return node.parent
      }
    } else {
      return -1
    }
  }

  showCreateDialog = fileType => {
    const titles = {
      js: '创建程序文件',
      page: '创建页面',
      folder: '创建目录'
    }
    this.setState({
      dialgeCreateFileType: fileType,
      dialogCreateShow: true,
      dialogCreateTitle: titles[fileType]
    })
  }

  onCreateConfirm = async name => {
    const { dialgeCreateFileType } = this.state
    const { appService } = context.services
    try {
      if (dialgeCreateFileType === 'page') {
        await appService.createComposite(this.getCurrentParentId(), name)
      } else if (dialgeCreateFileType === 'folder') {
        await appService.createDirectory(this.getCurrentParentId(), name)
      } else if (dialgeCreateFileType === 'js') {
        appService.createFile(this.getCurrentParentId(), name, stringToBlob('', 'text/javascript'))
      }
      this.setState({
        dialogCreateShow: false
      })

      this.loadAndUpdateFileTree()
      Toast.success('已经成功创建 ' + name)
    } catch (e) {
      Toast.success('创建文件失败 ' + e)
    }
  }

  onFileUpload = async (files, dir) => {
    const { appService } = context.services
    const errors = []
    for (const file of files) {
      try {
        const result = await appService.createFile(this.getCurrentParentId(), file.name, file)
      } catch (e) {
        errors.push(file)
      }
    }
    await this.loadAndUpdateFileTree()
    Toast.success('文件上传完成')
    if (errors.length) {
      Toast.warning({
        content: '文件添加错误：存在相同名称文件',
        duration: 3
      })
    }
  }

  onRenameConfirm = async () => {
    const { appService } = context.services
    const { selectedNodeKey, valueRename } = this.state

    const result = await appService.rename(selectedNodeKey, valueRename)

    if (result) {
      await this.loadAndUpdateFileTree()
      this.setState({
        dialogRenameShow: false
      })
    }
  }

  onRemoveClicked = async data => {
    Modal.confirm({
      zIndex: 10001,
      title: '确认删除',
      content: '删除后文件无法找回，推荐您可先通过导出进行备份',
      onOk: async () => {
        const { appService } = context.services
        await appService.trash(data.key)
        this.setState({
          selectedNodeKey: null
        })
        this.loadAndUpdateFileTree()
        Toast.success('已经成功删除 ' + data.label)
      }
    })
  }

  copy = async node => {
    const { appService } = context.services
    await appService.copy(node.key)
    Toast.success('文件复制完成')
  }

  onOpenClicked = node => {
    context.openFile(node.key)
  }

  onRenameClicked = node => {
    this.setState({
      selectedNodeKey: node.key,
      dialogRenameShow: true,
      valueRename: node.label
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

  renderFullLabel = (label, data) => {
    const { currentOpenId } = this.state
    const MORE_MENUS = []

    if (data.type === 'page') {
      MORE_MENUS.push(
        <Dropdown.Item
          key='open'
          icon={<IconFolderOpen />} onClick={() => {
            this.onOpenClicked(data)
          }}
        >打开
        </Dropdown.Item>
      )
    }
    MORE_MENUS.push(
      <Dropdown.Item
        key='copy'
        icon={<IconFileCopy />} onClick={() => {
          this.onCopyClicked(data)
        }}
      >复制
      </Dropdown.Item>
    )
    MORE_MENUS.push(
      <Dropdown.Item
        key='export'
        icon={<IconExport />} onClick={() => {
          this.onExportClicked(data)
        }}
      >导出
      </Dropdown.Item>
    )
    MORE_MENUS.push(
      <Dropdown.Item
        key='rename'
        icon={<IconRename />} onClick={() => {
          this.onRenameClicked(data)
        }}
      >重命名
      </Dropdown.Item>
    )
    MORE_MENUS.push(<Dropdown.Divider key='div' />)
    MORE_MENUS.push(
      <Dropdown.Item
        key='delete'
        type='danger'
        icon={<IconDeleteStroked />}
        onClick={() => {
          this.onRemoveClicked(data)
        }}
      >删除
      </Dropdown.Item>
    )
    return (
      <div className={'tree-label' + (currentOpenId === data.key ? ' opened' : '')}>
        <Text ellipsis={{ showTooltip: true }} style={{ width: 'calc(100% - 48px)' }} className='label-content'>{label}</Text>
        <Dropdown
          className='app-files-dropdown'
          trigger='click'
          clickToHide
          render={<Dropdown.Menu>{MORE_MENUS}</Dropdown.Menu>}
        >
          <Button className='more-button' size='small' theme='borderless' type='tertiary' icon={<IconMoreStroked rotate={90} />} />
        </Dropdown>
      </div>
    )
  }

  async exportApp () {
    if (this.state.exportToastId) {
      return
    }
    const id = Toast.info({
      content: '正在导出应用，请稍侯...',
      duration: 0,
      onClose: () => {
        this.setState({
          exportToastId: null
        })
      }
    })
    this.setState({
      exportToastId: id
    })
    const { appService } = context.services
    await appService.exportAppArchive()
    Toast.close(id)
    this.setState({
      exportToastId: null
    })
  }

  renderAppDropDown () {
    return (
      <Dropdown
        trigger='click'
        render={
          <Dropdown.Menu>
            <Dropdown.Item
              icon={<IconExport />} onClick={() => {
                this.exportApp()
              }}
            >导出应用
            </Dropdown.Item>
            <Dropdown.Item
              icon={<IconImport />}
            >
              <Upload
                action='none'
                showUploadList={false} uploadTrigger='custom' onFileChange={files => {
                  Modal.confirm({
                    zIndex: 10001,
                    title: '确认导入应用',
                    content: '导入应用会首先覆盖现有应用，如果有需要的工作，建议您首先导出备份。 是否继续?',
                    onOk: () => {
                      ridge.backUpService.importAppArchive(files[0]).then(result => {
                        Toast.info('成功导入应用，共' + result.length + '个文件')
                      })
                    }
                  })
                }} accept='.zip'
              >
                导入应用
              </Upload>
            </Dropdown.Item>
            <Dropdown.Item disabled>
              Menu Item 3
            </Dropdown.Item>
          </Dropdown.Menu>
      }
      >
        <Button size='small' theme='borderless' type='tertiary' icon={<IconSetting />} />
      </Dropdown>
    )
  }

  RenderCreateDropDown = () => {
    const { showCreateDialog } = this
    return (
      <Dropdown
        trigger='click'
        closeOnEsc
        clickToHide
        keepDOM
        position='bottomLeft'
        render={
          <Dropdown.Menu className='app-files-dropdown'>
            <Dropdown.Item icon={<IconPageAdd />} onClick={() => showCreateDialog('page')}>创建页面</Dropdown.Item>
            <Dropdown.Item icon={<IconFolderAdd />} onClick={() => showCreateDialog('folder')}>创建目录</Dropdown.Item>
            <Dropdown.Item icon={<IconFileCode />} onClick={() => showCreateDialog('js')}>创建程序文件</Dropdown.Item>
            <Dropdown.Item icon={<IconUpload />}>
              <Upload
                action='none'
                multiple showUploadList={false} uploadTrigger='custom' onFileChange={files => {
                  this.onFileUpload(files)
                }} accept={ACCEPT_FILES}
              >
                上传文件
              </Upload>
            </Dropdown.Item>
          </Dropdown.Menu>
            }
      >
        <Button size='small' theme='borderless' type='tertiary' icon={<IconPlus />} />
      </Dropdown>
    )
  }

  render () {
    const { renderFullLabel, state, RenderCreateDropDown } = this
    const { treeData, dialogCreateShow, dialogCreateTitle, selectedNodeKey, dialogRenameShow, valueRename } = state

    return (
      <>
        <div className='file-actions'>
          <RenderCreateDropDown />
          {this.renderAppDropDown()}
        </div>
        <DialogCreate
          show={dialogCreateShow}
          title={dialogCreateTitle}
          parentPaths={this.getCurrentPath()}
          siblingNames={this.getCurrentSiblingNames()}
          confirm={val => {
            this.onCreateConfirm(val)
          }}
          cancel={() => {
            this.setState({
              dialogCreateShow: false
            })
          }}
        />
        <DialogRename
          show={dialogRenameShow} value={valueRename} siblingNames={this.getCurrentSiblingNames()} change={val => {
            this.setState({
              valueRename: val
            })
          }} confirm={() => {
            this.onRenameConfirm()
          }}
          cancel={() => {
            this.setState({
              dialogRenameShow: false
            })
          }}
        />
        {treeData &&
          <Tree
            className='file-tree'
            draggable
            renderLabel={renderFullLabel}
            value={selectedNodeKey}
            treeData={treeData}
            onDrop={({ node, dragNode, dropPosition, dropToGap }) => {
              this.move(node, dragNode, dropToGap)
            }}
            onDoubleClick={(ev, node) => {
              this.onOpenClicked(node)
            }}
            onChange={key => {
              this.setState({
                selectedNodeKey: key
              })
            }}
          />}
        {!treeData && <div className='tree-loading'><Spin size='middle' /></div>}
        {/* {this.renderAppDropDown()} */}
      </>
    )
  }
}

export default AppFileList
