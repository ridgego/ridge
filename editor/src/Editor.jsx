import React from 'react'
import debug from 'debug'
import ConfigPanel from './panels/config/index.jsx'
import RightBottomPanel from './panels/outline/index.jsx'
import ComponentPanel from './panels/component/index.jsx'
import LeftBottomPanel from './panels/files/index.jsx'
import MenuBar from './menu/MenuBar.jsx'
import debounce from 'lodash/debounce'
import ImageDataUrlDecorator from './utils/ImageDataUrlDecorator.js'
import { ridge, emit, on, workspaceControl } from './service/RidgeEditService.js'
import './editor.less'
import {
  EVENT_PAGE_LOADED, EVENT_PAGE_CONFIG_CHANGE, EVENT_PAGE_PROP_CHANGE, EVENT_ELEMENT_PROP_CHANGE, EVENT_ELEMENT_EVENT_CHANGE,
  EVENT_ELEMENT_CREATED,
  EVENT_PAGE_OUTLINE_CHANGE,
  PANEL_SIZE_1920, PANEL_SIZE_1366, EVENT_PAGE_OPEN, EVENT_WORKSPACE_RESET
} from './constant'
import { Button } from '@douyinfe/semi-ui'
import { IconExit } from '@douyinfe/semi-icons'

const trace = debug('ridge:editor')

export default class Editor extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      componentPanelVisible: true,
      propPanelVisible: false,
      outlinePanelVisible: false,
      appFilePanelVisible: true,
      menuBarVisible: false,
      modeRun: false,
      zoom: 1,
      containerMask: true,
      currentPageId: null,
      panelPosition: PANEL_SIZE_1920
    }
    if (window.screen.width <= 1366) {
      this.state.panelPosition = PANEL_SIZE_1366
    }
    this.debouncedSaveUpdatePage = debounce(this.saveCurrentPage, 50)
    this.initialize()
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
      workspaceControl.updateMovable()
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
        if (!workspaceControl.enabled) {
          workspaceControl.enable()
        }
        this.loadPage(file)
        workspaceControl.selectElements([])
      }
    })

    on(EVENT_WORKSPACE_RESET, () => {
      this.saveCloseCurrentPage()
    })

    this.saveTaskInterval = setInterval(() => {
      this.saveCurrentPage()
    }, 3000)
  }

  async saveCurrentPage () {
    if (this.pageElementManager && !this.state.modeRun) {
      const pageJSONObject = this.pageElementManager.getPageJSON()
      this.pageConfig.content = pageJSONObject
      trace('Save Page', this.pageConfig.id, pageJSONObject)
      try {
        await this.ridge.appService.savePageContent(this.pageConfig.id, pageJSONObject)
      } catch (e) {
        console.error('save page error', e)
      }
    }
  }

  async saveCloseCurrentPage () {
    this.saveCurrentPage()
    workspaceControl.disable()
    this.pageElementManager.unmount()
    this.pageElementManager = null
    this.setState({
      currentPageId: null,
      outlinePanelVisible: false,
      menuBarVisible: false,
      propPanelVisible: false
    })
  }

  /**
   * 加载并初始化当前工作区
   * @param {*} pageConfig
   * @param {*} id
   */
  loadPage (pageConfig) {
    trace('loadPage', pageConfig)
    this.setState({
      currentPageId: pageConfig.id,
      propPanelVisible: true,
      menuBarVisible: true,
      outlinePanelVisible: true
    })
    this.pageConfig = pageConfig
    window.page = pageConfig
    const { content } = this.pageConfig
    const zoom = workspaceControl.fitToCenter(content.properties.width, content.properties.height, this.state.zoom)
    workspaceControl.zoomBack = val => {
      this.setState({
        zoom: val
      })
    }
    this.setState({
      zoom
    })
    // 从HTML初始化页面管理器
    // this.pageElementManager = this.ridge.loadPage(document.querySelector('.viewport-container'), pageConfig.content, false)

    this.pageElementManager = this.ridge.createPageManager({ id: pageConfig.id, ...content }, 'edit')
    this.pageElementManager.addDecorators('element', new ImageDataUrlDecorator())

    this.pageElementManager.mount(document.querySelector('.viewport-container'))

    this.pageElementManager.onPageLoaded = () => {
      emit(EVENT_PAGE_LOADED, Object.assign(this.pageElementManager.pageConfig, {
        name: pageConfig.name,
        elements: this.pageElementManager.getPageElements()
      }))
    }
    workspaceControl.setPageManager(this.pageElementManager)
    ridge.pageElementManager = this.pageElementManager
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
        await this.saveCloseCurrentPage()
        document.querySelector('.ridge-runtime').style.display = 'init'
        this.pageElementManager = this.ridge.loadPage(document.querySelector('.ridge-runtime'), this.pageConfig.content, 'preview')
        this.pageElementManager.addDecorators('element', new ImageDataUrlDecorator())
      } else {
        this.pageElementManager.unmount()
        this.loadPage(this.pageConfig)
        document.querySelector('.ridge-runtime').style.display = 'none'
        workspaceControl.enable()
      }
    })
  }

  componentDidMount () {
    workspaceControl.init({
      workspaceEl: document.querySelector('.workspace'),
      viewPortEl: document.querySelector('.viewport-container')
    })
  }

  render () {
    const {
      state
    } = this

    const {
      componentPanelVisible,
      appFilePanelVisible,
      propPanelVisible,
      outlinePanelVisible,
      modeRun,
      zoom,
      panelPosition,
      containerMask,
      menuBarVisible,
      currentPageId
    } = state
    return (
      <>
        <div
          className={'workspace ' + (containerMask ? 'show-container' : '')} style={{
            display: modeRun ? 'none' : ''
          }}
        >
          <div className='viewport-container' />
          <MenuBar
            containerMask={containerMask}
            zoom={zoom}
            currentPageId={currentPageId}
            visible={menuBarVisible}
            toggleVisible={name => {
              this.setState({
                [name]: !this.state[name]
              })
            }}
            toggleContainerMask={() => {
              this.setState({
                containerMask: !containerMask
              })
            }}
            closeCurrentPage={() => {
              emit(EVENT_WORKSPACE_RESET)
            }}
            toggoleRunMode={this.toggoleRunMode.bind(this)}
            zoomChange={zoom => {
              this.setState({
                zoom
              })
              workspaceControl.setZoom(zoom)
            }}
          />
          <ComponentPanel title='组件' position={panelPosition.ADD} visible={!modeRun && componentPanelVisible} />
          <LeftBottomPanel title='应用资源' position={panelPosition.LEFT_BOTTOM} visible={!modeRun && appFilePanelVisible} />
          <RightBottomPanel title='布局导航' position={panelPosition.DATA} visible={!modeRun && outlinePanelVisible} />
          <ConfigPanel position={panelPosition.PROP} visible={!modeRun && propPanelVisible} />
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
}
