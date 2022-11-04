import React from 'react'
import Selecto from 'selecto'
import Moveable from 'moveable'
import { Modal } from '@douyinfe/semi-ui'

import Toolbar from './Toolbar.jsx'
import RightPropsPanel from './panels/RightPropsPanel.jsx'
import ComponentAddPanel from './panels/ComponentAddPanel.jsx'
import { PageElementManager, RidgeContext } from 'ridge-view-manager'

import FileManager from './file-manager/FileManager.jsx'

import './editor.less'
import { nanoid } from './utils/string'

export default class Editor extends React.Component {
  constructor (props) {
    super(props)
    this.contentRef = React.createRef()
    this.movableManager = React.createRef()
    this.workspaceWrapper = React.createRef()
    this.viewPortRef = React.createRef()
    this.rightPanelRef = React.createRef()

    this.ridgeContext = new RidgeContext({
      loader: window.loader
    })

    this.pageElementManager = new PageElementManager(this.ridgeContext)
    this.ridgeContext.setCurrentPageManager('default', this.pageElementManager)

    this.state = {
      pageProps: {},
      currentNodeProps: {},
      pageVariables: {},
      viewX: 0,
      viewY: 0,
      modalFileShow: false,
      zoom: 1
    }
  }

  loadPage (pageConfig) {
    console.log('pageConfig', pageConfig)

    this.pageElementManager.mount(this.viewPortRef.current, pageConfig.nodes)

    this.setState({
      pageProps: pageConfig.properties,
      pageVariables: pageConfig.variables ?? {}
    }, () => {
      this.fitToCenter()
      this.rightPanelRef.current?.setPagePropValue(this.state.pageProps)
      this.rightPanelRef.current?.setPageVariabelValue(this.state.pageVariables)
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
      onPagePropChange,
      onToolbarItemClick,
      onNodeCanvasChange,
      workspaceDragOver,
      workspaceDrop,
      zoomChange
    } = this
    const {
      currentNodeProps,
      pageVariables,
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
          <ComponentAddPanel context={this.ridgeContext} />
          <RightPropsPanel node={currentNodeProps} ref={rightPanelRef} inputStyleChange={onNodeCanvasChange.bind(this)} pagePropChange={onPagePropChange.bind(this)} pageVariables={pageVariables} />
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
            >
              <div className='viewport' />
              {/* <MoveableManager
                ref={movableManager}
                resizeEnd={onNodeResizeEnd.bind(this)}
                drag={onNodeDrag.bind(this)}
                dragEnd={onNodeDragEnd.bind(this)}
                selectedTargets={selectedTargets}
                zoom={zoom}
              /> */}
            </div>
          </div>
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

  onNodeDrag (dragEl, event) {
    const target = this.getDroppableTarget(dragEl, {
      x: event.clientX,
      y: event.clientY
    })
    if (target) {
      target.ridgeNode.setDroppable()
    }
  }

  /**
   * 判断正拖拽的节点是否在容器内部区域。（存在嵌套、重叠情况下取最顶层那个）
   * @param {Element} dragEl 被拖拽的DOM Element
   * @param {{x, y}} pointPos 鼠标位置
   * @returns {Element} 可放置的容器DOM Element
   */
  getDroppableTarget (dragEl, pointPos) {
    const droppableElements = document.querySelectorAll('.ridge-node[ridge-droppable]')

    const filtered = Array.from(droppableElements).filter(el => {
      const { x, y, width, height } = el.getBoundingClientRect()
      return pointPos.x > x && pointPos.x < (x + width) && pointPos.y > y && pointPos.y < (y + height) && el !== dragEl
    })

    let target = null
    if (filtered.length === 1) {
      target = filtered[0]
    } else if (filtered.length > 1) {
      const sorted = filtered.sort((a, b) => {
        if (a.contains(b)) {
          return 1
        } else if (b.contains(a)) {
          return -1
        } else {
          return (a.style.zIndex > b.style.zIndex) ? 1 : -1
        }
      })
      target = sorted[0]
    }
    droppableElements.forEach(el => {
      if (el !== target) {
        el.ridgeNode.unsetDroppable()
      }
    })
    return target
  }

  onNodeDragEnd (el, event) {
    this.rightPanelRef.current?.styleChange(el)

    const targetContainer = this.getDroppableTarget(el, {
      x: event.clientX,
      y: event.clientY
    })

    if (targetContainer) {
      // 放置到容器上
      targetContainer.ridgeViewObject.invoke('dropElement', [el])
      this.movableManager.current?.getMoveable().updateTarget()
      targetContainer.ridgeNode.unsetDroppable()
      el.ridgeContainer = targetContainer
    } else {
      // 到ViewPort上
      if (el.ridgeContainer) {
        const { zoom } = this.state

        const transform = `translate(${event.currentTarget.state.left / zoom}px, ${event.currentTarget.state.top / zoom}px)`
        el.style.position = 'absolute'
        el.style.width = event.currentTarget.state.width + 'px'
        el.style.height = event.currentTarget.state.height + 'px'
        el.ridgeContainer = null
        this.viewPortRef.current.getViewPortRef().appendChild(el)
        el.style.transform = transform
        this.movableManager.current?.getMoveable().updateTarget()
      }
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
    this.initSelecto()
    this.initMoveable()
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

  initMoveable () {
    this.moveable = new Moveable(document.body, {
      target: [],
      dimensionViewable: true,
      deleteButtonViewable: false,
      // If the container is null, the position is fixed. (default: parentElement(document.body))
      container: document.body,
      snappable: true,
      snapGap: false,
      draggable: true,
      resizable: true,
      scalable: true,
      rotatable: false,
      warpable: true,
      // Enabling pinchable lets you use events that
      // can be used in draggable, resizable, scalable, and rotateable.
      pinchable: true, // ["resizable", "scalable", "rotatable"]
      origin: true,
      keepRatio: false,
      // Resize, Scale Events at edges.
      edge: false,
      throttleDrag: 0,
      throttleResize: 1,
      throttleScale: 0,
      throttleRotate: 0,
      elementGuidelines: [document.querySelector('.viewport-container')],
      clipArea: true,
      clipVerticalGuidelines: [0, '50%', '100%'],
      clipHorizontalGuidelines: [0, '50%', '100%'],
      clipTargetBounds: true
    })

    this.moveable.on('drag', ev => {
      ev.target.style.transform = ev.transform
      // drag && drag(ev.target, ev)
    })

    this.moveable.on('resize', ({
      target,
      width,
      height,
      delta,
      transform
    }) => {
      target.style.transform = transform
      delta[0] && (target.style.width = `${width}px`)
      delta[1] && (target.style.height = `${height}px`)
    })

    /**
     ref={moveable}
        targets={selectedElement}
        dimensionViewable
        deleteButtonViewable={false}
        draggable
         Only one of resizable, scalable, warpable can be used.
        resizable
        pinchable={['rotatable']}
        zoom={1 / zoom}
        throttleResize={1}
        throttleDragRotate={0}
        /* When resize or scale, keeps a ratio of the width, height.
        keepRatio={selectedTargets.length > 1}
        rotatable={false}
        snappable
        snapGap={false}
        isDisplayInnerSnapDigit
        roundable
        elementGuidelines={elementGuidelines}
        clipArea
        clipVerticalGuidelines={[0, '50%', '100%']}
        clipHorizontalGuidelines={[0, '50%', '100%']}
        clipTargetBounds
        onDragStart={({ target, clientX, clientY }) => {
        }}
        onDragGroupStart={groupDrag => {

        }}
        onDragGroup={({
          events
        }) => {
          events.forEach(({
            target,
            transform
          }) => {
            target.style.transform = transform
          })
        }}
        onResizeGroup={({
          events
        }) => {
          events.forEach(({
            target,
            width,
            height,
            delta,
            transform
          }) => {
            target.style.transform = transform
            delta[0] && (target.style.width = `${width}px`)
            delta[1] && (target.style.height = `${height}px`)
          })
        }}
        onDragEnd={ev => {
          dragEnd && dragEnd(ev.target, ev)
        }}
        onResizeStart={({ target, clientX, clientY }) => {
        }}
        onResize={({
          target,
          width,
          height,
          delta,
          transform
        }) => {
          target.style.transform = transform
          delta[0] && (target.style.width = `${width}px`)
          delta[1] && (target.style.height = `${height}px`)
        }}
        onResizeEnd={({ target, isDrag, clientX, clientY }) => {
          resizeEnd && resizeEnd(target)
        }}
        /* scalable */
    /* Only one of resizable, scalable, warpable can be used.
        scalable
        throttleScale={0}
        onScaleStart={({ target, clientX, clientY }) => {
          console.log('onScaleStart', target)
        }}
        onScale={({
          target, scale, dist, delta, transform,
          clientX, clientY
        }) => {
          console.log('onScale scale', scale)
        }}
        onScaleEnd={({ target, isDrag, clientX, clientY }) => {
          console.log('onScaleEnd', target, isDrag)
        }}
        throttleRotate={0}
        onRotateStart={({ target, clientX, clientY }) => {
          console.log('onRotateStart', target)
        }}
        onRotate={({
          target,
          delta, dist,
          transform,
          clientX, clientY
        }) => {
          console.log('onRotate', dist)
        }}
        onRotateEnd={({ target, isDrag, clientX, clientY }) => {
          console.log('onRotateEnd', target, isDrag)
        }}
            // Enabling pinchable lets you use events that
            // can be used in draggable, resizable, scalable, and rotateable.
        onPinchStart={({ target, clientX, clientY, datas }) => {
          // pinchStart event occur before dragStart, rotateStart, scaleStart, resizeStart
          console.log('onPinchStart')
        }}
        onPinch={({ target, clientX, clientY, datas }) => {
          // pinch event occur before drag, rotate, scale, resize
          console.log('onPinch')
        }}
        onPinchEnd={({ isDrag, target, clientX, clientY, datas }) => {
          // pinchEnd event occur before dragEnd, rotateEnd, scaleEnd, resizeEnd
          console.log('onPinchEnd')
        }}
     */
  }

  initSelecto () {
    this.selecto = new Selecto({
      // The container to add a selection element
      // container: '.viewport',
      // Selecto's root container (No transformed container. (default: null)
      rootContainer: null,
      // The area to drag selection element (default: container)
      dragContainer: '.workspace',
      // Targets to select. You can register a queryselector or an Element.
      selectableTargets: ['.viewport-container .ridge-element'],
      // Whether to select by click (default: true)
      selectByClick: true,
      // Whether to select from the target inside (default: true)
      selectFromInside: false,
      // After the select, whether to select the next target with the selected target (deselected if the target is selected again).
      continueSelect: false,
      // Determines which key to continue selecting the next target via keydown and keyup.
      toggleContinueSelect: 'shift',
      preventDefault: true,
      // The container for keydown and keyup events
      keyContainer: window,
      // The rate at which the target overlaps the drag area to be selected. (default: 100)
      hitRate: 0
    })

    this.selecto.on('dragStart', e => {
      const inputEvent = e.inputEvent
      const target = inputEvent.target
      // Group Selected for resize or move
      if (target.className.indexOf('moveable-area') > -1 || target.className.indexOf('moveable-control') > -1) {
        e.stop()
      }
      const closestRidgeNode = target.closest('.ridge-element')

      if (closestRidgeNode) {
        this.moveable.target = closestRidgeNode
        this.moveable.dragStart(inputEvent)
        e.stop()
      }
      if (inputEvent.ctrlKey) {
        // movableManager.current.getMoveable().dragStart(inputEvent)
        e.stop()
      }
    })

    this.selecto.on('selectEnd', ({ isDragStart, selected, inputEvent, rect }) => {
      if (isDragStart) {
        inputEvent.preventDefault()
      }
      this.moveable.elementGuidelines = [document.querySelector('.viewport-container'), ...Array.from(document.querySelectorAll('.ridge-element')).filter(el => selected.indexOf(el) === -1)]
      this.moveable.target = selected
      // this.setSelectedTargets(selected)
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
