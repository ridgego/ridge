import webpackExternals from 'ridge-externals'
import ky from 'ky'
import debug from 'debug'
import loadjs from 'loadjs'
import _ from 'lodash'

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
   * @param {object} externalOptions 第三方依赖定义信息，这个配置会覆盖 wind-pack-externals 中webpackExternals 定义
   */
  constructor ({
    baseUrl,
    unpkgUrl,
    externalOptions
  }) {
    this.baseUrl = baseUrl ?? ''
    this.unpkgUrl = unpkgUrl ?? 'http://unpkg.com'

    log('RidgeLoader baseUrl: ' + this.baseUrl)

    /** @property 前端组件加载缓存 key: 组件lib名称或加载地址  value: 组件fcp */
    this.componentCache = {}

    /** @property 加载的前端npm包描述缓存 */
    this.packageJSONCache = {}
    // 未安装的组件包列表
    this.packageNotInstalled = []
    // 加载的字体列表
    this.loadedFonts = []
    // 已经加载的前端组件的第三方依赖库
    window.fcExternalLoaded = []

    // 调试组件包名称
    this.debugPackageName = null

    this.packageLoadingPromises = {}

    this.externalOptions = externalOptions ?? {}

    if (window.top.ridgeConfig && window.top.ridgeConfig.loaderExternalOptions) {
      Object.assign(this.externalOptions, window.top.ridgeConfig.loaderExternalOptions)
    }

    this.scriptLoadingPromises = {}

    // 组件加载器回调事件
    this.eventCallbacks = []

    // 脚本地址对应的lib名称
    this.scriptUrlLibName = {}

    this.pelCacheByLibName = {}

    // 组件加载中的Map
    this.componentLoading = new Map()

    this.getPackageJSON = _.memoize(this.getPackageJSONOnce)
    this.loadComponent = _.memoize(this.loadComponentOnce)
  }

  async getDebugPackage () {
    if (this.debugPackage !== undefined) {
      return this.debugPackage
    }
    if (this.debugUrl) {
      try {
        this.debugPackage = await ky.get(this.debugUrl + '/package.json').json()
      } catch (e) {
        this.debugPackage = null
      }
    } else {
      this.debugPackage = null
    }
    return this.debugPackage
  }

  /**
     * 设置第三方库的加载额外定义信息
     * @param {object} opts 这个配置会覆盖 webpackExternals 定义
     */
  setExternalOptions (opts) {
    this.externalOptions = opts
  }

  setAppName (appName) {
    if (appName) {
      this.appName = appName
    }
  }

  setProjectId (projectId) {
    if (projectId) {
      this.projectId = projectId
    }
  }

  setDebugUrl (debugUrl) {
    this.debugUrl = debugUrl
  }

  setDebugPackageName (debugPackageName) {
    this.debugPackageName = debugPackageName
  }

  getServePath (isProject) {
    if (isProject && this.projectId) {
      return this.baseUrl + '/' + this.appName + '/' + this.projectId
    } else if (this.appName) {
      return this.baseUrl + '/' + this.appName
    } else {
      return this.baseUrl
    }
  }

  /**
   * 获取图元的url地址， 图元url将作为图元的唯一标识，此方法根据图元定义->图元url进行统一转换
   * @param {object} pel 图元定义 {packageName, version, path} 键值对象
   * @returns {string}
   */
  getComponentUrl ({ packageName, path }) {
    if (this.debugPackage && packageName === this.debugPackage.name) {
      return `${this.debugUrl}/${path}`
    } else {
      return `${this.baseUrl}/${packageName}/${path}`
    }
  }

  getPackageJSONUrl (packageName) {
    return `${this.baseUrl}/${packageName}/package.json`
  }

  /**
   * 获取图元的服务对象的名称
   * @param {object} pel 图元定义
   * @returns {string}
   */
  getComponentLibName ({ packageName, path }) {
    return `/${packageName}/${path}`
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
  async loadComponentOnce (componentPath) {
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
    try {
      const fcp = await this.doLoadComponent({ packageName, path })
      return fcp
    } catch (e) {
      log('组件加载异常', e)
      return null
    }
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
    const packageJSONObject = await this.confirmPackageDependencies(packageName)
    const fcp = await this.loadComponentScript({ packageName, path })
    if (fcp) {
      await this.prepareComponent(fcp, { packageName, path }, packageJSONObject)
    } else {
      throw new Error()
    }
    return fcp
  }

  /**
   * 预处理组件定义，定义前后变更的兼容性问题解决
   * @param {} fcp 组件定义
   * @param {*} param1
   * @param {*} packageJSONObject
   */
  async prepareComponent (fcp, {
    packageName,
    path
  }, packageJSONObject) {
    fcp.packageName = packageName
    fcp.path = path

    // 标题统一是title
    fcp.title = fcp.title || fcp.label
    // 加载单独的依赖
    if (fcp.requires && fcp.requires.length) {
      await this.loadExternals(fcp.requires)
    }

    // if (packageJSONObject.components) {
    //   const filtered = packageJSONObject.components.filter(component => component.path === path)
    //   if (filtered.length === 1) {
    //     fcp.icon = filtered[0].icon
    //   }
    // }

    // 处理渲染器，加载渲染器依赖
    if (fcp.component) {
      let fc = fcp.component

      // 支持异步的加载情况
      if (typeof fc === 'function') {
        if (fc.constructor.name === 'AsyncFunction') {
          fc = (await fc()).default
        }
      }
    } else {
      log('组件 Component定义未加载到', fcp)
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
    const scriptUrl = `${this.baseUrl}/${packageName}/build/${path}.js`
    const scriptLibName = `${packageName}/${path}`

    // 加载图元脚本，其中每个图元在编译时都已经设置到了window根上，以图元url为可以key
    await this.loadScript(scriptUrl)

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

  /**
    * 加载图元对外部的代码依赖
    * @param {Array} externals 外部依赖库列表
    */
  async loadExternals (externals) {
    const webpackExternalsMerged = Object.assign(webpackExternals, window.globalExternalConfig)

    for (const external of externals) {
      // 获取外部依赖库的下载地址 external为图元中声明的依赖库名称 例如 'echarts'
      const externalModule = webpackExternalsMerged.externals.filter(ex => external === ex.module)[0]

      // 有声明则下载，否则忽略
      if (externalModule) {
        // 判断第三方库如果已经在全局加载，则直接使用全局的库
        if (externalModule.root && window[externalModule.root]) {
          continue
        }

        // 首先递归下载依赖的依赖
        if (externalModule.dependencies) {
          await this.loadExternals(externalModule.dependencies)
        }

        const externalLibPath = `${this.unpkgUrl}/${externalModule.dist}`

        if (externalModule.style) {
          // 外界定义的样式加载地址
          if (this.externalOptions[externalModule.module] != null) {
            if (Array.isArray(this.externalOptions[externalModule.module])) {
              try {
                for (const externalCssPath of this.externalOptions[externalModule.module]) {
                  await this.loadScript(externalCssPath)
                }
              } catch (e) {
                console.warn('加载应用定义的样式失败 地址是:' + this.externalOptions[externalModule.module])
              }
            } else if (typeof this.externalOptions[externalModule.module] === 'string') {
              try {
                await this.loadScript(this.externalOptions[externalModule.module])
              } catch (e) {
                console.warn('加载应用定义的样式失败 地址是:' + this.externalOptions[externalModule.module])
              }
            }
          } else if (typeof externalModule.style === 'string') {
            await this.loadScript(`${this.unpkgUrl}/${externalModule.style}`)
          }
        }

        if (!this.scriptLoadingPromises[externalLibPath]) {
          // loadjs会自动处理重复加载的问题，因此此处无需做额外处理
          this.scriptLoadingPromises[externalLibPath] = (async () => {
            try {
              log('加载第三方库:' + externalLibPath)

              await loadjs(externalLibPath, {
                returnPromise: true,
                before: function (scriptPath, scriptEl) {
                  scriptEl.crossOrigin = true
                }
              })
            } catch (e) {
              console.error('第三方库加载异常 ', `${externalModule.module}`)
            }
          })()
        }

        await this.scriptLoadingPromises[externalLibPath]
        // 这里必须加载完成才标志为loaded。否则外部可能请求并发下载，那么后面的并发判断成功但加载未完成
        window.fcExternalLoaded.push(externalModule.module)
      } else {
        log('忽略库:' + external)
      }
    }
  }

  /**
     * 加载指定的字体（按名称）
     * @param name 字体名称
     * @param pkg 字体所在的图元包,包括名称和版本默认为@gw/web-font-assets@latest
     */
  async loadFont (pkg, name, url) {
    if (!name || this.loadedFonts.indexOf(name) > -1) {
      return
    }
    if (name === 'default') {
      // 默认字体不需要加载
      return
    }
    try {
      const fontFaceName = pkg ? (pkg + '/' + url) : name
      let fontUrl = this.getServePath() + '/npm_packages/' + (pkg ? (pkg + '/' + url) : name)

      // 这是对110的字体加载的兼容， 110图纸中，字体是直接按名称保存到图元中的 例如 groteskia，没有直接提供字体地址的url。 所以需要根据字体包中JSON的定义获取具体的字体url
      // 进行进一步的加载
      if (!pkg && !url && name.indexOf('.woff') === -1) {
        await this.confirmPackageDependencies('@gw/web-font-assets')
        if (this.packageJSONCache['@gw/web-font-assets']) {
          if (this.packageJSONCache['@gw/web-font-assets'].fonts[name]) {
            fontUrl = this.getServePath() + '/npm_packages/@gw/web-font-assets/' + this.packageJSONCache['@gw/web-font-assets'].fonts[name].url
          }
        } else {
          console.error('加载字体地址未找到', name)
        }

        // https://localhost:3001/scada/npm_packages/@gw/web-font-assets/package.json
      }

      // name 直接提供完整地址的情况
      const ff = new FontFace(fontFaceName, `url(${fontUrl})`)

      await ff.load()
      document.fonts.add(ff)

      this.loadedFonts.push(name)
    } catch (e) {
      console.error('加载字体异常', name, pkg, e)
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

  async loadScript (url) {
    if (!this.scriptLoadingPromises[url]) {
      // loadjs会自动处理重复加载的问题，因此此处无需做额外处理
      this.scriptLoadingPromises[url] = (async () => {
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
      })()
    }
    await this.scriptLoadingPromises[url]
  }

  setPackageCache (packageName, packageObject) {
    this.packageJSONCache[packageName] = packageObject
  }

  /**
     * 刷新Debug模式下从本地开发服务加载的组件
     */
  async reloadDebugCache () {
    for (const cacheKey of Object.keys(this.fcCache)) {
      if (cacheKey.startsWith('https://')) {
        delete this.scriptLoadingPromises[cacheKey]
        await this.loadScript(cacheKey)

        if (window[this.scriptUrlLibName[cacheKey]]) {
          const fcp = window[this.scriptUrlLibName[cacheKey]].default

          await this.initFcp(fcp, this.pelCacheByLibName[this.scriptUrlLibName[cacheKey]])
          this.fcCache[cacheKey] = fcp
        }
      }
    }
  }

  /**
   * 获取package.json定义对象
   * @param {*} packageName
   * @returns
   */
  async getPackageJSONOnce (packageName) {
    if (this.packageJSONCache[packageName]) {
      return this.packageJSONCache[packageName]
    }

    if (this.debugUrl) {
      const packageObject = await this.getDebugPackage()
      if (packageObject && packageObject.name === packageName) {
        this.prefixPackageJSON(packageObject, this.debugUrl)
        this.setPackageCache(packageObject.name, packageObject)
        return packageObject
      }
    }

    const packageJSONUrl = this.getPackageJSONUrl(packageName)

    try {
      const packageObject = await ky.get(packageJSONUrl).json()
      this.prefixPackageJSON(packageObject, this.baseUrl + '/' + packageName)
      this.setPackageCache(packageObject)

      return packageObject
    } catch (e) {
      console.error('NPM Package Not Loaded: ', packageName, e)
    }
  }

  prefixPackageJSON (packageObject, prefix) {
    if (packageObject.icon) {
      if (!packageObject.icon.startsWith('data:image')) {
      //  packageObject.icon = `${prefix}/${packageObject.icon}`
      }
    } else {
      packageObject.icon = `${prefix}/icon.svg`
    }

    for (const com of packageObject.components ?? []) {
      if (com.icon && !com.icon.startsWith('data:image')) {
        com.icon = `${prefix}/${com.icon}`
      }
    }
  }

  /**
   * 加载组件包的依赖资源
   * @param {String} packageName 组件包名称
   */
  async confirmPackageDependencies (packageName) {
    const packageObject = await this.getPackageJSON(packageName)
    if (packageObject) {
      if (packageObject.dependencies) {
        await this.loadExternals(Object.keys(packageObject.dependencies))
      }
      if (packageObject.externals) {
        for (const external of packageObject.externals) {
          await this.loadScript(`${this.baseUrl}/${packageName}/${external}`)
        }
      }
    }

    return packageObject
  }

  /**
   * 全加载组件包
   */
  async loadPackageAndComponents (pkgName) {
    const packageJSON = await this.getPackageJSON(pkgName)

    const components = []
    if (packageJSON.components && packageJSON.components.length) {
      for (const componentPath of packageJSON.components) {
        components.push(await this.loadComponent(pkgName + '/' + componentPath))
      }
      await Promise.allSettled(components)
    }
    packageJSON.componentLoaded = components
    return packageJSON
  }

  async loadJSON (path) {
    return await ky.get(path).json()
  }
}

export default ComponentLoader
