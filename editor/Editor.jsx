import React from 'react'
import Selecto from 'react-selecto'
import Viewport from './viewport/ViewPort.jsx'
import MoveableManager from './viewport/MoveableMananger.jsx'
import Toolbar from './Toolbar.jsx'
import RightPropsPanel from './panels/RightPropsPanel.jsx'
import ComponentAddPanel from './panels/ComponentAddPanel.jsx'

import { nanoid } from './utils/string'

export default class Editor extends React.Component {
  constructor (props) {
    super(props)
    this.contentRef = React.createRef()
    this.movableManager = React.createRef()
    this.workspaceWrapper = React.createRef()
    this.viewPortRef = React.createRef()
    this.nodePropPanelRef = React.createRef()
    this.state = {
      selectedTargets: [],
      pageProps: {},
      nodes: [],
      currentNodeProps: {},
      viewX: 0,
      viewY: 0,
      zoom: 1
    }
  }

  loadPage (pageConfig) {
    this.setState({
      nodes: pageConfig.nodes,
      pageProps: pageConfig.properties
    }, () => {
      this.fitToCenter()
    })
  }

  getPageConfig () {
    return {
      nodes: this.state.nodes
    }
  }

  render () {
    const {
      viewPortRef,
      state,
      contentRef,
      nodePropPanelRef,
      workspaceWrapper,
      nodeStyleChange,
      movableManager,
      nodeCanvasChange,
      workspaceDragOver,
      workspaceDrop,
      zoomChange
    } = this
    const {
      selectedTargets,
      currentNodeProps,
      nodes,
      zoom,
      viewX,
      pageProps,
      viewY
    } = state

    return (
      <div className='ridge-editor'>
        <Toolbar zoom={zoom} zoomChange={zoomChange.bind(this)} />
        <div
          ref={contentRef} className='content' style={{
            top: '42px',
            bottom: 0,
            position: 'absolute',
            width: '100%'
          }}
        >
          <ComponentAddPanel />
          <RightPropsPanel node={currentNodeProps} ref={nodePropPanelRef} inputStyleChange={nodeCanvasChange.bind(this)} />
          <div className='workspace' ref={workspaceWrapper} onDrop={workspaceDrop.bind(this)} onDragOver={workspaceDragOver}>
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
                styleChange={nodeStyleChange.bind(this)}
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
              movableManager.current.getMoveable().dragStart(inputEvent)
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
      props: {},
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

  nodeStyleChange (el) {
    this.nodePropPanelRef.current?.styleChange(el)
  }

  /**
   * Update To Canvas Style
   */
  nodeCanvasChange (values, field) {
    const { selectedTargets } = this.state
    document.getElementById(selectedTargets[0]).style.width = values.width + 'px'
    document.getElementById(selectedTargets[0]).style.height = values.height + 'px'
    document.getElementById(selectedTargets[0]).style.transform = `translate(${values.x}px, ${values.y}px)`
    const moveable = this.movableManager.current?.getMoveable()
    moveable.updateTarget()
  }

  nodePropChange (node) {
    this.nodePropPanelRef.current?.nodeChange(node)
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

  componentDidMount () {
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
