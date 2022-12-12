/* eslint-disable no-unused-vars */
import React from 'react'

const extractMargin = (marginStr) => {
  const marginsSplits = marginStr.split(' ')

  if (marginsSplits.length === 1) {
    return [parseInt(marginsSplits[0]), parseInt(marginsSplits[0]), parseInt(marginsSplits[0]), parseInt(marginsSplits[0])]
  } else if (marginsSplits.length === 2) {
    return [parseInt(marginsSplits[0]), parseInt(marginsSplits[1]), parseInt(marginsSplits[0]), parseInt(marginsSplits[1])]
  } else if (marginsSplits.length === 3) {
    return [parseInt(marginsSplits[0]), parseInt(marginsSplits[1]), parseInt(marginsSplits[2]), parseInt(marginsSplits[1])]
  } else {
    return [parseInt(marginsSplits[0]), parseInt(marginsSplits[1]), parseInt(marginsSplits[2]), parseInt(marginsSplits[3])]
  }
}
const sleep = async mill => {
  return new Promise((resolve) => {
    setTimeout(resolve, mill)
  })
}

export default class FlexContainer extends React.Component {
  constructor (props) {
    super()
    this.props = props
    this.$el = React.createRef()
  }

  componentDidMount () {
    // const { childrenViews, currentFcView, direction, alignItems, containerAutoStrech } = this.props

    // Object.assign(this.$el.current.style, this.getContainerStyle(this.props))
    // this.initFlexContent(childrenViews, currentFcView, direction, alignItems, containerAutoStrech)
    // if (this.props.children) {}
    if (this.props.flexContainerOverflow === 'overlay') {
      this.$el.current.style.overflow = 'hidden'

      this.$el.current.onmouseover = () => {
        this.$el.current.style.overflow = 'overlay'
      }
      this.$el.current.onmouseout = () => {
        this.$el.current.style.overflow = 'hidden'
      }
    }

    const that = this
    const el = this.$el.current
  }

  appendChild (el) {
    const {
      // 相关系统变量
      direction = 'row',
      alignItems = 'stretch',
      justify = 'flex-start'
    } = this.props

    // 获取当前放置的次序
    const afterNode = this.getAfterNode(el, this.$el.current.childNodes, direction)
    const style = {
      position: 'static'
    }
    if (direction === 'row' && alignItems === 'stretch') {
      style.height = ''
    }
    if (direction === 'column' && alignItems === 'stretch') {
      style.width = ''
    }
    el.elementWrapper.updateStyle(style)
    if (afterNode) {
      this.$el.current.insertBefore(el, afterNode)
    } else {
      this.$el.current.appendChild(el)
    }
  }

  getAfterNode (dropped, siblings, row) {
    const droppedRect = dropped.getBoundingClientRect()
    const pos = (row === 'row') ? (droppedRect.x + droppedRect.width / 2) : (droppedRect.y + droppedRect.height / 2)
    let last = 10000000000
    let result = null
    for (const sibling of siblings) {
      const siblingRect = sibling.getBoundingClientRect()
      const siblingpos = (row === 'row') ? (siblingRect.x + siblingRect.width / 2) : (siblingRect.y + siblingRect.height / 2)
      if (pos < siblingpos && siblingpos < last) {
        last = siblingpos
        result = sibling
      }
    }
    return result
  }

  async updateProps (newProps) {
    const {
      // 相关系统变量
      isRuntime,
      currentFcView,
      childrenViews,
      direction = 'row',
      alignItems = 'stretch',
      justify = 'flex-start',
      width,
      containerAutoStrech,
      height,
      ...props
    } = newProps

    this.props = newProps
    if (this.$el.current) {
      Object.assign(this.$el.current.style, this.getContainerStyle(newProps))
    }

    this.resizeChildren(this.$el.current.children, direction, alignItems)

    // await this.initFlexContent(childrenViews, currentFcView, direction, alignItems, containerAutoStrech)
  }

  /**
   *
   * @param {*} flexNode
   * @param {*} direction
   * @param {*} alignItems
   */
  resizeChildren (children, direction, alignItems) {
    if (direction === 'row' && alignItems === 'stretch') {
      for (const childEl of children) {
        childEl.style.height = ''
      }
    }
    if (direction === 'column' && alignItems === 'stretch') {
      for (const childEl of children) {
        childEl.style.width = ''
      }
    }
  }

  /**
     * 对容器内容进行布局
     * @param {Array<FCView>} childrenViews 子fcViews列表
     * @param {FCView} currentFcView 当前flex容器view
     * @param {string} direction 布局方向（横向/纵向）
     * @param {string} alignItems 对其方式
     * @param {Boolean} containerAutoStrech 允许子节点自动伸长
     */
  async initFlexContent (childrenViews, currentFcView, direction, alignItems, containerAutoStrech) {
    const loadMountViews = []

    if (childrenViews && childrenViews.length) {
      // 按配置的index排序
      childrenViews.sort((a, b) => (a.fcInstanceConfig.flexIndex || 0) - (b.fcInstanceConfig.flexIndex || 0))

      for (let i = 0; i < childrenViews.length; i++) {
        const view = childrenViews[i]
        let div = this.$el.current.children[i]
        let isCreatedChild = false

        // 初次创建div
        if (div == null) {
          isCreatedChild = true
          div = document.createElement('div')
          this.$el.current.appendChild(div)
        }

        div.className = 'flexed-node'

        div.view = view
        div.setAttribute('fcid', view.fcInstanceConfig.guid)

        // 设置子项div的大小
        if (view.instancePropConfig.flex != null) {
          div.style.flex = parseInt(view.instancePropConfig.flex)
        }

        // 配置横向或者纵向情况下，组件的宽度/高度已经被固定指定的情况
        if (direction === 'row') {
          // 水平排列形式
          if (!div.style.flex && !containerAutoStrech) {
            div.style.width = view.fcInstanceConfig.width + 'px'
            view.instancePropConfig.width = view.fcInstanceConfig.width
          }
          if (alignItems !== 'stretch' && !containerAutoStrech) {
            div.style.height = view.fcInstanceConfig.height + 'px'
            view.instancePropConfig.height = view.fcInstanceConfig.height
          }
        } else {
          // 列排列形式
          if (!div.style.flex && !containerAutoStrech) { // 按比例获取高度的
            div.style.height = view.fcInstanceConfig.height + 'px'
            view.instancePropConfig.height = view.fcInstanceConfig.height
          }
          if (alignItems !== 'stretch' && !containerAutoStrech) {
            div.style.width = view.fcInstanceConfig.width + 'px'
            view.instancePropConfig.width = view.fcInstanceConfig.width
          }
        }
        // 默认显示为溢出隐藏
        // div.style.overflow = 'hidden';

        // 改名，避免被组件自己定义的相关使用
        if (view.instancePropConfig.styleMargin) {
          view.instancePropConfig.styleFlexMargin = view.instancePropConfig.styleMargin
          delete view.instancePropConfig.styleMargin
        }

        // 对于子项超出的处理，横向布局的设置宽度0防止撑开，纵向的是高度0防止撑开
        if (view.instancePropConfig.flexNodeSize != null) {
          if (direction === 'row') {
            div.style.width = view.instancePropConfig.flexNodeSize + 'px'
          }
          if (direction === 'column') {
            div.style.height = view.instancePropConfig.flexNodeSize + 'px'
          }
        }

        // 设置子项Margin
        if (view.instancePropConfig.styleFlexMargin != null) {
          div.style.margin = view.instancePropConfig.styleFlexMargin
        }

        let innerDiv = div.children[0]

        if (innerDiv == null) {
          isCreatedChild = true
          innerDiv = document.createElement('div')
          innerDiv.__isInnerWrapper = true
          div.appendChild(innerDiv)
        }
        innerDiv.style.height = '100%'
        innerDiv.style.width = '100%'
        innerDiv.style.boxSizing = 'border-box'

        if (isCreatedChild) {
          innerDiv.style.background = 'rgba(255, 255, 255, .05)'
          view.el = innerDiv

          loadMountViews.push(view)
        } else if (view.renderer) {
          view.updateProps()
        }
        // } else {
        //     if (isCreatedChild) {
        //         div.style.background = 'rgba(255, 255, 255, .05)';
        //         view.el = div;
        //         if (!this.props.flexNodeHiddenSpace) {
        //             visibleChangeDetect(div, refitFlexedNodes);
        //         }
        //         // 主要处理flex节点隐藏后的联动
        //         // const observer = new MutationObserver((mutationsList, observer) => {
        //         //     if (!this.props.flexNodeHiddenSpace && div.style.display !== view.el.style.display) {
        //         //         div.style.display = view.el.style.display;
        //         //         debouncedRefitFlexNodes();
        //         //     }
        //         // });

        //         // observer.observe(view.el, {
        //         //     attributes: true
        //         // });
        //         loadMountViews.push(view);
        //     } else if (view.renderer) {
        //         view.updateProps();
        //     }
        // }
      }
    }

    if (loadMountViews.length) {
      for (const view of loadMountViews) {
        if (view.loadComponentDefinition) {
          await view.loadComponentDefinition()
          while (!view.componentDefinition) {
            await sleep(100)
            await view.loadComponentDefinition()
          }
          view.interactHandler = currentFcView.interactHandler
          view.initPropsAndEvents()

          // 判断初始化时子节点有插槽的情况
          if (Object.keys(view.slotFcViews).length > 0) {
            for (const slotKey of Object.keys(view.slotFcViews)) {
              // 子节点插槽类型为connect 则需要加到管理器整体注册列表中，以便后续直接操作
              if (view.componentDefinition.slots && view.componentDefinition.slots.filter(slot => (slot.name === slotKey && slot.type === 'connect'))) {
                view.apolloApp.viewManager.componentViews[view.pageId][view.slotFcViews[slotKey].fcId] = view.slotFcViews[slotKey]
              }
            }
          }

          // 临时增加、删除scope值
          Object.assign(view.contextVariables, {
            $scope: view.scopeVariables
          })
          // 对于特殊的配置场景，再给额外的溢出策略
          if (view.instancePropConfig && view.instancePropConfig.flexNodeOverflow) {
            if (view.instancePropConfig.styleMargin != null) {
              view.el.parentElement.style.overflow = view.instancePropConfig.flexNodeOverflow
            } else {
              view.el.style.overflow = view.instancePropConfig.flexNodeOverflow
            }
          }
          view.mount()
          delete view.contextVariables.$scope
        } else {
          // 空白的，仅用于测试
          view.el.style.backgroundColor = '#bcd'
          view.el.style.border = '1px solid green'
        }
      }
    }

    this.loadMountViews = loadMountViews

    // 隐藏占位为否时， 如果有隐藏动作需要重新布局
    if (!this.props.flexNodeHiddenSpace) {
      for (const view of loadMountViews) {
        if (view.el.__isInnerWrapper && view.el.parentElement.style.display !== view.el.style.display) {
          view.el.parentElement.style.display = view.el.style.display
        }
      }
    }
  }

  getContainerStyle (props) {
    const {
      // 相关系统变量
      padding,
      direction = 'row',
      alignItems = 'stretch',
      justify = 'flex-start',
      border
    } = props
    const containerStyle = {
      width: '100%',
      height: '100%',
      display: 'flex',
      border,
      flexDirection: direction,
      justifyContent: justify,
      alignItems,
      padding
    }
    return containerStyle
  }

  render () {
    const containerStyle = this.getContainerStyle(this.props)

    return (
      <div
        ref={this.$el}
        style={containerStyle}
        className='flex-container'
      />
    )
  }
}
