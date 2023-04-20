import Selecto from 'selecto'
import { createMoveable } from './moveable'
import Mousetrap from 'mousetrap'
import { EVENT_ELEMENT_CREATED, EVENT_ELEMENT_DRAG_END, EVENT_ELEMENT_SELECTED, EVENT_ELEMENT_UNSELECT, EVENT_PAGE_PROP_CHANGE } from '../constant.js'
import { emit, on } from '../service/RidgeEditService'

import debug from 'debug'
const trace = debug('ridge:workspace')
/**
 * 控制工作区组件的Drag/Resize/New等动作
 * 控制编辑器的工作区缩放/平移
 */
export default class WorkSpaceControl {
  init ({
    workspaceEl,
    viewPortEl
  }) {
    this.workspaceEl = workspaceEl
    this.viewPortEl = viewPortEl

    this.selectorDropableTarget = ['.ridge-container']

    on(EVENT_ELEMENT_SELECTED, payload => {
      if (payload.from === 'outline' &&
        !payload.element.classList.contains('is-locked') &&
        !payload.element.classList.contains('is-hidden') &&
        !payload.element.classList.contains('is-full')) {
        this.selectElements([payload.element])
      }
    })
    on(EVENT_ELEMENT_UNSELECT, ({ element }) => {
      this.selectElements([])
    })
    this.initKeyBind()
    this.initComponentDrop()
  }

  enable () {
    this.initSelecto()
    this.initMoveable()
    this.setWorkSpaceMovable()
    this.enabled = true
  }

  disable () {
    if (this.enabled) {
      this.selecto.destroy()
      this.moveable.destroy()
      if (this.workspaceMovable) {
        this.workspaceMovable.destroy()
        this.workspaceMovable = null
      }
      this.enabled = false
    }
  }

  setPageManager (manager) {
    this.pageManager = manager
  }

  fitToCenter (width, height) {
    this.viewPortEl.style.width = width + 'px'
    this.viewPortEl.style.height = height + 'px'

    const containerRect = this.workspaceEl.getBoundingClientRect()

    this.workspaceX = (containerRect.width - width) / 2
    this.workspaceY = (containerRect.height - height) / 2

    this.viewPortEl.style.transform = `translate(${this.workspaceX}px, ${(this.workspaceY) / 2}px)`
  }

  setZoom (zoom) {
    // this.moveable.zoom = zoom
    // this.selecto.zoom = zoom
  }

  setWorkSpaceMovable () {
    const that = this
    /*
    this.workspaceEl.addEventListener('mousedown', event => {
      if (event.ctrlKey && this.enabled) {
        that.startDrag = true
        that.startX = event.pageX
        that.startY = event.pageY

        const wbc = that.workspaceEl.getBoundingClienect()
        const vbc = that.viewPortEl.getBoundingClientRect()

        that.workspaceX = vbc.x - wbc.x
        that.workspaceY = vbc.y - wbc.y
      }
    })
    this.workspaceEl.addEventListener('mousemove', event => {
      if (!event.ctrlKey) {
        that.startDrag = false
      }
      if (that.startDrag) {
        const deltaX = event.pageX - that.startX
        const deltaY = event.pageY - that.startY

        that.viewPortEl.style.transform = `translate(${that.workspaceX + deltaX}px, ${that.workspaceY + deltaY}px)`
      }
    })

    this.workspaceEl.addEventListener('mouseup', event => {
      that.startDrag = false
    })

    */
    this.workspaceMovable = createMoveable({
      target: this.viewPortEl,
      className: 'workspace-movable'
    })

    this.workspaceMovable.on('dragStart', ev => {
      trace('viewPortEl dragStart')
      if (ev.inputEvent.ctrlKey) {
        this.workspaceMovable.dragWorkSpace = true
      } else {
        this.workspaceMovable.dragWorkSpace = false
      }
    })

    this.workspaceMovable.on('drag', ev => {
      trace('viewPortEl drag')
      if (ev.inputEvent.ctrlKey && this.workspaceMovable.dragWorkSpace) {
        this.moveable.target = null
        ev.target.style.transform = ev.transform
      }
    })
    this.workspaceMovable.on('resize', ev => {
      if (ev.delta && ev.delta[0] && ev.delta[1]) {
        emit(EVENT_PAGE_PROP_CHANGE, {
          from: 'workspace',
          properties: {
            width: ev.width,
            height: ev.height
          }
        })
      }
    })
  }

  initMoveable () {
    const sm = this

    this.moveable = createMoveable({
      target: [],
      snappable: true,
      warpable: true,
      scalable: true
    })

    this.moveable.on('dragStart', ev => {
      trace('movable dragStart', ev.target)
      // if (this.selected.indexOf(ev.target) > -1) {
      //   this.onElementDragStart(ev.target, ev)
      //   this.moveable.updateTarget()
      // }
    })

    this.moveable.on('drag', ev => {
      const target = ev.target
      if (target.classList.contains('is-locked') || target.classList.contains('is-full')) {
        return
      }
      trace('movable drag', ev)
      const config = ev.target.elementWrapper.config

      if (config.parent) {
        sm.onElementDragStart(ev.target, ev.inputEvent)
      } else {
        sm.checkDropTargetStatus(ev)
      }

      ev.target.style.transform = `translate(${config.style.x + ev.dist[0]}px,${config.style.y + ev.dist[1]}px)`
    })

    this.moveable.on('dragEnd', ev => {
      if (ev.isDrag) {
        trace('movable dragEnd')
        // if (ev.isDrag) {
        const bcr = ev.target.getBoundingClientRect()
        sm.placeElementAt(ev.target, bcr.left + bcr.width / 2, bcr.top + bcr.height / 2)
      }
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
      target.elementWrapper.setConfigStyle(style)
    })

    this.moveable.on('resizeEnd', ({
      target,
      width,
      height,
      delta,
      transform
    }) => {
      this.selectElements([target])
    })

    this.moveable.on('dragGroup', ({
      events
    }) => {
      events.forEach(({
        target,
        transform
      }) => {
        if (!target.elementWrapper.config.parent) {
          target.style.transform = transform
        }
      })
    })
    this.moveable.on('dragGroupEnd', (payload) => {
      payload.events.forEach(({ target }) => {
        // TODO 目前仅支持根节点？？
        if (!target.elementWrapper.config.parent) {
          const bcr = target.getBoundingClientRect()
          this.putElementToRoot(target, bcr.left + bcr.width / 2, bcr.top + bcr.height / 2)
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

    this.moveable.on('resizeGroupEnd', payload => {
      payload.events.forEach(({ target }) => {
        if (!target.elementWrapper.config.parent) {
          const bcr = target.getBoundingClientRect()
          target.elementWrapper.setConfigStyle({
            x: bcr.left + bcr.width / 2,
            y: bcr.top + bcr.height / 2
          })
        }
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
      selectFromInside: true,
      // After the select, whether to select the next target with the selected target (deselected if the target is selected again).
      continueSelect: false,
      // Determines which key to continue selecting the next target via keydown and keyup.
      toggleContinueSelect: 'ctrl',
      preventDefault: true,
      // The container for keydown and keyup events
      keyContainer: window,
      // The rate at which the target overlaps the drag area to be selected. (default: 100)
      hitRate: 0
    })

    this.selecto.on('dragStart', this.onSelectoDragStart.bind(this))

    this.selecto.on('selectEnd', ({ isDragStart, selected, inputEvent, rect }) => {
      if (isDragStart) {
        inputEvent.preventDefault()
      }
      this.moveable.elementGuidelines = [document.querySelector('.viewport-container'), ...Array.from(document.querySelectorAll('.ridge-element')).filter(el => selected.indexOf(el) === -1)]
      this.guidelines = [document.querySelector('.viewport-container'), ...Array.from(document.querySelectorAll('.ridge-element[snappable="true"]')).filter(el => selected.indexOf(el) === -1)]
      this.selectElements(selected.filter(el => {
        return !el.classList.contains('is-locked') && !el.classList.contains('is-hidden') && !el.classList.contains('is-full')
      }))
    })
  }

  updateMovable () {
    this.moveable.updateTarget()
  }

  onSelectoDragStart (e) {
    const inputEvent = e.inputEvent
    const target = inputEvent.target
    // Group Selected for resize or move
    if (target.className && target.className.indexOf && (target.className.indexOf('moveable-area') > -1 || target.className.indexOf('moveable-control') > -1)) {
      e.stop()
    }
    if (inputEvent.ctrlKey) {
      e.stop()
      return
    }
    trace('selecto dragStart')
    const closestRidgeNode = target.closest('.ridge-element')

    if (closestRidgeNode && !closestRidgeNode.classList.contains('is-locked') &&
    !closestRidgeNode.classList.contains('is-full') &&
    !closestRidgeNode.classList.contains('is-hidden')) {
      if (inputEvent.shiftKey) {
        // shift时，原地复制一个节点，选中节点继续拖拽
        const rect = closestRidgeNode.getBoundingClientRect()
        const cloned = this.pageManager.cloneElement(closestRidgeNode.elementWrapper)
        this.placeElementAt(cloned.el, rect.x + rect.width / 2, rect.y + rect.height / 2)
      }

      // 清除既有选中
      if (this.moveable.target && this.moveable.target.length) {
        // const bcr = this.moveable.target[0].getBoundingClientRect()
        // this.selectElements([])
        this.moveable.target = null
        // this.moveable.updateTarget()
        // this.placeElementAt(this.moveable.target[0], bcr.left + bcr.width / 2, bcr.top + bcr.height / 2)
      }
      this.moveable.target = closestRidgeNode

      this.guidelines = [document.querySelector('.viewport-container'), ...Array.from(document.querySelectorAll('.ridge-element')).filter(el => {
        return el !== closestRidgeNode && el.closest('.ridge-element') !== closestRidgeNode
      })]
      this.moveable.elementGuidelines = this.guidelines
      this.moveable.elementSnapDirections = { top: true, left: true, bottom: true, right: true, center: true, middle: true }
      this.moveable.snapDirections = { top: true, left: true, bottom: true, right: true, center: true, middle: true }

      // this.onElementDragStart(closestRidgeNode, inputEvent)
      this.moveable.dragStart(inputEvent)
      this.selectElements([closestRidgeNode])

      e.inputEvent && e.inputEvent.stopPropagation()
      e.inputEvent && e.inputEvent.preventDefault()
      e.stop()
    } else if (inputEvent.ctrlKey) {
      // movableManager.current.getMoveable().dragStart(inputEvent)
      e.stop()
    }
  }

  initComponentDrop () {
    this.workspaceEl.addEventListener('dragover', ev => {
      if (!this.enabled) {
        return
      }
      if (this.selected.length) {
        this.selectElements([])
      }
      ev.dataTransfer.dropEffect = 'move'
      this.checkDropTargetStatus({
        width: window.dragComponent.width,
        height: window.dragComponent.height,
        clientX: ev.clientX,
        clientY: ev.clientY
      })
      ev.preventDefault()
    })

    this.workspaceEl.addEventListener('drop', this.workspaceDrop.bind(this))
  }

  initKeyBind () {
    Mousetrap.bind('del', () => {
      if (!this.enabled) {
        return
      }
      if (this.selected) {
        for (const el of this.selected) {
          this.pageManager.removeElement(el.elementWrapper.id)
        }
        this.selectElements([])
      }
    })

    Mousetrap.bind('right', () => {
      if (this.selected) {
        for (const el of this.selected) {
          el.elementWrapper.setConfigStyle({
            x: el.elementWrapper.config.style.x + 1
          })
        }
        this.moveable.updateTarget()
      }
    })

    Mousetrap.bind('left', () => {
      if (this.selected) {
        for (const el of this.selected) {
          el.elementWrapper.setConfigStyle({
            x: el.elementWrapper.config.style.x - 1
          })
        }
        this.moveable.updateTarget()
      }
    })
    Mousetrap.bind('up', () => {
      if (this.selected) {
        for (const el of this.selected) {
          el.elementWrapper.setConfigStyle({
            y: el.elementWrapper.config.style.y - 1
          })
        }
        this.moveable.updateTarget()
      }
    })
    Mousetrap.bind('down', () => {
      if (this.selected) {
        for (const el of this.selected) {
          el.elementWrapper.setConfigStyle({
            y: el.elementWrapper.config.style.y + 1
          })
        }
        this.moveable.updateTarget()
      }
    })
  }

  checkDropTargetStatus ({ target, clientX, clientY, width, height }) {
    trace('checkDropTargetStatus')
    this.getDroppableTarget(target, {
      x: clientX,
      y: clientY,
      width,
      height
    }, true)
  }

  /**
   * 页面元素（el）释放到工作区某个位置结束
   * @param {Element} el 元素DOM对象
   * @param {number} x 鼠标当前位置X
   * @param {number} y 鼠标位置Y
   */
  placeElementAt (el, x, y) {
    trace('Element Drag End', el, { x, y })
    // 获取可放置的容器
    const targetEl = this.getDroppableTarget(el, {
      x,
      y
    }, false)
    trace('Drop target', targetEl)
    const sourceElement = el.elementWrapper
    const targetParentElement = targetEl ? targetEl.elementWrapper : null
    if (targetParentElement == null) {
      // 根上移动： 只更新配置
      trace('页面上移动')
      this.putElementToRoot(el, x, y)
    } else {
      // 放入一个容器
      trace('从页面到父容器')
      this.pageManager.attachToParent(targetParentElement, sourceElement, { x, y })
    }
    emit(EVENT_ELEMENT_DRAG_END, {
      sourceElement: el,
      targetParentElement,
      elements: this.pageManager.getPageElements()
    })
    this.moveable.updateTarget()
  }

  /**
   * 将元素放置到根页面上某个位置
   * @param {*} el HTML元素
   * @param {*} x
   * @param {*} y
   */
  putElementToRoot (el, x, y) {
    // 计算位置
    const rbcr = this.viewPortEl.getBoundingClientRect()
    // 修改父子关系
    this.viewPortEl.appendChild(el)
    const bcr = el.getBoundingClientRect()
    el.elementWrapper.setConfigStyle({
      position: 'absolute',
      x: x - rbcr.x - bcr.width / 2,
      y: y - rbcr.y - bcr.height / 2
    })
    this.moveable.updateTarget()
  }

  /**
   * 处理开始拖拽事件, 处理当前节点从父容器脱离放置到根上
   * @param {*} el
   * @param {*} event
   */
  onElementDragStart (el, event) {
    const beforeRect = el.getBoundingClientRect()
    // 计算位置
    const rbcr = this.viewPortEl.getBoundingClientRect()
    this.pageManager.detachChildElement(el.elementWrapper)

    this.viewPortEl.appendChild(el)

    el.elementWrapper.setConfigStyle({
      position: 'absolute',
      x: beforeRect.x - rbcr.x,
      y: beforeRect.y - rbcr.y,
      width: beforeRect.width,
      height: beforeRect.height
    })

    this.checkDropTargetStatus({
      target: el,
      clientX: event.clientX,
      clientY: event.clientY
    })
    // this.moveable.updateTarget()
  }

  /**
   * 设置选择元素，包含选择“空”的情况
   * @param {*} elements
   * @param {*} notNotify
   */
  selectElements (elements, notNotify) {
    if (elements === this.selected) {
      return
    }
    this.selected = elements
    this.moveable.target = elements
    this.moveable.updateTarget()
    if (!notNotify && elements && elements.length <= 1) {
      emit(EVENT_ELEMENT_SELECTED, {
        from: 'workspace',
        element: elements[0],
        elements: this.pageManager.getPageElements()
      })
    }

    if (elements) {
      window.sl = elements.map(e => e.elementWrapper)
    }
  }

  /**
   * 放置组件事件
   * @param {*} ev
   */
  workspaceDrop (ev) {
    if (!this.enabled) {
      return
    }
    ev.preventDefault()

    const data = ev.dataTransfer.getData('text/plain')
    const fraction = JSON.parse(data)

    const div = document.createElement('div')

    const wrapper = this.pageManager.createElement(fraction)
    wrapper.mount(div).then(() => {
      emit(EVENT_ELEMENT_CREATED, {
        elements: this.pageManager.getPageElements(),
        element: wrapper
      })
    })

    this.onElementDragEnd(div, ev.pageX, ev.pageY)
  }

  copy (divs) {
    for (const div of divs) {
      const newWrapper = this.pageManager.cloneElement(div.elementWrapper)
      this.pageManager.putElementToRoot(newWrapper)
    }
  }

  /**
   * 判断正拖拽的节点是否在容器内部区域。（存在嵌套、重叠情况下取最顶层那个）
   * @param {Element} dragEl 被拖拽的DOM Element
   * @param {{x, y}} pointPos 鼠标位置（不存在则取dragEl正中坐标）
   * @param {boolean} updateDragOver 是否更新dragOver状态
   * @returns {Element} 可放置的容器DOM Element
   */
  getDroppableTarget (dragEl, pointPos, updateDragOver) {
    let droppableElements = []
    for (const selector of this.selectorDropableTarget) {
      droppableElements = droppableElements.concat(Array.from(document.querySelectorAll(selector)))
    }
    const filtered = Array.from(droppableElements).filter(el => {
      const { x, y, width, height } = el.getBoundingClientRect()
      // Exclude: droppables in the dragging element
      if (dragEl) { // 现有元素拖拽
        if (dragEl.contains(el)) { // 拖拽节点包含了可放置容器
          return false
        }

        // 容器判断 isDroppable为false
        if (el.invoke('isDroppable', [dragEl]) === false) {
          return false
        }
        // Exclude: slot el with element dropped
        // if (el.tagName === 'SLOT' && el.getAttribute('tpl') && el.getAttribute('tpl') !== dragEl.getAttribute('ridge-id')) {
        //   return false
        // }
        return pointPos.x > x && pointPos.x < (x + width) && pointPos.y > y && pointPos.y < (y + height) && el !== dragEl && el.closest('[ridge-id]') !== dragEl
      } else { // 新元素拖拽放置
        return pointPos.x > x && pointPos.x < (x + width) && pointPos.y > y && pointPos.y < (y + height)
      }
    })

    let target = null
    if (filtered.length === 1) {
      target = filtered[0]
    } else if (filtered.length > 1) {
      // find inner'est element
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

    // 拖拽更新位置
    if (updateDragOver) {
      try {
        target && target.invoke('onDragOver', dragEl ? [dragEl.elementWrapper || {}] : [pointPos])
      } catch (e) {
        console.error('Container dragOver Error', target)
      }

      droppableElements.forEach(el => {
        if (el !== target) {
          el.invoke('onDragOut')
        }
      })
    }
    return target
  }
}
