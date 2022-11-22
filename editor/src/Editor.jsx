import React from 'react'
import { Modal } from '@douyinfe/semi-ui'

import Toolbar from './Toolbar.jsx'
import ConfigPanel from './panels/ConfigPanel.jsx'
import DataPanel from './panels/DataPanel.jsx'
import ComponentAddPanel from './panels/ComponentAddPanel.jsx'
import FileManager from './panels/FileManager.jsx'
import SelectableMoveable from './select-drag/SelectableMoveable.js'
import { fitRectIntoBounds } from './utils/rectUtils'
import MouseStrap from 'mousetrap'

import './editor.less'

export default class Editor extends React.Component {
  constructor (props) {
    super(props)
    this.contentRef = React.createRef()
    this.movableManager = React.createRef()
    this.workspaceWrapper = React.createRef()
    this.viewPortRef = React.createRef()
    this.rightPanelRef = React.createRef()
    this.dataPanelRef = React.createRef()

    this.state = {
      pageProps: {},
      viewX: 0,
      viewY: 0,
      modalFileShow: false,
      zoom: 1
    }
  }

  loadPage (pageConfig) {
    const { Ridge } = window

    this.viewPortRef.current.innerHTML = pageConfig

    this.pageElementManager = Ridge.initialize(this.viewPortRef.current, 'editor-page')

    this.dataPanelRef.current.loadVariables(this.pageElementManager.getVariableConfig())
    this.setState({
      pageProps: this.pageElementManager.getPageProperties()
    }, () => {
      this.fitToCenter()
    })
  }

  componentDidMount () {
    this.initKeyEvents()
    this.initSpaceDragEvents()
  }

  render () {
    const {
      viewPortRef,
      state,
      contentRef,
      rightPanelRef,
      workspaceWrapper,
      onToolbarItemClick,
      workspaceDragOver,
      workspaceDrop,
      zoomChange
    } = this
    const {
      zoom,
      viewX,
      pageProps,
      viewY,
      modalFileShow
    } = state

    return (
      <div className='ridge-editor'>
        <Toolbar zoom={zoom} zoomChange={zoomChange.bind(this)} itemClick={onToolbarItemClick.bind(this)} {...state} />

        <div
          ref={contentRef} className='content'
        >
          <ComponentAddPanel />
          <ConfigPanel ref={rightPanelRef} />
          <div className='workspace' ref={workspaceWrapper} onDrop={workspaceDrop.bind(this)} onDragOver={workspaceDragOver.bind(this)}>
            <div
              ref={viewPortRef}
              className='viewport-container'
              style={{
                transform: `translate(${viewX}px, ${viewY}px) scale(${zoom})`,
                transformOrigin: 'center',
                width: `${pageProps.width}px`,
                height: `${pageProps.height}px`
              }}
            />
          </div>
          <DataPanel ref={this.dataPanelRef} />
        </div>
        <Modal
          title='配置应用资源'
          visible={modalFileShow}
          className='dialog-resource'
          size='large'
          height={640}
          footer={null}
          onCancel={() => {
            this.setState({
              modalFileShow: false
            })
          }}
          closeOnEsc
        >
          <FileManager />
        </Modal>
      </div>
    )
  }

  workspaceDragOver (ev) {
    ev.preventDefault()
    ev.dataTransfer.dropEffect = 'move'
  }

  removeNode () {
    this.pageElementManager.removeElements(this.selectMove.selected)
  }

  /**
   * 放置组件事件
   * @param {*} ev
   */
  workspaceDrop (ev) {
    ev.preventDefault()
    // const { viewPortRef } = this
    // const { zoom } = this.state
    // const workspaceRect = viewPortRef.current.getBoundingClientRect()
    // Get the id of the target and add the moved element to the target's DOM
    const data = ev.dataTransfer.getData('text/plain')
    const fraction = JSON.parse(data)

    const newElement = this.pageElementManager.createElement(fraction)

    // const width = fraction.width ?? 100
    // const height = fraction.height ?? 100
    // const posX = parseInt((ev.pageX - workspaceRect.left - width / 2) / zoom)
    // const posY = parseInt((ev.pageY - workspaceRect.top - height / 2) / zoom)

    this.selectMove.onElementDragEnd(newElement.el, ev.pageX, ev.pageY)

    newElement.initialize()
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

  initSpaceDragEvents () {
    this.selectMove = new SelectableMoveable({
      selectorSelectable: ['.viewport-container .ridge-element'],
      selectorDropContainer: '.workspace',
      selectorDropableTarget: '.ridge-element[droppable]',
      root: this.viewPortRef.current
    })
    this.selectMove.init()

    this.selectMove.onNodeSelected(this.onNodeSelected.bind(this))
    this.selectMove.onNodeMove(this.onNodeMove.bind(this))
    this.selectMove.onNodeResize(this.onNodeMove.bind(this))
    const { workspaceWrapper } = this
    let isViewPortMoving = false

    workspaceWrapper.current?.addEventListener('mousedown', (e) => {
      if (e.ctrlKey) {
        isViewPortMoving = true
      }
    })

    workspaceWrapper.current?.addEventListener('mousemove', event => {
      if (isViewPortMoving && event.ctrlKey && this.state.selectedTargets.length === 0) {
        this.setState({
          viewX: this.state.viewX + event.movementX,
          viewY: this.state.viewY + event.movementY
        })
      }
    })

    workspaceWrapper.current?.addEventListener('mouseup', (e) => {
      isViewPortMoving = false
    })
  }

  initKeyEvents () {
    MouseStrap.bind('del', this.removeNode.bind(this))
  }

  fitToCenter () {
    const refRect = this.contentRef.current.getBoundingClientRect()
    const contentWidth = refRect.width
    const contentHeight = refRect.height
    const { width, height } = this.state.pageProps

    const fit = fitRectIntoBounds({ width, height }, { width: contentWidth, height: contentHeight })

    this.setState({
      zoom: fit.width / width,
      viewX: (contentWidth - width) / 2,
      viewY: (contentHeight - height) / 2
    })
    // if (contentWidth > width && contentHeight > height) {
    // this.setState({
    //   viewX: (contentWidth - width) / 2,
    //   viewY: (contentHeight - height) / 2
    // })
    // }
  }
}
