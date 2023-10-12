import { CompositeView } from 'ridge-runtime'
class EditorCompositeView extends CompositeView {
  constructor (config) {
    super(config)
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
    this.classNames = []
    for (const filePath of cssFiles) {
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

export default EditorCompositeView
