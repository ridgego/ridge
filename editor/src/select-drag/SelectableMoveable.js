import Selecto from 'selecto'
import Moveable from 'moveable'

class SelectableMoveable {
  constructor ({
    dropableSelectors
  }) {
    this.dropableSelectors = dropableSelectors
  }

  init () {
    this.initSelecto()
    this.initMoveable()
  }

  initMoveable () {
    const sm = this
    this.moveable = new Moveable(document.body, {
      target: [],
      dimensionViewable: true,
      deleteButtonViewable: false,
      // If the container is null, the position is fixed. (default: parentElement(document.body))
      container: document.body,
      snappable: true,
      snapGap: false,
      isDisplayInnerSnapDigit: false,
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
      clipArea: true,
      clipVerticalGuidelines: [0, '50%', '100%'],
      clipHorizontalGuidelines: [0, '50%', '100%'],
      clipTargetBounds: true
    })

    this.moveable.on('dragStart', ev => {
      this.moveable.elementGuidelines = this.guidelines
    })

    this.moveable.on('drag', ev => {
      ev.target.style.transform = ev.transform
      const target = this.getDroppableTarget(ev.target, {
        x: ev.clientX,
        y: ev.clientY
      })
      if (target) {
        target.elementWrapper.setStatus('droppable')
      }
      sm.onm && sm.onm(ev.target)
    })

    this.moveable.on('dragEnd', ev => {
      const target = this.getDroppableTarget(ev.target, {
        x: ev.clientX,
        y: ev.clientY
      })
      if (target) {
        // if (target.elementWrapper.id !== ev.target.getAttribute('containerId')) {
        target.elementWrapper.invoke('dropElement', [ev.target])
        // }
        target.elementWrapper.removeStatus('drappable')
      }
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
      sm.onr && sm.onr(target)
    })

    this.moveable.on('dragGroup', ({
      events
    }) => {
      events.forEach(({
        target,
        transform
      }) => {
        target.style.transform = transform
      })
    })

    this.moveable.on('resizeGroup', ({
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

        this.guidelines = [document.querySelector('.viewport-container'), ...Array.from(document.querySelectorAll('.ridge-element')).filter(el => el !== closestRidgeNode)]
        this.moveable.elementGuidelines = this.guidelines
        this.moveable.dragStart(inputEvent)
        this.ons && this.ons(closestRidgeNode)
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

      this.guidelines = [document.querySelector('.viewport-container'), ...Array.from(document.querySelectorAll('.ridge-element')).filter(el => selected.indexOf(el) === -1)]
      console.log('guide lines', selected, this.moveable.elementGuidelines, this.guidelines)
      this.moveable.target = selected
      if (selected.length <= 1) {
        this.ons && this.ons(selected[0])
      }
      // this.setSelectedTargets(selected)
    })
  }

  onNodeSelected (ons) {
    this.ons = ons
  }

  onNodeResize (onr) {
    this.onr = onr
  }

  onNodeMove (onm) {
    this.onm = onm
  }

  /**
   * 判断正拖拽的节点是否在容器内部区域。（存在嵌套、重叠情况下取最顶层那个）
   * @param {Element} dragEl 被拖拽的DOM Element
   * @param {{x, y}} pointPos 鼠标位置
   * @returns {Element} 可放置的容器DOM Element
   */
  getDroppableTarget (dragEl, pointPos) {
    const droppableElements = document.querySelectorAll(this.dropableSelectors)

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
        el.elementWrapper.removeStatus('droppable')
      }
    })
    return target
  }
}

export default SelectableMoveable
