import ElementWrapper from './ElementWrapper'
import Debug from 'debug'
import { nanoid } from '../utils/string'
// import PageStore from './PageStore'
import ValtioStore from './ValtioStore'
const debug = Debug('ridge:manager')

class PageElementManager {
  constructor ({ pageConfig, ridge, mode, app }) {
    this.id = pageConfig.id
    this.pageConfig = pageConfig
    this.ridge = ridge
    this.mode = mode
    this.app = app
    this.classNames = []
    this.pageStore = new ValtioStore(this)
    this.initialize()
  }

  setMode (mode) {
    this.mode = mode
  }

  /**
   * 根据页面配置读取页面控制对象结构
   * @param {Element} el DOM 根元素
   */
  initialize () {
    debug('Ridge Page initialize:', this.pageConfig)
    this.id = this.pageConfig.id
    this.pageElements = {}
    for (let i = 0; i < this.pageConfig.elements.length; i++) {
      const elementWrapper = new ElementWrapper({
        pageManager: this,
        mode: this.mode,
        config: this.pageConfig.elements[i],
        i
      })
      this.pageElements[elementWrapper.id] = elementWrapper
    }
  }

  getPageProperties () {
    return this.pageConfig.properties
  }

  getStoreTrees () {
    return this.pageStore.getStoreTrees()
  }

  /**
   * 更新页面变量取值
   * @param {*} values 新的页面变量对
   */
  async updatePageConfig (change) {
    Object.assign(this.pageConfig, change)
    this.updateRootElStyle()
    await this.updateImportedStyle()
    await this.updateImportedJS()
    await this.updateStore()
  }

  getElement (id) {
    return this.pageElements[id]
  }

  getPageElements () {
    return this.pageElements
  }

  /**
   * 挂载整个页面到body或者根元素
   * @param {Element} el 根元素
   */
  async mount (el) {
    this.el = el
    this.rootClassList = Array.from(this.el.classList)
    this.updateRootElStyle()
    await this.updateImportedStyle()
    await this.updateImportedJS()
    this.updateStore()

    const promises = []
    for (const wrapper of Object.values(this.pageElements).filter(e => e.isRoot())) {
      const div = document.createElement('div')
      el.appendChild(div)
      promises.push(await wrapper.loadAndMount(div))
    }
    this.onPageMounted && this.onPageMounted()
    await Promise.allSettled(promises)
    this.onPageLoaded && this.onPageLoaded()
  }

  // 配置根节点容器的样式
  updateRootElStyle () {
    this.el.style.background = ''
    if (this.pageConfig.style) {
      const { background, classNames, width, height } = this.pageConfig.style
      background && Object.assign(this.el.style, {
        background
      })
      classNames && classNames.forEach(cn => {
        this.el.classList.add(cn)
      })
      if (this.mode === 'edit') {
        this.el.style.width = width + 'px'
        this.el.style.height = height + 'px'
      }
    }
    this.el.style.position = 'relative'
  }

  /**
   * 更新页面引入的样式表
   */
  async updateImportedStyle () {
    const mode = this.mode
    const cssFiles = this.pageConfig.cssFiles
    this.classNames = []
    for (const filePath of cssFiles) {
      if (mode !== 'hosted') {
        const file = this.ridge.appService.filterFiles(f => f.path === filePath)[0]
        if (file) {
          const fileContent = await this.ridge.appService.getFileContent(file)
          if (fileContent) {
            let styleEl = document.querySelector('style[ridge-path="' + filePath + '"]')
            if (!styleEl) {
              styleEl = document.createElement('style')
              styleEl.setAttribute('ridge-path', filePath)
              document.head.appendChild(styleEl)
            }

            styleEl.textContent = '\r\n' + fileContent
            // 计算使用的样式
            const matches = fileContent.match(/\/\*.+\*\/[^{]+{/g)
            for (const m of matches) {
              const label = m.match(/\/\*.+\*\//)[0].replace(/[/*]/g, '')
              const className = m.match(/\n[^{]+/g)[0].trim().substring(1)

              this.classNames.push({
                className,
                label
              })
            }
          }
        }
      }
    }
  }

  /**
   * 更新页面引入的样式表
   */
  async updateStore () {
    await this.pageStore.updateStore(this.pageConfig.jsFiles || [], this.mode)
  }

  async updateImportedJS () {

  }

  /**
   * 整页按照变量和动态数据完全更新
   */
  forceUpdate () {
    for (const element of Object.values(this.pageElements)) {
      element.forceUpdate()
    }
  }

  async unmount () {
    for (const wrapper of Object.values(this.pageElements).filter(e => e.isRoot())) {
      wrapper.unmount()
    }
    if (this.mode === 'edit') {
      this.el.style.width = 0
      this.el.style.height = 0
    }
  }

  /**
   * 预加载及初始化页面内的元素
   */
  async preload () {
    const awaitings = []
    for (const wrapper of this.pageElements) {
      awaitings.push(await wrapper.preload())
    }
    await Promise.allSettled(awaitings)
  }

  /**
 * 从组件定义片段创建一个页面元素实例
 * @param {Object} fraction 来自
 * @returns
 */
  createElement (fraction) {
    // 生成组件定义
    const elementConfig = {
      title: fraction.title,
      id: nanoid(5),
      isNew: true,
      path: fraction.componentPath,
      style: {
        position: 'absolute',
        visible: true,
        width: fraction.width ?? 100,
        height: fraction.height ?? 100
      },
      styleEx: {},
      props: {},
      propEx: {},
      events: {}
    }

    const wrapper = new ElementWrapper({
      isCreate: true,
      mode: this.mode,
      config: elementConfig,
      pageManager: this
    })
    this.pageElements[wrapper.id] = wrapper
    return wrapper
  }

  /**
   * 复制一个节点（包括节点下的子节点）
   * @param {ElementWrapper} sourceWrapper
   * @returns
   */
  cloneElementWithChild (sourceWrapper) {
    const newWrapper = sourceWrapper.clone()
    console.log('mounted', newWrapper, newWrapper.config.style)

    const div = document.createElement('div')
    newWrapper.mount(div)

    this.pushElement(newWrapper)
    return newWrapper
  }

  pushElement (wrapper) {
    this.pageElements[wrapper.id] = wrapper
  }

  /**
   * 移除一个元素（递归进行）
   * @param {*} id
   */
  removeElement (id) {
    const element = this.pageElements[id]

    if (element) {
      if (element.parentWrapper) {
        this.detachChildElement(element, true)
      }

      element.forEachChildren((childWrapper, type, propKey) => {
        this.removeElement(childWrapper.id)
      })
      element.unmount()
      delete this.pageElements[id]
    }
  }

  /**
     * 当子节点从父节点移出后，（包括SLOT）重新更新父节点配置
     * @param {*} sourceParentElement 父节点
     * @param {*} childElementId 子节点
     */
  detachChildElement (childElement, isDelete) {
    const sourceParentElement = childElement.parentWrapper

    const result = sourceParentElement.invoke('removeChild', [childElement, isDelete])
    Object.assign(sourceParentElement.config.props, result)

    delete childElement.config.parent
    delete childElement.parentWrapper
  }

  /**
   * 节点设置新的父节点
   * @param {*} targetParentElement
   * @param {*} sourceElement
   * @param {*} targetEl
   */
  attachToParent (targetParentElement, sourceElement, pos = {}) {
    if (!targetParentElement.hasMethod('appendChild')) {
      return false
    }
    // 这里容器会提供 appendChild 方法，并提供放置位置
    const result = targetParentElement.invoke('appendChild', [sourceElement, pos.x, pos.y])

    if (result === false) {
      return false
    } else {
      Object.assign(targetParentElement.config.props, result)

      sourceElement.config.parent = targetParentElement.id
      sourceElement.parentWrapper = targetParentElement
    }
  }

  putElementToRoot (element) {
    const div = document.createElement('div')
    this.el.appendChild(div)
    element.mount(div)
    return element
  }

  // 放置wrapper到target之后，
  setPositionAfter (wrapper, target) {
    const siblings = Object.values(this.pageElements).filter(one => one.config.parent == target.config.parent).sort((a, b) => {
      return a.i - b.i
    })

    let begin = false
    for (let i = 0; i < siblings.length; i++) {
      if (siblings[i] === wrapper) {
        begin = true
        continue
      }
      if (begin) {
        siblings[i].setIndex(i - 1)
      }
      if (siblings[i] === target) {
        wrapper.setIndex(i)
        break
      }
    }
  }

  // 放置wrapper到target之前（之前wrapper在target之后）
  setPositionBefore (wrapper, target) {
    const siblings = Object.values(this.pageElements).filter(one => one.config.parent == target.config.parent).sort((a, b) => {
      return a.i - b.i
    })

    let begin = false
    for (let i = 0; i < siblings.length; i++) {
      if (begin) {
        siblings[i].setIndex(i + 1)
      }
      if (siblings[i] === target) {
        begin = true
        wrapper.setIndex(i)
        continue
      }
      if (siblings[i] === wrapper) {
        break
      }
    }
  }

  /**
     * 获取页面的定义信息
     * @returns JSON
     */
  getPageJSON () {
    this.pageConfig.elements = []
    for (const element of Object.values(this.pageElements).sort((a, b) => a.i - b.i)) {
      this.pageConfig.elements.push(element.toJSON())
    }
    return this.pageConfig
  }
}

export default PageElementManager