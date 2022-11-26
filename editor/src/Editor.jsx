import React from 'react'
import ConfigPanel from './panels/ConfigPanel.jsx'
import DataPanel from './panels/DataPanel.jsx'
import ComponentAddPanel from './panels/ComponentAddPanel.jsx'
import MenuBar from './panels/MenuBar.jsx'

import WorkSpaceControl from './WorkspaceControl.js'

import './css/editor.less'

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
      dataPanelVisible: true
    }
  }

  loadPage (pageConfig) {
    const { Ridge } = window

    this.viewPortRef.current.innerHTML = pageConfig

    this.pageElementManager = Ridge.initialize(this.viewPortRef.current, 'editor-page')
    this.dataPanelRef.current.loadVariables(this.pageElementManager.getVariableConfig())

    const pageProperties = this.pageElementManager.getPageProperties()

    this.workspaceControl.setViewPort(pageProperties.width, pageProperties.height)
    this.workspaceControl.setPageManager(this.pageElementManager)
    this.rightPanelRef.current.setPageManager(this.pageElementManager)
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
      pagesPanelVisible
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

        <div className='workspace' ref={workspaceRef}>
          <div
            ref={viewPortRef}
            className='viewport-container active'
          />
        </div>
      </>
    )
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
