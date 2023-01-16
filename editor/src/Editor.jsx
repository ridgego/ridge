import React from 'react'
import debug from 'debug'
import ConfigPanel from './panels/ConfigPanel.jsx'
import RightBottomPanel from './panels/RightBottomPanel.jsx'
import ComponentAddPanel from './panels/ComponentAddPanel.jsx'
import LeftBottomPanel from './panels/LeftBottomPanel.jsx'
import MenuBar from './panels/MenuBar.jsx'
import debounce from 'lodash/debounce'

import WorkSpaceControl from './workspace/WorkspaceControl.js'
import ImageDataUrlDecorator from './utils/ImageDataUrlDecorator.js'

import { ridge, emit, on } from './service/RidgeEditService.js'

import './css/editor.less'

import {
  EVENT_PAGE_LOADED, EVENT_PAGE_VAR_CHANGE, EVENT_PAGE_PROP_CHANGE, EVENT_ELEMENT_PROP_CHANGE, EVENT_ELEMENT_EVENT_CHANGE,
  EVENT_ELEMENT_CREATED,
  EVENT_PAGE_OUTLINE_CHANGE,
  PANEL_SIZE_1920, PANEL_SIZE_1366, EVENT_PAGE_OPEN, EVENT_APP_OPEN
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

  async openApp () {
    // await this.ridge.appService.updateDataUrl()
    // 应用管理器初始化
    trace('open App')
    // const pageObject = await this.ridge.appService.getRecentPage()
    // this.loadPage(pageObject)
  }

  /**
   * 编辑工具模式下初始化： 从本地存储获取相关页面及配置
   */
  initialize () {
    trace('editor initialize')
    this.ridge = ridge

    on(EVENT_PAGE_VAR_CHANGE, (variables) => {
      this.pageElementManager.updateVariableConfig(variables)
      this.debouncedSaveUpdatePage()
    })
    on(EVENT_PAGE_PROP_CHANGE, ({ from, properties }) => {
      this.pageElementManager.updatePageProperties(properties)
      this.debouncedSaveUpdatePage()
    })
    on(EVENT_ELEMENT_PROP_CHANGE, ({ el, values, field }) => {
      el.elementWrapper.setPropsConfig(values, field)
      if (field.title) {
        emit(EVENT_PAGE_OUTLINE_CHANGE, {
          elements: this.pageElementManager.getPageElements()
        })
      }
      this.workspaceControl.updateMovable()
      this.debouncedSaveUpdatePage()
    })
    on(EVENT_ELEMENT_EVENT_CHANGE, ({ el, values }) => {
      el.elementWrapper.setEventsConfig(values)
      this.debouncedSaveUpdatePage()
    })

    on(EVENT_ELEMENT_CREATED, () => {
      this.saveCurrentPage()
    })

    on(EVENT_PAGE_OPEN, async (id) => {
      const file = await this.ridge.appService.getFile(id)
      if (file.type === 'page') {
        if (this.pageElementManager) {
          await this.saveCurrentPage()
          this.pageElementManager.unmount()
        }
        this.workspaceControl.selectElements([], true)
        this.loadPage(file)
      }
    })

    on(EVENT_APP_OPEN, () => {
      this.openApp()
    })

    this.openApp()
    on('*', () => {
      // this.debouncedSaveUpdatePage()
    })
  }

  async saveCurrentPage () {
    if (this.pageElementManager) {
      const pageJSONObject = this.pageElementManager.getPageJSON()
      this.pageConfig.content = pageJSONObject
      trace('Save Page', this.pageConfig.id, pageJSONObject)
      await this.ridge.appService.savePageContent(this.pageConfig.id, pageJSONObject)
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
    this.pageElementManager = this.ridge.loadPage(document.querySelector('.viewport-container'), pageConfig.content)
    this.pageElementManager.setMode('edit')
    this.pageElementManager.addDecorators('element', new ImageDataUrlDecorator())

    emit(EVENT_PAGE_LOADED, {
      name: pageConfig.name,
      pageProperties: this.pageElementManager.getPageProperties(),
      pageVariables: this.pageElementManager.getVariableConfig(),
      elements: this.pageElementManager.getPageElements()
    })

    this.workspaceControl.setPageManager(this.pageElementManager)
    this.workspaceControl.fitToCenter()
  }

  componentDidMount () {
    this.workspaceControl = new WorkSpaceControl({
      workspaceEl: document.querySelector('.workspace'),
      viewPortEl: document.querySelector('.viewport-container'),
      ridge: this.ridge,
      zoomable: true
    })
  }

  render () {
    const {
      rightPanelRef,
      state
    } = this

    const {
      componentPanelVisible,
      dataPanelVisible,
      propPanelVisible,
      outlinePanelVisible,
      modeRun,
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
      </>
    )
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
    }, async () => {
      if (this.state.modeRun) {
        await this.saveCurrentPage()
        this.workspaceControl.disable()

        this.pageElementManager.unmount()
        this.pageElementManager = this.ridge.loadPage(document.querySelector('.viewport-container'), this.pageConfig.content)
        this.pageElementManager.setMode('run')
      } else {
        this.pageElementManager.unmount()
        this.loadPage(this.pageConfig)
        this.workspaceControl.enable()
        // this.pageElementManager.updateVariableConfigFromValue()
        // this.pageElementManager.setMode('edit')
        // this.workspaceControl.init()
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
