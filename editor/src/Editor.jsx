import React from 'react'
import debug from 'debug'
import RightTopPanel from './panels/RightTopPanel.jsx'
import RightBottomPanel from './panels/RightBottomPanel.jsx'
import LeftTopPanel from './panels/LeftTopPanel.jsx'
import LeftBottomPanel from './panels/LeftBottomPanel.jsx'
import MenuBar from './panels/MenuBar.jsx'
import debounce from 'lodash/debounce'

import WorkSpaceControl from './workspace/WorkspaceControl.js'
import ImageDataUrlDecorator from './utils/ImageDataUrlDecorator.js'

import { ridge, emit, on } from './service/RidgeEditService.js'

import './css/editor.less'

import {
  EVENT_PAGE_LOADED, EVENT_PAGE_CONFIG_CHANGE, EVENT_PAGE_PROP_CHANGE, EVENT_ELEMENT_PROP_CHANGE, EVENT_ELEMENT_EVENT_CHANGE,
  EVENT_ELEMENT_CREATED,
  EVENT_PAGE_OUTLINE_CHANGE,
  PANEL_SIZE_1920, PANEL_SIZE_1366, EVENT_PAGE_OPEN, EVENT_APP_OPEN
} from './constant'
import { Button } from '@douyinfe/semi-ui'
import { IconExit } from '@douyinfe/semi-icons'

const trace = debug('ridge:editor')

export default class Editor extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      componentPanelVisible: true,
      propPanelVisible: true,
      outlinePanelVisible: true,
      dataPanelVisible: true,
      editorLang: null,
      modeRun: false,
      panelPosition: PANEL_SIZE_1920
    }
    if (window.screen.width <= 1366) {
      this.state.panelPosition = PANEL_SIZE_1366
    }
    this.debouncedSaveUpdatePage = debounce(this.saveCurrentPage, 50)

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

    on(EVENT_PAGE_CONFIG_CHANGE, (change) => {
      this.pageElementManager.updatePageConfig(change)
      this.debouncedSaveUpdatePage()
    })
    on(EVENT_PAGE_PROP_CHANGE, ({ from, properties }) => {
      this.pageElementManager.updatePageConfig({ properties })
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
        this.workspaceControl && this.workspaceControl.selectElements([], true)
        this.loadPage(file)
      }
    })

    on(EVENT_APP_OPEN, () => {
      this.openApp()
    })

    this.openApp()
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
    const { content } = this.pageConfig
    this.workspaceControl.fitToCenter(content.properties.width, content.properties.height)

    // 从HTML初始化页面管理器
    // this.pageElementManager = this.ridge.loadPage(document.querySelector('.viewport-container'), pageConfig.content, false)

    this.pageElementManager = this.ridge.createPageManager(content, false)
    this.pageElementManager.setMode('edit')
    this.pageElementManager.addDecorators('element', new ImageDataUrlDecorator())

    this.pageElementManager.mount(document.querySelector('.viewport-container'))

    this.pageElementManager.onPageLoaded = () => {
      emit(EVENT_PAGE_LOADED, Object.assign(this.pageElementManager.pageConfig, {
        name: pageConfig.name,
        elements: this.pageElementManager.getPageElements()
      }))
    }
    this.workspaceControl.setPageManager(this.pageElementManager)

    ridge.pageElementManagers = this.pageElementManager

    if (this.saveTaskInterval) {
      clearInterval(this.saveTaskInterval)
    }
    this.saveTaskInterval = setInterval(() => {
      this.saveCurrentPage()
    }, 3000)
  }

  componentDidMount () {
    this.workspaceControl = new WorkSpaceControl({
      workspaceEl: document.querySelector('.workspace'),
      viewPortEl: document.querySelector('.viewport-container'),
      ridge: this.ridge
    })
  }

  render () {
    const {
      state
    } = this

    const {
      componentPanelVisible,
      dataPanelVisible,
      propPanelVisible,
      outlinePanelVisible,
      modeRun,
      panelPosition
    } = state
    return (
      <>
        <div
          className='workspace' style={{
            display: modeRun ? 'none' : ''
          }}
        >
          <div className='viewport-container' />
          <MenuBar
            {...state} toggleVisible={name => {
              this.setState({
                [name]: !this.state[name]
              })
            }}
            toggoleRunMode={this.toggoleRunMode.bind(this)}
          />
          <LeftTopPanel title='组件' position={panelPosition.ADD} visible={!modeRun && componentPanelVisible} />
          <LeftBottomPanel title='应用资源' position={panelPosition.LEFT_BOTTOM} visible={!modeRun && outlinePanelVisible} />
          <RightBottomPanel title='组件大纲' position={panelPosition.DATA} visible={!modeRun && dataPanelVisible} />
          <RightTopPanel position={panelPosition.PROP} visible={!modeRun && propPanelVisible} />
        </div>
        <div
          className='ridge-runtime' style={{
            display: modeRun ? '' : 'none'
          }}
        />
        <div style={{
          display: modeRun ? '' : 'none',
          position: 'absolute',
          right: '10px',
          bottom: '10px',
          zIndex: 10
        }}
        >
          <Button
            icon={<IconExit />} onClick={() => {
              this.toggoleRunMode()
            }}
          >退出运行
          </Button>
        </div>
      </>
    )
  }

  togglePanel (panel) {
    this.setState({
      [panel]: !this.state[panel]
    })
  }

  // 切换运行模式
  toggoleRunMode () {
    this.setState({
      modeRun: !this.state.modeRun
    }, async () => {
      if (this.state.modeRun) {
        // 运行页面
        await this.saveCurrentPage()
        this.workspaceControl.disable()

        this.pageElementManager.unmount()
        document.querySelector('.ridge-runtime').style.display = 'init'
        this.pageElementManager = this.ridge.loadPage(document.querySelector('.ridge-runtime'), this.pageConfig.content, 'run')
      } else {
        this.pageElementManager.unmount()
        this.loadPage(this.pageConfig)
        document.querySelector('.ridge-runtime').style.display = 'none'
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
