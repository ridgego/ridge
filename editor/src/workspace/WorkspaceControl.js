import Selecto from 'selecto'
import Moveable from 'moveable'
import { fitRectIntoBounds } from '../utils/rectUtils.js'

import '../css/moveable.css'
import Mousetrap from 'mousetrap'
import { EVENT_ELEMENT_SELECTED } from '../constant.js'

/**
 * 控制工作区组件的Drag/Resize/New等动作
 * 控制编辑器的工作区缩放/平移
 */
export default class WorkSpaceControl {
  constructor ({
    ridge,
    workspaceEl,
    viewPortEl,
    zoomable
  }) {
    this.workspaceEl = workspaceEl
    this.viewPortEl = viewPortEl
    this.zoomable = zoomable

    this.ridge = ridge
    // this.selectorDropableTarget = '.viewport-container.active [droppable="1"]'
    this.selectorDropableTarget = ['.ridge-element.container', 'slot']
    this.init()
  }

  init () {
    this.initSelecto()
    this.initMoveable()

    this.initComponentDrop()
    this.initKeyBind()
  }

  disable () {
    this.selecto.destroy()
    this.moveable.destroy()
  }

  setPageManager (manager) {
    this.pageManager = manager
  }

  setViewPort (width, height) {
    this.viewPortEl.style.width = width + 'px'
    this.viewPortEl.style.height = height + 'px'

    this.fitToCenter()
    this.setWorkSpaceMovable()
  }

  fitToCenter () {
    if (this.zoomable) {
      const containerRect = this.workspaceEl.getBoundingClientRect()
      const viewPortRect = this.viewPortEl.getBoundingClientRect()
      const fit = fitRectIntoBounds(viewPortRect, containerRect)

      this.viewPortEl.style.transform = `translate(${(containerRect.width - fit.width) / 2}px, ${(containerRect.height - fit.height) / 2}px) scale(${fit.width / viewPortRect.width})`
      this.viewPortEl.style.transformOrigin = 'center'
    }
  }

  setZoom (zoom) {
    // this.moveable.zoom = zoom
    // this.selecto.zoom = zoom
  }

  setWorkSpaceMovable () {
    this.workspaceMovable = new Moveable(document.body, {
      className: 'workspace-movable',
      target: this.viewPortEl,
      dimensionViewable: true,
      deleteButtonViewable: false,
      // If the container is null, the position is fixed. (default: parentElement(document.body))
      container: document.body,
      snappable: false,
      snapGap: false,
      isDisplayInnerSnapDigit: false,
      draggable: true,
      resizable: true,
      scalable: false,
      rotatable: false,
      warpable: false,
      // Enabling pinchable lets you use events that
      // can be used in draggable, resizable, scalable, and rotateable.
      pinchable: false, // ["resizable", "scalable", "rotatable"]
      origin: true,
      keepRatio: false,
      // Resize, Scale Events at edges.
      edge: false,
      throttleDrag: 0,
      throttleResize: 1,
      throttleScale: 0,
      throttleRotate: 0,
      clipTargetBounds: true
    })

    this.workspaceMovable.on('drag', ev => {
      if (ev.inputEvent.ctrlKey) {
        ev.target.style.transform = ev.transform
      }
    })
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
      sm.moveable.elementGuidelines = this.guidelines
    })

    this.moveable.on('drag', ev => {
      ev.target.style.transform = ev.transform

      sm.checkDropTargetStatus(ev)

      sm.onm && sm.onm(ev.target)
    })

    this.moveable.on('dragEnd', ev => {
      const bcr = ev.target.getBoundingClientRect()
      sm.onElementDragEnd(ev.target, bcr.left + bcr.width / 2, bcr.top + bcr.height / 2)
      sm.ridge.debouncedSaveUpdatePage()
    })

    this.moveable.on('resize', ({
      target,
      width,
      height,
      drag,
      delta,
      transform
    }) => {
      const style = {}
      const matched = transform.match(/[0-9.]+/g)
      style.x = drag.translate[0]
      style.y = drag.translate[1]
      // target.style.transform = transform
      if (delta[0]) {
        style.width = width
      }
      if (delta[1]) {
        style.height = height
      }
      target.elementWrapper.setStyle(style)
      // delta[0] && (target.style.width = `${width}px`)
      // delta[1] && (target.style.height = `${height}px`)
      // sm.onr && sm.onr(target)
    })

    this.moveable.on('resizeEnd', ({
      target,
      width,
      height,
      delta,
      transform
    }) => {
      this.selectElements([target])
      sm.ridge.debouncedSaveUpdatePage()
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
          sm.ridge.debouncedSaveUpdatePage()
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
      dragContainer: this.workspaceEl,
      // Targets to select. You can register a queryselector or an Element.
      selectableTargets: ['.ridge-element'],
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
        this.onNodeSelected(closestRidgeNode)
        this.selected = [closestRidgeNode]
        e.inputEvent && e.inputEvent.stopPropagation()
        e.inputEvent && e.inputEvent.preventDefault()
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
      this.selectElements(selected)
      // this.setSelectedTargets(selected)
    })
  }

  updateMovable () {
    this.moveable.updateTarget()
  }

  initComponentDrop () {
    this.workspaceEl.addEventListener('dragover', ev => {
      ev.preventDefault()
      ev.dataTransfer.dropEffect = 'move'
    })

    this.workspaceEl.addEventListener('drop', ev => {
      this.workspaceDrop(ev)
    })
  }

  initKeyBind () {
    Mousetrap.bind('del', () => {
      if (this.selected) {
        for (const el of this.selected) {
          el.parentElement.removeChild(el)
        }
        this.selectElements([])
      }
    })
    Mousetrap.bind('ctrl+s', () => {
      this.ridge.saveCurrentPage()
      return false
    })
  }

  setSelected (selected) {
    this.selected = selected
    this.moveable.target = selected
  }

  checkDropTargetStatus ({ target, clientX, clientY }) {
    this.getDroppableTarget(target, {
      x: clientX,
      y: clientY
    })
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
      if (target.tagName === 'SLOT') { // 放置到slot中
        // 设置slot属性值为组件id
        target.elementWrapper.setPropsConfig(null, {
          ['props.' + (target.getAttribute('name') || 'slot')]: el.getAttribute('ridge-id')
        })
        // 设置使用slot节点为父节点
        el.elementWrapper.config.parent = target.elementWrapper.id
        el.elementWrapper.config.slotProp = target.getAttribute('name')
        target.elementWrapper.removeStatus('drag-over', target)
      } else {
        // 这里容器会提供 appendChild 方法，并提供放置位置
        target.elementWrapper.invoke('appendChild', [el])
        el.elementWrapper.config.parent = target.elementWrapper.id
        target.elementWrapper.removeStatus('drag-over')
        target.elementWrapper.updateConfig()
      }
    } else {
      // DOM操作，放置到ViewPort上
      this.putElementToRoot(el, x, y)

      // 更新配置
      if (el.elementWrapper.config.slotProp && el.elementWrapper.config.parent) {
        this.pageManager.getElement(el.elementWrapper.config.parent).setPropsConfig(null, {
          ['props.' + el.elementWrapper.config.slotProp]: null
        })
        el.elementWrapper.config.slotProp = null
        el.elementWrapper.config.parent = null
      } else if (el.elementWrapper.config.parent) {
        this.pageManager.getElement(el.elementWrapper.config.parent).updateConfig()
        el.elementWrapper.config.parent = null
      }
    }
    this.selectElements([el])
    this.moveable.updateTarget()
  }

  /**
   * 将元素放置到根页面上某个位置
   * @param {*} el HTML元素
   * @param {*} x
   * @param {*} y
   */
  putElementToRoot (el, x, y) {
    // 修改父子关系
    this.viewPortEl.appendChild(el)
    // 计算位置
    const rbcr = this.viewPortEl.getBoundingClientRect()
    const bcr = el.getBoundingClientRect()

    el.elementWrapper.setStyle({
      position: 'absolute',
      x: x - rbcr.x - bcr.width / 2,
      y: y - rbcr.y - bcr.height / 2
    })
    this.moveable.updateTarget()
  }

  selectElements (elements) {
    this.moveable.target = elements
    if (elements.length <= 1) {
      this.onNodeSelected(elements[0])
    }
    this.selected = elements
  }

  /**
   * 放置组件事件
   * @param {*} ev
   */
  workspaceDrop (ev) {
    ev.preventDefault()

    const data = ev.dataTransfer.getData('text/plain')
    const fraction = JSON.parse(data)

    const div = document.createElement('div')
    const wrapper = this.pageManager.createElement(fraction)

    wrapper.mount(div)

    this.onElementDragEnd(div, ev.pageX, ev.pageY)
    this.ridge.saveCurrentPage()
  }

  onNodeSelected (el) {
    this.ridge.emit(EVENT_ELEMENT_SELECTED, el)
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
    let droppableElements = []
    for (const selector of this.selectorDropableTarget) {
      droppableElements = droppableElements.concat(Array.from(document.querySelectorAll(selector)))
    }

    const filtered = Array.from(droppableElements).filter(el => {
      // 排除掉目标的子节点
      if (dragEl.contains(el)) {
        return false
      }
      const { x, y, width, height } = el.getBoundingClientRect()
      return pointPos.x > x && pointPos.x < (x + width) && pointPos.y > y && pointPos.y < (y + height) && el !== dragEl && el.closest('[ridge-id]') !== dragEl
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
        el.elementWrapper.removeStatus('drag-over', el)
        // if (el.classList.contains('drag-over')) {
        //   el.classList.remove('drag-over')
        // }
      } else {
        el.elementWrapper.setStatus('drag-over', el)
        // el.classList.add('drag-over')
      }
    })
    return target
  }
}
