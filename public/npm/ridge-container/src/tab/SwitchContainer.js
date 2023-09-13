import Container from '../Container'
import './style.css'

/**
 * 内容切换显示容器
 */
export default class SwitchContainer extends Container {
  constructor (props) {
    super(props)
    this.isEdit = props.__mode === 'edit'
    this.pageManager = props.__pageManager
    // 子state节点
    this.childWrapperIds = []
  }

  /**
   * 容器挂载
   * @param {*} el
   */
  async mount (el) {
    const { states, children, effect } = this.props
    const { list } = states
    this.el = el

    const containerEl = document.createElement('div')
    containerEl.classList.add('switch-container')
    el.appendChild(containerEl)

    this.contentWrapperEl = document.createElement('div')
    this.contentWrapperEl.classList.add('content-wrapper')
    this.updateContentContainerStyle()
    containerEl.appendChild(this.contentWrapperEl)

    // 补充所有状态
    this.ensureStateContainers(this.contentWrapperEl, list, effect)

    // 从children写回id数组
    if (children && children.length) {
      this.childWrapperIds = children.map(wrapper => {
        if (wrapper) {
          return wrapper.id
        } else {
          return null
        }
      })
    }

    if (this.isEdit && children) {
      for (let i = 0; i < children.length; i++) {
        if (children[i] && children[i].loadAndMount) {
          const el = document.createElement('div')
          this.contentWrapperEl.children[i].appendChild(el)
          await children[i].loadAndMount(el)
        }
      }
    }
    await this.toggleState()
  }

  /**
   * 按照切换动画方式,更新内容层整体样式
   */
  updateContentContainerStyle () {
    const { effect, states } = this.props
    const { list } = states
    if (effect === 'none' || effect === 'fade') {
      this.contentWrapperEl.style.width = '100%'
      this.contentWrapperEl.style.height = '100%'
    } else if (effect === 'v-slide') { // 横向平移: 需要将内容放置到不同位置
      this.contentWrapperEl.style.width = list.length * 100 + '%'
      this.contentWrapperEl.style.height = '100%'
    } else if (effect === 'h-slide') {
      this.contentWrapperEl.style.width = '100%'
      this.contentWrapperEl.style.height = list.length * 100 + '%'
    }
  }

  /**
   * 更新属性
   * 编辑时, 会有状态新增\删除\重命名\当前状态变更\效果变更
   * 运行时, 只有当前状态变更
   *
   * @param {*} props
   */
  update (props) {
    if (typeof props.states === 'string') {
      this.toggleState(props.states)
      return
    }
    if (props.effect !== this.props.effect) {
      // 显示效果切换
      this.updateContentContainerStyle()
      // this.ensureStateContainers(this.contentWrapperEl, this.props.states.list, this.props.effect)
      this.toggleState()
      this.props.effect = props.effect
    } else if (this.props.states.current !== props.states.current) {
      // 切换状态
      this.toggleState(props.states.current)
      this.props.states.current = props.states.current
    } else if (this.props.states.list.length < props.states.list.length) {
      // 新增state
      // 补充所有状态
      this.ensureStateContainers(this.contentWrapperEl, props.states.list, this.props.effect)
      this.toggleState()
      this.props.states.list = JSON.parse(JSON.stringify(props.states.list))
    } else if (this.props.states.list.length > props.states.list.length) {
      // 删除state
      let removeIndex = -1
      for (let i = 0; i < this.props.states.list.length; i++) {
        if (this.props.states.list[i] !== props.states.list[i]) {
          removeIndex = i
          // this.removeState(i)
          break
        }
      }
      if (this.props.states.list.indexOf(this.props.states.current) === removeIndex) {
        // 删除的正好是选中的
        if (removeIndex === this.props.states.list.length - 1) { // 删除最后一个
          this.props.states.current = this.props.states.list[removeIndex - 1]
        } else {
          this.props.states.current = props.states.list[removeIndex]
        }
      }
      this.removeState(removeIndex)
      this.toggleState()
      this.props.states.list = JSON.parse(JSON.stringify(props.states.list))
    } else {
      for (let i = 0; i < props.states.list.length; i++) {
        if (this.props.states.list[i] !== props.states.list[i]) {
          this.renameState(i, props.states.list[i])
        }
      }
      // 重命名state
      this.props.states.list = JSON.parse(JSON.stringify(props.states.list))
    }
  }

  /**
   * 初始化状态列表
   * @param {*} contentWrapperEl
   * @param {*} stateList
   * @param {*} effect
   */
  ensureStateContainers (contentWrapperEl, stateList, effect) {
    for (let index = 0; index < stateList.length; index++) {
      let stateEl = contentWrapperEl.querySelector(`div[state="${stateList[index]}"]`)
      if (stateEl == null) {
        stateEl = document.createElement('div')
        stateEl.classList.add('state-content')
        stateEl.setAttribute('state', stateList[index])
        stateEl.style.position = 'absolute'

        if (effect === 'none' || effect === 'fade') {
          stateEl.style.left = 0
          stateEl.style.top = 0
        } else if (effect === 'v-slide') {
          stateEl.style.left = (index * 100) + '%'
          stateEl.style.top = 0
        } else if (effect === 'h-slide') {
          stateEl.style.left = 0
          stateEl.style.top = (index * 100) + '%'
        }

        stateEl.style.width = '100%'
        stateEl.style.height = '100%'
        contentWrapperEl.appendChild(stateEl)
      }
    }
  }

  /**
   * 删除状态
   * @param {*} index
   */
  removeState (index) {
    const stateEl = this.contentWrapperEl.children[index]
    if (stateEl) {
      this.contentWrapperEl.removeChild(stateEl)
    }

    if (this.childWrapperIds[index]) {
      this.pageManager.removeElement(this.childWrapperIds[index])
    }
    this.childWrapperIds.splice(index, 1)
  }

  /**
   * 状态修改名称
   */
  renameState (index, newName) {
    const { states } = this.props
    const { current, list } = states

    // 修改对应的div[state]
    const stateEl = this.contentWrapperEl.children[index]
    stateEl.setAttribute('state', newName)

    // 无论是否有子节点，索引关系是不变的
  }

  /**
   * 切换到显示某个内容元素, 当未加载时,执行加载和初始化动作
   */
  async toggleState (stateName) {
    const { contentWrapperEl } = this
    const { states, children, effect } = this.props
    const { current, list } = states
    const currentStateName = stateName || current

    const currentIndex = list.indexOf(currentStateName)
    // 当前状态存在
    if (currentIndex > -1) {
      // 切换显示层
      this.currentStateEl = contentWrapperEl.querySelector(`div[state="${currentStateName}"]`)

      if (effect === 'none' || effect === 'fade') {
        Array.from(contentWrapperEl.querySelectorAll('div[state]')).forEach(el => {
          if (el.getAttribute('state') === currentStateName) {
            if (effect === 'none') {
              el.style.display = 'initial'
            } else if (effect === 'fade') {
              el.classList.add('fade-in')
              el.classList.remove('fade-out')
            }
          } else {
            if (effect === 'none') {
              el.style.display = 'none'
            } else if (effect === 'fade') {
              el.classList.add('fade-out')
              el.classList.remove('fade-in')
            }
          }
        })
      }
      // 未加载则执行加载动作
      if (children && children[currentIndex] && !children[currentIndex].el && children[currentIndex].loadAndMount) {
        await children[currentIndex].loadAndMount(this.currentStateEl)
      }
    }
  }

  // 拖动进入
  onDragOver (wrapper) {
    if (this.currentStateEl && !this.currentStateEl.querySelector('.ridge-element')) {
      const shadowNode = this.currentStateEl.querySelector(':scope > .drop-shadow')

      if (!shadowNode) {
        const shadowNode = document.createElement('div')
        shadowNode.classList.add('drop-shadow')
        shadowNode.style.width = '100%'
        shadowNode.style.height = '100%'

        shadowNode.style.borderRadius = 'var(--semi-border-radius-small)'
        shadowNode.style.border = '2px dashed var(--semi-color-primary)'
        shadowNode.style.backgroundColor = 'var(--semi-color-primary-light-default)'
        this.currentStateEl.appendChild(shadowNode)
      }
    }
  }

  // 拖动离开
  onDragOut () {
    this.checkRemoveShadowNode()
  }

  checkRemoveShadowNode () {
    if (this.currentStateEl) {
      if (this.currentStateEl.querySelector(':scope > .drop-shadow')) {
        this.currentStateEl.removeChild(this.currentStateEl.querySelector(':scope > .drop-shadow'))
      }
    }
  }

  appendChild (wrapper) {
    const { states, children, effect } = this.props
    const { current, list } = states

    if (this.currentStateEl) {
      this.currentStateEl.appendChild(wrapper.el)
      this.updateChildStyle(wrapper)

      const index = states.list.indexOf(current)
      this.childWrapperIds[index] = wrapper.id
      this.checkRemoveShadowNode()
    }

    return {
      children: this.childWrapperIds
    }
  }

  /**
   * 接触节点父子关系
   * @param {*} childWrapper 子节点
   * @param {*} isDelete 是否直接删除
   * @returns
   */
  removeChild (childWrapper, isDelete) {
    const { states } = this.props
    const { current, list } = states

    // 原地阴影
    if (childWrapper.el.parentElement === this.currentStateEl) {
      // 不删除仅仅解除父子关系，这时要检测放置阴影
      if (!isDelete) {
        this.onDragOver()
      }
      this.currentStateEl.removeChild(childWrapper.el)
    } else {
      console.warn('not children ')
    }

    this.childWrapperIds[list.indexOf(current)] = null

    return {
      children: this.childWrapperIds
    }
  }

  getShadowStyle (configStyle) {
    return {
      width: '100%',
      height: '100%'
    }
  }

  updateChildStyle (childWrapper) {
    childWrapper.el.style.position = 'absolute'
    childWrapper.el.style.left = 0
    childWrapper.el.style.top = 0
    childWrapper.el.style.transform = ''
    childWrapper.el.style.width = '100%'
    childWrapper.el.style.height = '100%'
  }
}
