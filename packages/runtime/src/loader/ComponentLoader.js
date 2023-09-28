import ky from 'ky'
import debug from 'debug'
import loadjs from 'loadjs'
import memoize from 'lodash/memoize'

const log = debug('ridge:loader')

/**
 * 组件定义（js及其依赖）加载服务类
 * @class
 */
class ComponentLoader {
  /**
   * 构造器
   * @param {string} baseUrl  元素下载基础地址
   * @param {string} unpkgUrl  第三方库下载地址
   */
  constructor ({
    baseUrl
  }) {
    this.baseUrl = baseUrl
    log('RidgeLoader baseUrl: ' + this.baseUrl)

    // 加载的字体列表
    this.loadedFonts = []

    this.getPackageJSON = memoize(this._getPackageJSON)
    this.loadComponent = memoize(this._loadComponent)
    this.loadScript = memoize(this._loadScript)
  }

  getComponentUrl ({ packageName, path }) {
    return `${this.baseUrl}/${packageName}/${path}`
  }

  getPackageJSONUrl (packageName) {
    return `${this.baseUrl}/${packageName}/package.json`
  }

  /**
   * 加载组件， 支持2种参数
   * 1、对象
   * {
   *   packageName: 'ridge-basic',
   *   path: './build/container1.pel.js'
   * }
   * 2、全路径
   * ridge-basic/build/container1.pel.js 或 ridge-basic@ridge/build/container1.pel.js
   *
   * @param {String} packageName Npm包名
   * @param {String} path 相对于包的组件路径
   */
  async _loadComponent (componentPath) {
    let packageName, path
    if (typeof componentPath === 'object') {
      packageName = componentPath.packageName
      path = componentPath.path
    } else {
      // 抽取包和路径
      const paths = componentPath.split('/')
      if (paths[0].startsWith('@')) {
        packageName = paths.splice(0, 2).join('/')
        path = paths.join('/')
      } else {
        packageName = paths.splice(0, 1).join('/')
        path = paths.join('/')
      }
    }
    return await this.doLoadComponent({ packageName, path })
  }

  /**
   * 进行网络传输、加载组件内容
   * @param {*} param0
   * @returns
   */
  async doLoadComponent ({
    packageName, path
  }) {
    // 加载包依赖的js （必须首先加载否则组件加载会出错）
    const packageJSONObject = await this.getPackageJSON(packageName)

    if (packageJSONObject == null) {
      return null
    }

    await this.confirmPackageDependencies(packageJSONObject)

    const rcd = await this.loadComponentScript({ packageName, path })
    if (rcd) {
      await this.prepareComponent(rcd, { packageName, path }, packageJSONObject)
    }
    return rcd
  }

  /**
   * 预处理组件定义，定义前后变更的兼容性问题解决
   * @param {} fcp 组件定义
   * @param {*} param1
   * @param {*} packageJSONObject
   */
  async prepareComponent (rcd, {
    packageName,
    path
  }, packageJSONObject) {
    rcd.packageName = packageName
    rcd.path = path

    // 标题统一是title
    rcd.title = rcd.title || rcd.label
    // 加载单独的依赖
    if (rcd.requires && rcd.requires.length) {
      await this.loadExternals(rcd.requires)
    }

    if (rcd.icon) {
      rcd.icon = `${this.baseUrl}/${packageName}/${rcd.icon}`
    }

    // 处理渲染器，加载渲染器依赖
    if (rcd.component) {

      // 支持异步的加载情况
      if (typeof rcd.component === 'function') {
        if (rcd.component.constructor.name === 'AsyncFunction') {
          rcd.component = (await rcd.component()).default
        }
      }
    } else {
      log('组件 Component定义未加载到', rcd)
    }
  }

  on (eventName, callback) {
    this.eventCallbacks.push({
      eventName,
      callback
    })
  }

  /**
     * 加载前端组件的代码，支持2种方式 globalThis 及 amd
     */
  async loadComponentScript ({
    packageName,
    path
  }) {
    // 加载图元脚本，其中每个图元在编译时都已经设置到了window根上，以图元url为可以key
    await this.loadScript(`${this.baseUrl}/${packageName}/build/${path}.js`)

    const scriptLibName = `${packageName}/${path}`
    // globalThis方式
    if (window[scriptLibName]) {
      return window[scriptLibName].default
    } else {
      return null
    }
  }

  /**
     * 获取组件
     * 优先从fcCache 中获取（依赖版本）；再从window下获取（不依赖版本）
     * @param {*} pel
     */
  getComponent (componentUrl) {
    if (this.componentCache[componentUrl]) {
      return this.componentCache[componentUrl]
    } else {
      return null
    }
  }

  async loadCss (href) {
    // Create new link Element
    const link = document.createElement('link')

    // set the attributes for link element
    link.rel = 'stylesheet'

    link.type = 'text/css'

    link.href = href

    // Get HTML head element to append
    // link element to it
    document.getElementsByTagName('HEAD')[0].appendChild(link)
  }

  async _loadScript (url) {
    try {
      log('加载库:' + url)
      await loadjs(url, {
        returnPromise: true,
        before: function (scriptPath, scriptEl) {
          scriptEl.crossOrigin = true
        }
      })
    } catch (e) {
      console.error('第三方库加载异常 ', `${url}`)
    }
    return url
  }

  /**
   * 获取package.json定义对象
   * @param {*} packageName
   * @returns
   */
  async _getPackageJSON (packageName) {
    const packageJSONUrl = this.getPackageJSONUrl(packageName)
    try {
      return await ky.get(packageJSONUrl).json()
    } catch (e) {
      log('NPM Package Not Loaded:', packageJSONUrl)
      return null
    }
  }

  /**
   * 加载组件包的依赖资源
   * @param {String} packageName 组件包名称
   */
  async confirmPackageDependencies (packageObject) {
    if (packageObject.externals) {
      for (const external of packageObject.externals) {
        await this.loadScript(`${this.baseUrl}/${packageObject.name}/${external}`)
      }
    }
  }

  async loadJSON (path) {
    return await ky.get(path).json()
  }
}

export default ComponentLoader
