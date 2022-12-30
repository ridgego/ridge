import React from 'react'
import debug from 'debug'
import ConfigPanel from './panels/ConfigPanel.jsx'
import RightBottomPanel from './panels/RightBottomPanel.jsx'
import ComponentAddPanel from './panels/ComponentAddPanel.jsx'
import LeftBottomPanel from './panels/LeftBottomPanel.jsx'
import MenuBar from './panels/MenuBar.jsx'
import CodeEditor from './code-editor/CodeEditor.jsx'
import debounce from 'lodash/debounce'

import ApplicationService from './service/ApplicationService.js'
import ConfigService from './service/ConfigService.js'
import WorkSpaceControl from './workspace/WorkspaceControl.js'

import './css/editor.less'
import { Ridge, PageElementManager } from 'ridge-runtime'

import { emit, on } from './utils/events'

import {
  EVENT_PAGE_LOADED, EVENT_PAGE_VAR_CHANGE, EVENT_PAGE_PROP_CHANGE, EVENT_ELEMENT_PROP_CHANGE, EVENT_ELEMENT_EVENT_CHANGE,
  EVENT_ELEMENT_CREATED,
  PANEL_SIZE_1920, PANEL_SIZE_1366, EVENT_PAGE_OPEN
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
    const configService = new ConfigService()
    const appService = new ApplicationService()
    const config = configService.getConfig()

    this.ridge = new Ridge({
      debugUrl: config.debug ? config.debugUrl : null
    })
    this.ridge.configService = configService
    this.ridge.appService = appService

    window.Ridge = this.ridge

    // 应用管理器初始化
    this.ridge.appService.getRecentPage().then((pageObject) => {
      console.log('pageObject', pageObject)
      this.loadPage(pageObject)
    })

    on(EVENT_PAGE_VAR_CHANGE, (variables) => {
      this.pageElementManager.updateVariableConfig(variables)
      this.debouncedSaveUpdatePage()
    })
    on(EVENT_PAGE_PROP_CHANGE, ({ from, properties }) => {
      this.pageElementManager.updatePageProperties(properties)
      this.debouncedSaveUpdatePage()
    })
    on(EVENT_ELEMENT_PROP_CHANGE, ({
      el,
      values,
      field
    }) => {
      el.elementWrapper.setPropsConfig(values, field)
      this.workspaceControl.updateMovable()
    })
    on(EVENT_ELEMENT_EVENT_CHANGE, ({
      el,
      values
    }) => {
      el.elementWrapper.setEventsConfig(values)
    })

    on(EVENT_ELEMENT_CREATED, () => {
      this.saveCurrentPage()
    })

    on(EVENT_PAGE_OPEN, async (id) => {
      const file = await this.ridge.appService.getFile(id)
      if (file.type === 'page') {
        await this.saveCurrentPage()
        this.pageElementManager.unmount()
        this.loadPage(file)
      }
    })

    on('*', () => {
      // this.debouncedSaveUpdatePage()
    })
  }

  async saveCurrentPage () {
    if (this.pageElementManager) {
      const pageJSONObject = this.pageElementManager.getPageJSON()
      Object.assign(this.pageConfig, pageJSONObject)
      trace('Save Page', this.pageConfig)
      await this.ridge.appService.saveOrUpdate(this.pageConfig)
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
        <LeftBottomPanel title='页面和资源' position={panelPosition.LEFT_BOTTOM} visible={!modeRun && outlinePanelVisible} />
        <RightBottomPanel position={panelPosition.DATA} visible={!modeRun && dataPanelVisible} />
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
    emit(EVENT_PAGE_VAR_CHANGE, variables)
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
