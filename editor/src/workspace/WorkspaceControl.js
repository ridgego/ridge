import Selecto from 'selecto'
import { createMoveable } from './moveable'
import Mousetrap from 'mousetrap'

import debug from 'debug'
import { fitRectIntoBounds } from '../utils/rectUtils'
import context from '../service/RidgeEditorContext.js'

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
    this.zoom = 1
    this.selectorDropableTarget = ['.ridge-container', '.ridge-droppable']

    this.initKeyBind()
    this.initComponentDrop()

    this.selected = []
    this.viewPortEl.style.transformOrigin = 'center center'
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
      this.selecto = null
      this.moveable.destroy()
      this.moveable = null
      if (this.workspaceMovable) {
        this.workspaceMovable.destroy()
        this.workspaceMovable = null
      }
      this.enabled = false
      this.viewPortEl.style.transform = ''
    }
  }

  updateMovable () {
    this.moveable.updateTarget()
  }

  fitToCenter (padding = 40) {
    this.viewPortEl.style.transform = ''
    const wsbc = this.workspaceEl.getBoundingClientRect()
    const vpbc = this.viewPortEl.getBoundingClientRect()
    this.zoom = 1

    const fitted = fitRectIntoBounds({
      width: vpbc.width,
      height: vpbc.height
    }, {
      width: wsbc.width - padding * 2,
      height: wsbc.height - padding * 2
    })

    if (fitted.width !== vpbc.width) {
      this.zoom = fitted.width / vpbc.width
    }

    this.viewPortX = (wsbc.width - fitted.width) / 2
    this.viewPortY = (wsbc.height - fitted.height) / 2

    this.viewPortEl.style.transform = `translate(${this.viewPortX}px, ${this.viewPortY}px) scale(${this.zoom})`

    return this.zoom
  }

  setZoom (zoom) {
    this.zoom = zoom

    if (this.moveable) {
      this.moveable.target = []
      this.moveable.updateTarget()
    }

    this.viewPortEl.style.transform = `translate(${this.viewPortX}px, ${this.viewPortY}px) scale(${this.zoom})`
  }

  setWorkSpaceMovable () {
    this.workspaceMovable = createMoveable({
      target: this.workspaceEl,
      className: 'workspace-movable'
    })

    this.workspaceMovable.on('dragStart', ev => {
      if (ev.inputEvent.ctrlKey) {
        this.workspaceMovable.dragWorkSpace = true
        this.moveable.target = []
      } else {
        this.workspaceMovable.dragWorkSpace = false
      }
    })

    this.workspaceMovable.on('drag', ev => {
      if (ev.inputEvent.ctrlKey && this.workspaceMovable.dragWorkSpace) {
        this.moveable.target = null
        this.viewPortX += ev.delta[0]
        this.viewPortY += ev.delta[1]

        this.viewPortEl.style.transform = `translate(${this.viewPortX}px, ${this.viewPortY}px) scale(${this.zoom})`
      }
    })
  }

  isElementMovable (el) {
    if (this.moveable.target == null) {
      return false
    }
    if (this.moveable.target.length === 1 && this.moveable.target[0] == el) {
      return true
    }
    return false
  }

  /**
   * 初始化页面元素拖拽动作
   */
  initMoveable () {
    const sm = this

    this.moveable = createMoveable({
      target: [],
      snappable: true
    })

    this.moveable.on('dragStart', ev => {
      const target = ev.target
      if (target.classList.contains('is-locked') || target.classList.contains('is-full')) {
        return false
      }
    })

    this.moveable.on('drag', ev => {
      const target = ev.target
      if (!sm.isTargetMovable(target)) {
        return
      }
      if (this.workspaceMovable.dragWorkSpace) {
        return
      }
      const config = ev.target.ridgeNode.config
      sm.onElementDragStart(ev.target, ev.inputEvent)

      // if (config.parent) {
      //   // 拖拽时就从父节点移除
      // } else {
      //   sm.checkDropTargetStatus(ev)
      // }

      ev.target.style.transform = `translate(${config.style.x + ev.dist[0]}px,${config.style.y + ev.dist[1]}px)`
    })

    this.moveable.on('dragEnd', ev => {
      const target = ev.target
      if (!sm.isTargetMovable(target)) {
        return
      }
      if (ev.isDrag) {
        sm.placeElementAt(ev.target, ev.clientX, ev.clientY)
      } else {
        sm.selectElements([ev.target])
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
      if (!sm.isTargetResizable(target)) {
        return
      }
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
      target.ridgeNode.updateStyleConfig(style)
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
        if (!sm.isTargetMovable(target)) {
          return
        }
        if (!target.ridgeNode.config.parent) {
          target.style.transform = transform
        }
      })
    })
    this.moveable.on('dragGroupEnd', (payload) => {
      payload.events.forEach(({ target }) => {
        // TODO 目前仅支持根节点？？
        if (!target.ridgeNode.config.parent) {
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
        if (!sm.isTargetResizable(target)) {
          return
        }
        target.style.transform = transform
        delta[0] && (target.style.width = `${width}px`)
        delta[1] && (target.style.height = `${height}px`)
      })
    })

    this.moveable.on('resizeGroupEnd', payload => {
      payload.events.forEach(({ target }) => {
        if (!target.ridgeNode.config.parent) {
          const bcr = target.getBoundingClientRect()
          context.updateComponentConfig(target.ridgeNode, {
            style: {
              x: bcr.left + bcr.width / 2,
              y: bcr.top + bcr.height / 2
            }
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
    this.selecto.on('selectEnd', this.onSelectoDragEnd.bind(this))
  }

  onSelectoDragStart (e) {
    const inputEvent = e.inputEvent
    const target = inputEvent.target
    if (target.classList && (target.classList.contains('moveable-area') || target.classList.contains('moveable-control'))) {
      e.stop()
      return
    }
    if (inputEvent.ctrlKey) {
      e.stop()
      return
    }
    if (target.closest('.menu-bar')) {
      e.stop()
      return
    }

    // 拖拽起始位置位于元素内
    const closestRidgeNode = target.closest('.ridge-element')
    if (this.isElementMovable(closestRidgeNode)) {
      e.stop()
      return
    }

    if (closestRidgeNode) {
      // 穿透选择
      if (this.moveable.target && this.moveable.target.length === 1 && this.moveable.target[0].contains(closestRidgeNode) && this.disableClickThrough) {
        // 当前已经选择target并且包含了点击的节点，并且设置了禁用穿透选择，则不选择到子节点
        // 不改变对象
      } else {
        this.moveable.target = closestRidgeNode
      }

      this.guidelines = [document.querySelector('.viewport-container'), ...Array.from(document.querySelectorAll('.ridge-element')).filter(el => {
        return el !== this.moveable.target && el.closest('.ridge-element') !== this.moveable.target
      })]
      this.moveable.elementGuidelines = this.guidelines
      this.moveable.elementSnapDirections = { top: true, left: true, bottom: true, right: true, center: true, middle: true }
      this.moveable.snapDirections = { top: true, left: true, bottom: true, right: true, center: true, middle: true }

      // this.onElementDragStart(closestRidgeNode, inputEvent)
      this.moveable.dragStart(inputEvent)

      e.inputEvent && e.inputEvent.stopPropagation()
      e.inputEvent && e.inputEvent.preventDefault()
      e.stop()
    } else if (inputEvent.ctrlKey) {
      // movableManager.current.getMoveable().dragStart(inputEvent)
      e.stop()
    }
  }

  onSelectoDragEnd ({ isDragStart, selected, inputEvent, rect }) {
    if (isDragStart) {
      inputEvent.preventDefault()
    }
    this.moveable.elementGuidelines = [document.querySelector('.viewport-container'), ...Array.from(document.querySelectorAll('.ridge-element')).filter(el => selected.indexOf(el) === -1)]
    this.guidelines = [document.querySelector('.viewport-container'), ...Array.from(document.querySelectorAll('.ridge-element[snappable="true"]')).filter(el => selected.indexOf(el) === -1)]
    this.selectElements(selected)
  }

  initComponentDrop () {
    this.workspaceEl.addEventListener('dragover', this.onWorkspaceDragOver.bind(this))
    this.workspaceEl.addEventListener('drop', this.onWorkspaceDrop.bind(this))
  }

  onWorkspaceDragOver (ev) {
    if (!this.enabled) {
      return
    }
    if (context.draggingComponent) {
      if (this.selected.length) {
        this.selectElements([])
      }
      ev.dataTransfer.dropEffect = 'move'

      this.checkDropTargetStatus({
        width: context.draggingComponent.width,
        height: context.draggingComponent.height,
        clientX: ev.clientX,
        clientY: ev.clientY
      })
    }
    ev.preventDefault()
  }

  /**
   * 放置组件事件
   * @param {*} ev
   */
  onWorkspaceDrop (ev) {
    if (!this.enabled) {
      return
    }
    ev.preventDefault()

    if (context.draggingComponent) {
      const ridgeNode = context.createElement(context.draggingComponent)
      this.placeElementAt(ridgeNode.el, ev.pageX, ev.pageY)
      context.draggingComponent = null
    }
  }

  /**
   * 检查并显示指定位置的放置情况，主要是容器放置处理
   */
  checkDropTargetStatus ({ target, clientX, clientY, width, height }) {
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
    trace('placeElementAt:', el, { x, y })
    this.putElementToRoot(el, x, y)
    // 获取可放置的容器
    const targetEl = this.getDroppableTarget(el, {
      x,
      y
    }, false)
    const targetParent = targetEl ? targetEl.ridgeNode : null
    if (targetParent) {
      // 放入一个容器
      trace('Into container', targetParent)

      const bcr = el.getBoundingClientRect()
      const pbcr = targetEl.getBoundingClientRect()

      context.editorComposite.removeChild(el.ridgeNode)
      targetParent.appendChild(el.ridgeNode, {
        x: Math.floor((bcr.x - pbcr.x) / this.zoom),
        y: Math.floor((bcr.y - pbcr.y) / this.zoom)
      })
    }
    context.onElementMoveEnd(el)
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
    const rbcr = this.viewPortEl.getBoundingClientRect()
    const bcr = el.getBoundingClientRect()
    if (x == null || y == null || (x > bcr.x && x < (bcr.x + bcr.width) && y > bcr.y && y < (bcr.y + bcr.height))) {
      // 计算位置
      el.ridgeNode.updateStyleConfig({
        x: Math.floor((bcr.x - rbcr.x) / this.zoom),
        y: Math.floor((bcr.y - rbcr.y) / this.zoom)
      })
    } else {
      // 计算位置
      el.ridgeNode.updateStyleConfig({
        x: Math.floor((x - rbcr.x - bcr.width / 2) / this.zoom),
        y: Math.floor((y - rbcr.y - bcr.height / 2) / this.zoom)
      })
    }
    this.moveable.updateTarget()
  }

  /**
   * 处理开始拖拽事件, 处理当前节点从父容器脱离放置到根上
   * @param {*} el
   * @param {*} event
   */
  onElementDragStart (el, event) {
    if (el.ridgeNode && el.ridgeNode.parent && el.ridgeNode.parent !== context.editorComposite) {
      // 当节点放置容器内时，首先脱离节点并将其放置到根的同样位置
      const rectConfig = this.getElementRectConfig(el)

      el.ridgeNode.parent.removeChild(el.ridgeNode)
      context.editorComposite.appendChild(el.ridgeNode)

      context.services.outlinePanel.updateOutline()

      el.ridgeNode.updateStyleConfig(rectConfig)
    }

    this.checkDropTargetStatus({
      target: el,
      clientX: event.clientX,
      clientY: event.clientY
    })
  }

  getElementRectConfig (el) {
    const beforeRect = el.getBoundingClientRect()
    const rbcr = this.viewPortEl.getBoundingClientRect()

    return {
      position: 'absolute',
      x: (beforeRect.x - rbcr.x) / this.zoom,
      y: (beforeRect.y - rbcr.y) / this.zoom,
      width: beforeRect.width / this.zoom,
      height: beforeRect.height / this.zoom
    }
  }

  /**
   * 设置选择元素，包含选择“空”的情况
   * @param {*} elements
   * @param {*} disableClickThrough 选择后是否可以直接选择当前节点的下级节点, 从面板发起的选择一般不允许向下选择
   */
  selectElements (elements, disableClickThrough) {
    this.disableClickThrough = false

    // 去除之前选中状态
    document.querySelectorAll('.ridge-element.selected').forEach(el => {
      el.classList.remove('selected')
    })

    if (elements && elements.length > 0) {
      this.selected = elements.filter(el => !el.classList.contains('ridge-is-hidden'))
      if (this.selected.length > 1) {
        // 多个的时候 只选择根元素
        this.selected = elements.filter(el => el.parentElement.classList.contains('ridge-composite'))
      }
      if (this.selected.length === 1) {
        context.onElementSelected(this.selected[0])
      }
      this.moveable.target = this.selected
    } else {
      context.onPageSelected()
      this.selected = []
      this.moveable.target = null
    }
    this.setSelectedStatus()
    this.moveable.updateTarget()
  }

  // 更新选择的状态
  setSelectedStatus () {
    if (this.selected.length === 1) {
      const el = this.selected[0]
      if (el.classList.contains('ridge-is-locked') || el.classList.contains('ridge-is-full')) {
        this.moveable.moveable = false
        this.moveable.resizable = false
      } else {
        this.moveable.moveable = true
        this.moveable.resizable = true
      }
    } else if (this.selected.length > 1) {
      this.moveable.resizable = false
    }
    this.moveable.elementGuidelines = [document.querySelector('.viewport-container'),
      ...Array.from(document.querySelectorAll('.viewport-container > .ridge-element:not(.ridge-is-hidden)')).filter(el => this.selected.indexOf(el) === -1)]
  }

  isTargetMovable (el) {
    if (el.classList.contains('ridge-is-locked') || el.classList.contains('ridge-is-full')) {
      return false
    } else {
      return true
    }
  }

  isTargetResizable (el) {
    if (el.classList.contains('ridge-is-locked') || el.classList.contains('ridge-is-full')) {
      return false
    } else {
      return true
    }
  }

  unSelectElements (elements) {
    this.selected = this.selected.filter(el => elements.indexOf(el) === -1)
    this.moveable.target = this.selected
    this.moveable.updateTarget()
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
      if (!el.ridgeNode) return false
      const { x, y, width, height } = el.getBoundingClientRect()
      // Exclude: droppables in the dragging element
      // 容器判断 isDroppable为false
      if (el.invoke && el.invoke('isDroppable', [dragEl]) === false) {
        return false
      }

      if (dragEl) { // 现有元素拖拽
        if (dragEl.contains(el)) { // 拖拽节点包含了可放置容器
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
        target && target.ridgeNode && target.ridgeNode.invoke('onDragOver', dragEl ? [dragEl.ridgeNode || {}] : [pointPos])
      } catch (e) {
        console.error('Container dragOver Error', target)
      }

      droppableElements.forEach(el => {
        if (el !== target) {
          el.ridgeNode && el.ridgeNode.invoke('onDragOut')
        }
      })
    }
    return target
  }

  capture () {
    if (this.moveable.target) {
      window.html2canvas(this.moveable.target[0].firstChild, {
        backgroundColor: null
      }).then(canvas => {
        const url = canvas.toDataURL('image/png')

        this.downloadImg('capture.png', url)
      })
    }
  }

  downloadImg (name, canvasImg) {
    const a = document.createElement('a') // 生成一个a元素
    const event = new window.MouseEvent('click') // 创建一个单击事件

    a.download = name || this.props.photoName || 'photo' // 设置图片名称
    a.href = canvasImg
    a.dispatchEvent(event) // 触发a的点击事件
  }

  initKeyBind () {
    Mousetrap.bind('del', () => {
      if (!this.enabled) {
        return
      }
      if (this.selected) {
        for (const el of this.selected) {
          context.onElementRemoved(el)
        }
        this.selectElements([])
      }
    })

    Mousetrap.bind('right', () => {
      if (this.selected) {
        for (const el of this.selected) {
          const ridgeNode = context.getNode(el)
          ridgeNode.updateStyleConfig({
            x: ridgeNode.config.style.x + 1
          })
        }
        this.moveable.updateTarget()
      }
    })

    Mousetrap.bind('left', () => {
      if (this.selected) {
        for (const el of this.selected) {
          const ridgeNode = context.getNode(el)
          ridgeNode.updateStyleConfig({
            x: ridgeNode.config.style.x - 1
          })
        }
        this.moveable.updateTarget()
      }
    })
    Mousetrap.bind('up', () => {
      if (this.selected) {
        for (const el of this.selected) {
          const ridgeNode = context.getNode(el)
          ridgeNode.updateStyleConfig({
            x: ridgeNode.config.style.y - 1
          })
        }
        this.moveable.updateTarget()
      }
    })
    Mousetrap.bind('down', () => {
      if (this.selected) {
        for (const el of this.selected) {
          const ridgeNode = context.getNode(el)
          ridgeNode.updateStyleConfig({
            x: ridgeNode.config.style.y + 1
          })
        }
        this.moveable.updateTarget()
      }
    })

    Mousetrap.bind('ctrl+c', () => {
      if (this.selected) {
        this.copied = this.selected

        this.copied.forEach(el => {
          el.dataset.copy_x = el.ridgeNode.config.style.x
          el.dataset.copy_y = el.ridgeNode.config.style.y
        })
      } else {
        this.copied = []
      }
    })

    Mousetrap.bind('ctrl+v', () => {
      if (this.copied && this.copied.length) {
        for (const el of this.copied) {
          const newView = el.ridgeNode.clone(context.editorComposite)
          const div = document.createElement('div')
          newView.loadAndMount(div).then(() => {
            let parentWrapper = null
            if (this.selected && this.selected.length === 1) {
              if (this.selected[0] === el && this.selected[0].elementWrapper.parentWrapper) {
                parentWrapper = this.selected[0].elementWrapper.parentWrapper
              } else {
                parentWrapper = this.selected[0].elementWrapper
              }
            }

            if (parentWrapper) {
              trace('复制到父容器内', parentWrapper)
              const result = this.pageManager.attachToParent(parentWrapper, newView)
              if (result === false) {
                newView.updateStyleConfig({
                  x: newView.config.style.x + 20,
                  y: newView.config.style.y + 20
                })
                this.putElementToRoot(newView)
              }
            } else {
              newView.updateStyleConfig({
                x: newView.config.style.x + 20,
                y: newView.config.style.y + 20
              })
              this.putElementToRoot(updateStyleConfig.el)
            }
          })
        }
      }
    })

    this.workspaceEl.onwheel = (event) => {
      event.preventDefault()
      let targetZoom = this.zoom + (event.deltaY > 0 ? -1 : 1) * 0.01
      targetZoom = Math.min(Math.max(0.1, targetZoom), 2)

      this.zoomBack && this.zoomBack(targetZoom)
      this.setZoom(targetZoom)
    }
  }
}
