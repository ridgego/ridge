import React from 'react'
import Selecto from 'react-selecto'
import { Modal } from '@douyinfe/semi-ui'

import Viewport from './viewport/ViewPort.jsx'
import MoveableManager from './viewport/MoveableMananger.jsx'
import Toolbar from './Toolbar.jsx'
import RightPropsPanel from './panels/RightPropsPanel.jsx'
import ComponentAddPanel from './panels/ComponentAddPanel.jsx'

import FileManager from './file-manager/FileManager.jsx'

import { nanoid } from './utils/string'

export default class Editor extends React.Component {
  constructor (props) {
    super(props)
    this.contentRef = React.createRef()
    this.movableManager = React.createRef()
    this.workspaceWrapper = React.createRef()
    this.viewPortRef = React.createRef()
    this.rightPanelRef = React.createRef()
    this.state = {
      selectedTargets: [],
      pageProps: {},
      nodes: [],
      currentNodeProps: {},
      pageVariables: {},
      viewX: 0,
      viewY: 0,
      modalFileShow: false,
      zoom: 1
    }
  }

  loadPage (pageConfig) {
    this.setState({
      nodes: pageConfig.nodes,
      pageProps: pageConfig.properties,
      pageVariables: pageConfig.variables
    }, () => {
      this.rightPanelRef.current?.setPagePropValue(this.state.pageProps)
      this.rightPanelRef.current?.setPageVariabelValue(this.state.pageVariables)
      this.fitToCenter()
    })
  }

  getPageConfig () {
    return {
      nodes: this.state.nodes
    }
  }

  componentDidMount () {
    this.initSpaceDragEvents()
  }

  render () {
    const {
      viewPortRef,
      state,
      contentRef,
      rightPanelRef,
      workspaceWrapper,
      movableManager,
      onPagePropChange,
      onToolbarItemClick,
      onNodeCanvasChange,
      onNodeResizeEnd,
      onNodeDragEnd,
      workspaceDragOver,
      workspaceDrop,
      zoomChange
    } = this
    const {
      selectedTargets,
      currentNodeProps,
      pageVariables,
      nodes,
      zoom,
      viewX,
      pageProps,
      viewY,
      modalFileShow
    } = state

    return (
      <div className='ridge-editor'>
        <Toolbar zoom={zoom} zoomChange={zoomChange.bind(this)} itemClick={onToolbarItemClick.bind(this)} />
        <div
          ref={contentRef} className='content'
        >
          <ComponentAddPanel />
          <RightPropsPanel node={currentNodeProps} ref={rightPanelRef} inputStyleChange={onNodeCanvasChange.bind(this)} pagePropChange={onPagePropChange.bind(this)} pageVariables={pageVariables} />
          <div className='workspace' ref={workspaceWrapper} onDrop={workspaceDrop.bind(this)} onDragOver={workspaceDragOver.bind(this)}>
            <Viewport
              ref={viewPortRef}
              nodes={nodes}
              style={{
                transform: `translate(${viewX}px, ${viewY}px) scale(${zoom})`,
                transformOrigin: 'center',
                width: `${pageProps.width}px`,
                height: `${pageProps.height}px`
              }}
            >
              <MoveableManager
                ref={movableManager}
                resizeEnd={onNodeResizeEnd.bind(this)}
                dragEnd={onNodeDragEnd.bind(this)}
                selectedTargets={selectedTargets}
                zoom={zoom}
              />
            </Viewport>
          </div>
        </div>
        <Selecto
          dragContainer='.workspace'
          hitRate={0}
          selectableTargets={['.viewport-container .ridge-node']}
          selectByClick
          selectFromInside={false}
          toggleContinueSelect={['shift']}
          preventDefault
          onDragStart={e => {
            const inputEvent = e.inputEvent
            const target = inputEvent.target
            // Group Selected for resize or move
            if (target.className.indexOf('moveable-area') > -1 || target.className.indexOf('moveable-control') > -1) {
              e.stop()
            }
            const closestRidgeNode = target.closest('.ridge-node')

            if (closestRidgeNode) {
              this.setState({
                selectedTargets: [closestRidgeNode].map(el => el.getAttribute('id'))
              }, () => {
                movableManager.current.getMoveable().dragStart(inputEvent)
              })
              this.setSelectedTargets([closestRidgeNode])
              e.stop()
            }
            if (inputEvent.ctrlKey) {
              // movableManager.current.getMoveable().dragStart(inputEvent)
              e.stop()
            }
          }}
          onScroll={({ direction }) => {
          }}
          onSelectEnd={({ isDragStart, selected, inputEvent, rect }) => {
            if (isDragStart) {
              inputEvent.preventDefault()
            }
            this.setSelectedTargets(selected)
          }}
        />
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

  /**
   * 放置组件事件
   * @param {*} ev
   */
  workspaceDrop (ev) {
    ev.preventDefault()
    // Get the id of the target and add the moved element to the target's DOM
    const data = ev.dataTransfer.getData('text/plain')
    const component = JSON.parse(data)
    const { viewPortRef } = this
    const { zoom } = this.state
    const workspaceRect = viewPortRef.current.getBoundingClientRect()

    const width = component.width ?? 100
    const height = component.height ?? 100
    const posX = parseInt((ev.pageX - workspaceRect.left - width / 2) / zoom)
    const posY = parseInt((ev.pageY - workspaceRect.top - height / 2) / zoom)

    const ta = [].concat(this.state.nodes).concat([{
      id: nanoid(10),
      name: '按钮',
      component,
      props: {
        __isEditor: true
      },
      style: {
        transform: `translate(${posX}px, ${posY}.px)`,
        position: 'absolute',
        width: width + 'px',
        height: height + 'px'
      }
    }])

    this.setState({
      nodes: ta
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

  onNodeDragEnd (el, event) {
    this.rightPanelRef.current?.styleChange(el)

    if (window.droppableContainer) {
      window.droppableContainer.appendElement(el, event)
    }
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

  nodePropChange (node) {
    this.rightPanelRef.current?.nodeChange(node)
  }

  setSelectedTargets (selected) {
    this.setState({
      selectedTargets: selected.map(el => el.getAttribute('id'))
    }, () => {
      if (selected.length === 1) {
        const nodeId = selected[0].getAttribute('ridge-componet-id')
        this.nodePropChange(this.state.nodes.filter(n => n.id === nodeId)[0], selected[0])
      } else if (selected.length === 0) {
        this.nodePropChange(null)
      }
    })
  }

  zoomChange (zoom) {
    if (zoom) {
      this.setState({
        zoom
      })
    } else {
      this.fitToCenter()
    }
  }

  initSpaceDragEvents () {
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

  fitToCenter () {
    const refRect = this.contentRef.current.getBoundingClientRect()
    const contentWidth = refRect.width
    const contentHeight = refRect.height
    const { width, height } = this.state.pageProps

    if (contentWidth > width && contentHeight > height) {
      this.setState({
        viewX: (contentWidth - width) / 2,
        viewY: (contentHeight - height) / 2
      })
    }
  }
}
