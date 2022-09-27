import PageDecorator from './page_decorator'

export default class BodyScrollBarDecorator extends PageDecorator {
  constructor () {
    super()
    this.config = {
      enabled: !((window.top.fdreConfig && window.top.fdreConfig.scrollBarEnabled === false)),
      barColorVar: (window.top.fdreConfig && window.top.fdreConfig.scrollBarColor) || 'var(--fgC1A_60, rgba(255, 255, 255, .2))',
      barHoverColorVar: (window.top.fdreConfig && window.top.fdreConfig.scrollBarHoverColor) || 'var(--fgC1, rgba(255, 255, 255, .3))',
      barActiveColorVar: (window.top.fdreConfig && window.top.fdreConfig.scrollBarActiveColor) || 'var(--fgC1, rgba(255, 255, 255, .4))',
      width: 8
    }
  }

  addStyle (styles) {
    /* Create style document */
    if (!this.scrollbarStyleTag) {
      this.scrollbarStyleTag = document.createElement('style')
      /* Append style to the tag name */
      document.getElementsByTagName('head')[0].appendChild(this.scrollbarStyleTag)
    }
    this.scrollbarStyleTag.textContent = styles
    // if (this.scrollbarStyleTag.styleSheet) { this.scrollbarStyleTag.styleSheet.cssText = styles; } else { this.scrollbarStyleTag.appendChild(document.createTextNode(styles)); }
  }

  /**
     * ViewManager 初始化回调
     */
  async init (fcViewManager) {
    this.config = Object.assign(this.config, fcViewManager.apolloApp.scrollBarConfig)
    if (this.config.enabled) {
      this.addScrollBarStyle(this.config.barColorVar, this.config.barHoverColorVar, this.config.barActiveColorVar)
    } else {
      this.removeScrollBarStyle()
    }
  }

  removeScrollBarStyle () {
    if (this.scrollbarStyleTag) {
      document.getElementsByTagName('head')[0].removeChild(this.scrollbarStyleTag)
      this.scrollbarStyleTag = null
    }
  }

  addScrollBarStyle (color, hoverColor, activeColor) {
    this.addStyle(`
        ::-webkit-scrollbar,
        ::-webkit-scrollbar-thumb {
            width: 16px;
            border-radius: 20px;
            background-clip: padding-box;
            border: 4px solid transparent;
            color: ${color};
        }
        ::-webkit-scrollbar-thumb:hover {
            color: ${hoverColor};
        }
        ::-webkit-scrollbar-thumb:active {
            color: ${activeColor};
        }
        ::-webkit-scrollbar-thumb {
            box-shadow: inset 0 0 0 10px;
        }
        ::-webkit-scrollbar-corner {
            display: none;
        }
    `)
  }

  /**
   * ViewManager 上下文更新处理事件
   * @param {*} context 上下文内容
   * @param {*} apolloApp app
   */
  contextUpdate (context, fcViewManager) {
    if (context.scrollBarConfig) {
      this.config = Object.assign(this.config, context.scrollBarConfig)
      if (this.config.enabled) {
        this.addScrollBarStyle(this.config.barColorVar, this.config.barHoverColorVar, this.config.barActiveColorVar)
      } else {
        this.removeScrollBarStyle()
      }
    }
  }

  /**
   * page实例mount后触发事件
   * @param {*} fcViewManager
   */
  async onPageViewsCreated (fcViewManager) {}
}
