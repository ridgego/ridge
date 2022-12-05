import React from 'react'
import { Toast } from '@douyinfe/semi-ui'
import ConfigPanel from './panels/ConfigPanel.jsx'
import DataPanel from './panels/DataPanel.jsx'
import ComponentAddPanel from './panels/ComponentAddPanel.jsx'
import MenuBar from './panels/MenuBar.jsx'
import CodeEditor from './code-editor/CodeEditor.jsx'
import { debounce } from 'lodash'

import WorkSpaceControl from './WorkspaceControl.js'
import ApplicationService from './service/ApplicationService.js'

import './css/editor.less'
import { Ridge } from 'ridge-runtime'
import Nanobus from 'nanobus'

import { EVENT_PAGE_LOADED, EVENT_PAGE_VAR_CHANGE, EVENT_PAGE_PROP_CHANGE, EVENT_ELEMENT_PROP_CHANGE, EVENT_ELEMENT_EVENT_CHANGE } from './constant'

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
      editorCode: ''
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
    this.ridge.registerMethod('openCodeEditor', this.openCodeEditor.bind(this))
    this.ridge.registerMethod('saveCurrentPage', this.saveCurrentPage.bind(this))
    this.ridge.registerMethod('debouncedSaveUpdatePage', this.debouncedSaveUpdatePage.bind(this))

    this.ridge.appService = new ApplicationService()

    this.ridge.appService.getRecentPage().then(({
      id,
      content
    }) => {
      this.currentId = id
      this.loadPage(content, id)
    })
  }

  saveCurrentPage () {
    this.ridge.appService.saveUpdatePage({
      id: this.currentId,
      title: this.pageElementManager.properties.title,
      content: this.viewPortRef.current.innerHTML
    })
    Toast.success({
      content: '所有工作已经保存',
      showClose: false
    })
  }

  /**
   * 加载并初始化当前工作区
   * @param {*} pageConfig
   * @param {*} id
   */
  loadPage (pageConfig, id) {
    this.viewPortRef.current.innerHTML = pageConfig

    // 从HTML初始化页面管理器
    this.pageElementManager = this.ridge.initialize(this.viewPortRef.current, id)

    this.setState({
      variables: this.pageElementManager.getVariableConfig(),
      properties: this.pageElementManager.getPageProperties()
    }, () => {
      // 设置页面特征，宽、高
      this.workspaceControl.setViewPort(this.state.properties.width, this.state.properties.height)
      this.workspaceControl.setPageManager(this.pageElementManager)
    })
    this.ridge.emit(EVENT_PAGE_LOADED, {
      pageProperties: this.pageElementManager.getPageProperties(),
      pageVariables: this.pageElementManager.getVariableConfig()
    })

    this.ridge.on(EVENT_PAGE_VAR_CHANGE, (variables) => {
      this.pageElementManager.updateVariableConfig(variables)
      this.pageElementManager.persistance()
      this.debouncedSaveUpdatePage()
    })
    this.ridge.on(EVENT_PAGE_PROP_CHANGE, (properties) => {
      this.pageElementManager.properties = properties
      this.pageElementManager.persistance()
      this.debouncedSaveUpdatePage()
    })
    this.ridge.on(EVENT_ELEMENT_PROP_CHANGE, ({
      el,
      values,
      field
    }) => {
      el.elementWrapper.propConfigUpdate(values, field)
    })
    this.ridge.on(EVENT_ELEMENT_EVENT_CHANGE, ({
      el,
      values
    }) => {
      el.elementWrapper.eventConfigUpdate(values)
    })

    this.ridge.on('*', () => {
      this.debouncedSaveUpdatePage()
    })
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
      variables,
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
          title='数据'
          variableChange={pageVariableConfigChange}
          variables={variables}
          ref={dataPanelRef} visible={dataPanelVisible} onClose={() => {
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
    this.pageElementManager.properties = properties
    this.pageElementManager.persistance()
    this.debouncedSaveUpdatePage()
  }

  pageVariableConfigChange (variables) {
    this.setState({
      variables
    })
    this.pageElementManager.updateVariableConfig(variables)
    this.pageElementManager.persistance()
    this.debouncedSaveUpdatePage()
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
