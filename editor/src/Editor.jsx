import React from 'react'
import ConfigPanel from './panels/ConfigPanel.jsx'
import DataPanel from './panels/DataPanel.jsx'
import ComponentAddPanel from './panels/ComponentAddPanel.jsx'
import MenuBar from './panels/MenuBar.jsx'
import CodeEditor from './code-editor/CodeEditor.jsx'

import WorkSpaceControl from './WorkspaceControl.js'
import ApplicationService from './service/ApplicationService.js'

import './css/editor.less'
import { Ridge } from 'ridge-runtime'
import Nanobus from 'nanobus'

export default class Editor extends React.Component {
  constructor (props) {
    super(props)
    this.workspaceRef = React.createRef()
    this.viewPortRef = React.createRef()
    this.rightPanelRef = React.createRef()
    this.dataPanelRef = React.createRef()
    this.addComponentRef = React.createRef()

    this.state = {
      componentPanelVisible: true,
      propPanelVisible: true,
      outlinePanelVisible: true,
      pagesPanelVisible: true,
      dataPanelVisible: true,
      editorLang: null,
      editorVisible: false,
      editorCode: ''
    }

    this.initialize()
  }

  /**
   * 编辑工具模式下初始化： 从本地存储获取相关页面及配置
   */
  initialize () {
    const ridgeInstance = new Ridge({
      debugUrl: 'https://localhost:8700'
    })
    window.Ridge = ridgeInstance

    ridgeInstance.nanobus = new Nanobus()
    ridgeInstance.registerMethod('emit', ridgeInstance.nanobus.emit.bind(ridgeInstance.nanobus))
    ridgeInstance.registerMethod('on', ridgeInstance.nanobus.on.bind(ridgeInstance.nanobus))
    ridgeInstance.openCodeEditor = this.openCodeEditor.bind(this)

    ridgeInstance.appService = new ApplicationService()

    ridgeInstance.appService.getRecentPage().then(({
      id,
      content
    }) => {
      this.loadPage(content, id)
    })
  }

  /**
   * 加载并初始化当前工作区
   * @param {*} pageConfig
   * @param {*} id
   */
  loadPage (pageConfig, id) {
    const { Ridge } = window

    this.viewPortRef.current.innerHTML = pageConfig

    // 从HTML初始化页面管理器
    this.pageElementManager = Ridge.initialize(this.viewPortRef.current, id)

    const pageProperties = this.pageElementManager.getPageProperties()

    Ridge.emit('pageLoaded', {
      pageProperties,
      pageVariables: this.pageElementManager.getVariableConfig()
    })

    // 设置页面特征，宽、高
    this.workspaceControl.setViewPort(pageProperties.width, pageProperties.height)
    this.workspaceControl.setPageManager(this.pageElementManager)
  }

  componentDidMount () {
    this.workspaceControl = new WorkSpaceControl({
      workspaceEl: this.workspaceRef.current,
      viewPortEl: this.viewPortRef.current,
      zoomable: true
    })
    this.workspaceControl.onNodeSelected(this.onNodeSelected.bind(this))

    this.workspaceControl.enablePanelDragResize('#dataPanel')
  }

  render () {
    const {
      viewPortRef,
      rightPanelRef,
      dataPanelRef,
      workspaceRef,
      state
    } = this

    const {
      componentPanelVisible,
      dataPanelVisible,
      propPanelVisible,
      outlinePanelVisible,
      pagesPanelVisible,
      editorLang,
      editorVisible,
      editorCode
    } = state
    return (
      <>
        <MenuBar
          {...state} toggleVisible={name => {
            this.setState({
              [name]: !this.state[name]
            })
          }}
        />
        <ComponentAddPanel
          visible={componentPanelVisible} onClose={() => {
            this.setState({
              componentPanelVisible: false
            })
          }}
        />
        <DataPanel
          title='数据' ref={dataPanelRef} visible={dataPanelVisible} onClose={() => {
            this.setState({
              dataPanelVisible: false
            })
          }}
        />
        <ConfigPanel
          ref={rightPanelRef} visible={propPanelVisible} onClose={() => {
            this.setState({
              propPanelVisible: false
            })
          }}
        />

        <CodeEditor
          visible={editorVisible} onCancel={() => {
            this.setState({
              editorVisible: false
            })
          }} value={editorCode} lang={editorLang} output={this.onCodeEditorCompleted.bind(this)}
        />

        <div className='workspace' ref={workspaceRef}>
          <div
            ref={viewPortRef}
            className='viewport-container active'
          />
        </div>
      </>
    )
  }

  openCodeEditor ({
    lang,
    code,
    completed
  }) {
    this.setState({
      editorVisible: true,
      editorCode: code,
      editorLang: lang
    })
    this.codeEditComplete = completed
  }

  onCodeEditorCompleted (value) {
    this.setState({
      editorVisible: false
    })

    this.codeEditComplete && this.codeEditComplete(value)
  }

  removeNode () {
    this.pageElementManager.removeElements(this.selectMove.selected)
  }

  togglePanel (panel) {
    this.setState({
      [panel]: !this.state[panel]
    })
  }

  onToolbarItemClick (cmd, opts) {
    switch (cmd) {
      case 'file-manager':
        this.setState({
          modalFileShow: true
        })
        break
      default:
        break
    }
  }

  onNodeResizeEnd (el) {
    this.rightPanelRef.current?.styleChange(el)
  }

  onPagePropChange (values) {
    this.setState({
      pageProps: values
    })
  }

  /**
   * Update To Canvas Style
   */
  onNodeCanvasChange (values, field) {
    const { selectedTargets } = this.state
    document.getElementById(selectedTargets[0]).style.width = values.width + 'px'
    document.getElementById(selectedTargets[0]).style.height = values.height + 'px'
    document.getElementById(selectedTargets[0]).style.transform = `translate(${values.x}px, ${values.y}px)`
    const moveable = this.movableManager.current?.getMoveable()
    moveable.updateTarget()
  }

  onNodeSelected (el) {
    if (el) {
      this.rightPanelRef.current?.elementSelected(el)
    } else {
      this.rightPanelRef.current?.elementSelected(null)
    }
  }

  onNodeMove (el) {
    // this.rightPanelRef.current?.elementMove(el)
  }

  zoomChange (zoom) {
    if (zoom) {
      this.setState({
        zoom
      })
      this.selectMove.setZoom(1 / zoom)
    } else {
      this.fitToCenter()
    }
  }

  initKeyEvents () {
    MouseStrap.bind('del', this.removeNode.bind(this))
  }
}
