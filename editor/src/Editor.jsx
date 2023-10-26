import React from 'react'
import debug from 'debug'
import { Spin, ImagePreview } from '@douyinfe/semi-ui'
import ConfigPanel from './panels/config/index.jsx'
import RightBottomPanel from './panels/outline/index.jsx'
import ComponentPanel from './panels/component/index.jsx'
import LeftBottomPanel from './panels/files/index.jsx'
import DialogCodeEdit from './panels/files/DialogCodeEdit.jsx'
import EditMenuBar from './panels/menu/EditMenuBar.jsx'
import PreviewMenuBar from './panels/menu/PreviewMenuBar.jsx'
import context from './service/RidgeEditorContext.js'

import './editor.less'

import {
  PANEL_SIZE_1920, PANEL_SIZE_1366
} from './constant.js'

import { IconExit } from '@douyinfe/semi-icons'

const trace = debug('ridge:editor')

export default class Editor extends React.Component {
  constructor (props) {
    super(props)

    this.workspaceRef = React.createRef()
    this.viewPortContainerRef = React.createRef()

    this.state = {
      editorLoading: true,

      // panel visibles
      componentPanelVisible: true,
      propPanelVisible: false,
      outlinePanelVisible: false,
      appFilePanelVisible: true,
      editMenuBarVisible: false,
      previewMenuBarVisible: false,

      panelPosition: PANEL_SIZE_1920,
      // image preview
      imagePreviewSrc: null,
      imagePreviewVisible: false,

      // code preview/edit
      codeEditTitle: '',
      codeEditText: '',
      codeEditVisible: false,
      codeEditType: ''
    }
    if (window.screen.width <= 1366) {
      this.state.panelPosition = PANEL_SIZE_1366
    }
  }

  componentDidMount () {
    context.editorDidMount(this, this.workspaceRef.current, this.viewPortContainerRef.current)
  }

  setEditorLoaded () {
    this.setState({
      editorLoading: false
    })
  }

  openCodeEditor (file) {
    this.currentEditFile = file
    this.setState({
      codeEditTitle: file.name,
      codeEditText: file.textContent,
      codeEditVisible: true,
      codeEditType: file.mimeType
    })
  }

  completeCodeEdit (code) {
    context.onCodeEditComplete(this.currentEditFile.id, code)
  }

  openImage (url) {
    this.setState({
      imagePreviewSrc: url,
      imagePreviewVisible: true
    })
  }

  togglePageEdit () {
    this.setState({
      componentPanelVisible: true,
      appFilePanelVisible: true,
      propPanelVisible: true,
      editMenuBarVisible: true,
      previewMenuBarVisible: false,
      outlinePanelVisible: true
    })
  }

  togglePagePreview () {
    this.setState({
      componentPanelVisible: false,
      appFilePanelVisible: false,
      propPanelVisible: false,
      editMenuBarVisible: false,
      previewMenuBarVisible: true,
      outlinePanelVisible: false
    })
  }

  togglePageClose () {
    this.setState({
      componentPanelVisible: true,
      appFilePanelVisible: true,
      propPanelVisible: false,
      editMenuBarVisible: false,
      previewMenuBarVisible: false,
      outlinePanelVisible: false
    })
  }

  render () {
    const {
      state,
      workspaceRef,
      viewPortContainerRef,
    } = this

    const {
      editorLoading,
      componentPanelVisible,
      appFilePanelVisible,
      propPanelVisible,
      outlinePanelVisible,
      panelPosition,
      containerMask,
      editMenuBarVisible,
      previewMenuBarVisible,
      imagePreviewVisible,
      imagePreviewSrc,
      codeEditTitle,
      codeEditText,
      codeEditVisible,
      codeEditType
    } = state
    return (
      <>
        <div
          ref={workspaceRef}
          className={'workspace ' + (containerMask ? 'show-container' : '')}
        >
          <div className='viewport-container' ref={viewPortContainerRef} />
          {
            !editorLoading &&
              <>
                <EditMenuBar visible={editMenuBarVisible} />
                <PreviewMenuBar visible={previewMenuBarVisible} />
                <ComponentPanel title='组件' position={panelPosition.ADD} visible={componentPanelVisible} />
                <LeftBottomPanel title='应用资源' position={panelPosition.LEFT_BOTTOM} visible={appFilePanelVisible} />
                <RightBottomPanel title='布局导航' position={panelPosition.DATA} visible={outlinePanelVisible} />
                <ConfigPanel position={panelPosition.PROP} visible={propPanelVisible} />

                <ImagePreview
                  src={imagePreviewSrc} visible={imagePreviewVisible} onVisibleChange={() => {
                    this.setState({
                      imagePreviewVisible: false
                    })
                  }}
                />
                <DialogCodeEdit
                  title={codeEditTitle}
                  value={codeEditText} visible={codeEditVisible} lang={codeEditType} onChange={(code, close) => {
                    this.completeCodeEdit(code, close)
                  }}
                  type={codeEditType}
                  onClose={() => {
                    this.setState({
                      codeEditVisible: false
                    })
                  }}
                />
              </>
          }
        </div>
        {
          editorLoading &&
            <div className='editor-loading'>
              <Spin tip='编辑器已启动.. 正在加载应用资源' />
            </div>
        }
      </>
    )
  }
}
