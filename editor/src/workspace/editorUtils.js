import { nanoid } from '../utils/string'

const getBlobUrl = (url, context) => {
  const file = context.services.appService.getFileByPath(url)
  if (file) {
    return context.services.appService.store.getItem(file.key)
  } else {
    return null
  }
}

/**
   * 更新页面引入的样式表
   */
const importStyleFiles = async (cssFiles, context) => {
  const oldStyles = document.querySelectorAll('style[local-path]')
  for (const styleEl of oldStyles) {
    document.head.removeChild(styleEl)
  }

  const { appService } = context.services
  const classNames = []
  for (const filePath of cssFiles || []) {
    const file = appService.getFileByPath(filePath)

    if (file) {
      if (!file.textContent) {
        file.textContent = await appService.getFileContent(file)
      }
      const styleEl = document.createElement('style')
      styleEl.setAttribute('local-path', filePath)
      document.head.appendChild(styleEl)
      styleEl.textContent = '\r\n' + file.textContent
      // 计算使用的样式
      const matches = file.textContent.match(/\/\*.+\*\/[^{]+{/g)
      for (const m of matches) {
        const label = m.match(/\/\*.+\*\//)[0].replace(/[/*]/g, '')
        const className = m.match(/\n[^{]+/g)[0].trim().substring(1)

        classNames.push({
          className,
          label
        })
      }
    }
  }
  return classNames
}

/**
 * Load jsFiles from local workspace()
*/
const importJSFiles = async (jsFiles, context) => {
  const jsModules = []
  const oldScripts = document.querySelectorAll('script[local-path]')
  for (const scriptEl of oldScripts) {
    document.head.removeChild(scriptEl)
  }
  for (const filePath of jsFiles || []) {
    const jsStoreModule = await importJSFile(filePath, this.context)
    if (jsStoreModule) {
      jsModules.push(jsStoreModule)
    }
  }
  return jsModules
}

const importJSFile = async (jsPath, context) => {
  const { appService } = context.services
  const file = appService.getFileByPath(jsPath)
  if (file) {
    if (!file.textContent) {
      file.textContent = await appService.getFileContent(file)
    }
    const scriptEl = document.createElement('script')
    scriptEl.setAttribute('local-path', jsPath)

    const jsGlobal = 'ridge-store-' + nanoid(10)
    scriptEl.textContent = file.textContent.replace('export default', 'window["' + jsGlobal + '"]=')

    try {
      document.head.append(scriptEl)
      return window[jsGlobal]
    } catch (e) {
      console.error('Store Script Error', e)
      return null
    }
  }
}

export {
  getBlobUrl,
  importStyleFiles,
  importJSFiles,
  importJSFile
}
