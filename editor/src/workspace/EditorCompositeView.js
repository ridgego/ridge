import { CompositeView } from 'ridge-runtime'
import EditorComponentView from './EditorComponentView.js'

/**
 * Views Mount on Editor
 **/
class EditorCompositeView extends CompositeView {
  createComponentView (config, i) {
    return new EditorComponentView({
      context: this.context,
      config,
      i
    })
  }

  getClassNames () {
    return this.classNames || []
  }

  updatePageConfig (config) {
    Object.assign(this.config, config)

    this.updateStyle()
  }

  updateComponentConfig () {

  }

  updateStyle () {
    super.updateStyle()
    if (this.config.style) {
      const { width, height } = this.config.style

      this.el.style.width = width + 'px'
      this.el.style.height = height + 'px'
    }
  }

  /**
   * 更新页面引入的样式表
   */
  async importStyleFiles () {
    const { cssFiles } = this.config
    const { appService } = this.context.services
    this.classNames = []
    for (const filePath of cssFiles) {
      const file = appService.filterFiles(f => f.path === filePath)[0]
      if (file) {
        const fileContent = await appService.getFileContent(file)
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

  unmount () {
    super.unmount()
    this.el.style.width = 0
    this.el.style.height = 0
  }

  exportPageJSON () {
    this.config.elements = []
    for (const componentView of Object.values(this.componentViews).sort((a, b) => a.i - b.i)) {
      this.config.elements.push(componentView.exportJSON())
    }
    return JSON.parse(JSON.stringify(this.config))
  }
}

export default EditorCompositeView
