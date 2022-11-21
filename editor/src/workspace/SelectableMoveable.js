import Selecto from 'selecto'
import Moveable from 'moveable'

class SelectableMoveable {
  constructor ({
    dropableSelectors,
    root
  }) {
    this.rootEl = root
    this.dropableSelectors = dropableSelectors
  }

  init () {
    this.initSelecto()
    this.initMoveable()
  }

  setZoom (zoom) {
    // this.moveable.zoom = zoom
    // this.selecto.zoom = zoom
  }

  checkDropTargetStatus (el, x, y) {
    const target = this.getDroppableTarget(el, {
      x,
      y
    })
    if (target) {
      target.elementWrapper.setStatus('droppable')
    }
  }

  /**
   * 鼠标拖拽元素（新增/既有）到页面区域
   * @param {Element} el 元素DOM对象
   * @param {number} x 鼠标当前位置X
   * @param {number} y 鼠标位置Y
   */
  onElementDragEnd (el, x, y) {
    // 获取可放置的容器
    const target = this.getDroppableTarget(el, {
      x,
      y
    })
    if (target) { // 放置到容器中
      const result = target.elementWrapper.invoke('dropElement', [el])
      // 这里容器会提供 dropElement 方法，并未wrapper提供放置位置
      if (result === false) {
        // 容器反馈不能放置，则还是放置到页面根部
        this.putElementToRoot(el, x, y)
      } else {
        // 放置好后，设置容器containerId标识 （是否有必要）
        el.setAttribute('containerId', target.elementWrapper.id)
      }
      target.elementWrapper.removeStatus('drappable')
    } else {
      // 到ViewPort上
      if (el.getAttribute('containerId') || // 从另一个容器拖出
          el.parentElement == null // 新建
      ) {
        el.removeAttribute('containerId')
        this.putElementToRoot(el, x, y)
      }
    }
  }

  putElementToRoot (el, x, y) {
    this.rootEl.appendChild(el)
    const rbcr = this.rootEl.getBoundingClientRect()
    const bcr = el.getBoundingClientRect()
    const transform = `translate(${x - rbcr.x - bcr.width / 2}px, ${y - rbcr.y - bcr.height / 2}px)`
    el.style.position = 'absolute'
    el.setAttribute('snappable', true)
    el.style.width = bcr.width + 'px'
    el.style.height = bcr.height + 'px'
    el.style.transform = transform
    this.moveable.updateTarget()
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

      this.checkDropTargetStatus(ev.target, ev.clientX, ev.clientY)

      sm.onm && sm.onm(ev.target)
    })

    this.moveable.on('dragEnd', ev => {
      this.onElementDragEnd(ev.target, ev.clientX, ev.clientY)
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
        if (!target.getAttribute('containerId')) {
          target.style.transform = transform
        }
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
        this.selected = [closestRidgeNode]
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

      this.guidelines = [document.querySelector('.viewport-container'), ...Array.from(document.querySelectorAll('.ridge-element[snappable="true"]')).filter(el => selected.indexOf(el) === -1)]
      this.moveable.target = selected
      if (selected.length <= 1) {
        this.ons && this.ons(selected[0])
      }
      this.selected = selected
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
