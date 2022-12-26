import React from 'react'
import debug from 'debug'
import ConfigPanel from './panels/ConfigPanel.jsx'
import DataPanel from './panels/DataPanel.jsx'
import ComponentAddPanel from './panels/ComponentAddPanel.jsx'
import OutLinePanel from './panels/OutLinePanel.jsx'
import MenuBar from './panels/MenuBar.jsx'
import CodeEditor from './code-editor/CodeEditor.jsx'
import { debounce } from 'lodash'

import WorkSpaceControl from './workspace/WorkspaceControl.js'
import ApplicationService from './service/ApplicationService.js'

import './css/editor.less'
import { Ridge, PageElementManager } from 'ridge-runtime'
import Nanobus from 'nanobus'

import { emit, on } from './utils/events'

import {
  EVENT_PAGE_LOADED, EVENT_PAGE_VAR_CHANGE, EVENT_PAGE_PROP_CHANGE, EVENT_ELEMENT_PROP_CHANGE, EVENT_ELEMENT_EVENT_CHANGE,
  PANEL_SIZE_1920, PANEL_SIZE_1366
} from './constant'

const trace = debug('ridge:editor')

export default class Editor extends React.Component {
  constructor (props) {
    super(props)
    this.workspaceRef = React.createRef()
    this.viewPortRef = React.createRef()
    this.rightPanelRef = React.createRef()
    this.dataPanelRef = React.createRef()
    this.addComponentRef = React.createRef()

    this.state = {
      variables: [],
      properties: {},
      componentPanelVisible: true,
      propPanelVisible: true,
      outlinePanelVisible: true,
      pagesPanelVisible: true,
      dataPanelVisible: true,
      editorLang: null,
      editorVisible: false,
      modeRun: false,
      editorCode: '',
      panelPosition: PANEL_SIZE_1920
    }
    if (window.screen.width <= 1366) {
      this.state.panelPosition = PANEL_SIZE_1366
    }
    this.debouncedSaveUpdatePage = debounce(this.saveCurrentPage, 5000)

    this.currentId = null
    this.initialize()
  }

  /**
   * 编辑工具模式下初始化： 从本地存储获取相关页面及配置
   */
  initialize () {
    this.ridge = new Ridge({
      debugUrl: 'https://localhost:8700'
    })
    window.Ridge = this.ridge

    this.ridge.nanobus = new Nanobus()
    this.ridge.registerMethod('emit', this.ridge.nanobus.emit.bind(this.ridge.nanobus))
    this.ridge.registerMethod('on', this.ridge.nanobus.on.bind(this.ridge.nanobus))
    // this.ridge.registerMethod('openCodeEditor', this.openCodeEditor.bind(this))
    // this.ridge.registerMethod('saveCurrentPage', this.saveCurrentPage.bind(this))
    // this.ridge.registerMethod('debouncedSaveUpdatePage', this.debouncedSaveUpdatePage.bind(this))

    // 应用管理器初始化
    this.ridge.appService = new ApplicationService()

    this.ridge.appService.getRecentPage().then(({
      content
    }) => {
      this.loadPage(content)
    })

    this.ridge.on(EVENT_PAGE_VAR_CHANGE, (variables) => {
      this.pageElementManager.updateVariableConfig(variables)
      this.debouncedSaveUpdatePage()
    })
    on(EVENT_PAGE_PROP_CHANGE, ({ from, properties }) => {
      this.pageElementManager.updatePageProperties(properties)
      this.debouncedSaveUpdatePage()
    })
    this.ridge.on(EVENT_ELEMENT_PROP_CHANGE, ({
      el,
      values,
      field
    }) => {
      el.elementWrapper.setPropsConfig(values, field)
      this.workspaceControl.updateMovable()
    })
    this.ridge.on(EVENT_ELEMENT_EVENT_CHANGE, ({
      el,
      values
    }) => {
      el.elementWrapper.setEventsConfig(values)
    })

    this.ridge.on('*', () => {
      // this.debouncedSaveUpdatePage()
    })
  }

  saveCurrentPage () {
    if (this.pageElementManager) {
      const pageJSONObject = this.pageElementManager.getPageJSON()
      trace('Save Page', pageJSONObject)
      this.pageConfig = pageJSONObject
      this.ridge.appService.saveUpdatePage({
        id: pageJSONObject.id,
        title: pageJSONObject.properties.title,
        content: pageJSONObject
      })
    }
  }

  /**
   * 加载并初始化当前工作区
   * @param {*} pageConfig
   * @param {*} id
   */
  loadPage (pageConfig) {
    trace('loadPage', pageConfig)
    this.pageConfig = pageConfig
    // 从HTML初始化页面管理器
    this.pageElementManager = this.ridge.createPageManager(pageConfig)
    this.pageElementManager.setMode('edit')

    window.pageManager = this.pageElementManager
    this.workspaceControl.setPageManager(this.pageElementManager)
    this.setState({
      variables: this.pageElementManager.getVariableConfig(),
      properties: this.pageElementManager.getPageProperties()
    })

    this.pageElementManager.mount(this.viewPortRef.current)

    emit(EVENT_PAGE_LOADED, {
      pageProperties: this.pageElementManager.getPageProperties(),
      pageVariables: this.pageElementManager.getVariableConfig(),
      elements: this.pageElementManager.getPageElements()
    })

    this.workspaceControl.fitToCenter()
    // this.pageElementManager.forceUpdate()
  }

  loadPageRun (pageConfig) {
    trace('runPage', pageConfig)
    if (this.pageElementManager) {
      this.pageElementManager.unmount()
    }
    this.pageElementManager = new PageElementManager(pageConfig, this.ridge)
    this.pageElementManager.mount(this.viewPortRef.current)
    this.pageElementManager.forceUpdate()
  }

  componentDidMount () {
    this.workspaceControl = new WorkSpaceControl({
      workspaceEl: this.workspaceRef.current,
      viewPortEl: this.viewPortRef.current,
      ridge: this.ridge,
      zoomable: true
    })
  }

  render () {
    const {
      viewPortRef,
      rightPanelRef,
      dataPanelRef,
      workspaceRef,
      pageVariableConfigChange,
      state
    } = this

    const {
      componentPanelVisible,
      dataPanelVisible,
      propPanelVisible,
      outlinePanelVisible,
      pagesPanelVisible,
      modeRun,
      variables,
      editorLang,
      editorVisible,
      panelPosition,
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
          toggoleRunMode={this.toggoleRunMode.bind(this)}
        />
        <ComponentAddPanel
          position={panelPosition.ADD}
          visible={!modeRun && componentPanelVisible} onClose={() => {
            this.setState({
              componentPanelVisible: false
            })
          }}
        />
        <OutLinePanel position={panelPosition.OUTLINE} visible={!modeRun && outlinePanelVisible} />
        <DataPanel
          title='数据'
          variableChange={pageVariableConfigChange.bind(this)}
          position={panelPosition.DATA}
          variables={variables}
          ref={dataPanelRef} visible={!modeRun && dataPanelVisible} onClose={() => {
            this.setState({
              dataPanelVisible: false
            })
          }}
        />
        <ConfigPanel
          position={panelPosition.PROP}
          ref={rightPanelRef}
          visible={!modeRun && propPanelVisible} onClose={() => {
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

  togglePanel (panel) {
    this.setState({
      [panel]: !this.state[panel]
    })
  }

  onNodeSelected (el) {
    if (el) {
      this.rightPanelRef.current?.elementSelected(el)
    } else {
      this.rightPanelRef.current?.elementSelected(null)
    }
  }

  pagePropertiesConfigChange (properties) {
    this.setState({
      properties
    })
    this.pageElementManager.updatePageProperties(properties)
    // this.pageElementManager.properties = properties
    this.debouncedSaveUpdatePage()
  }

  pageVariableConfigChange (variables) {
    this.setState({
      variables
    })
    this.ridge.emit(EVENT_PAGE_VAR_CHANGE, variables)
    // this.pageElementManager.updateVariableConfig(variables)
    // this.debouncedSaveUpdatePage()
  }

  // 切换运行模式
  toggoleRunMode () {
    this.setState({
      modeRun: !this.state.modeRun
    }, () => {
      if (this.state.modeRun) {
        this.workspaceControl.disable()
        this.saveCurrentPage()
        this.pageElementManager.setMode('run')
      } else {
        this.pageElementManager.updateVariableConfigFromValue()
        this.pageElementManager.setMode('edit')
        this.workspaceControl.init()
      }
    })
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
}
