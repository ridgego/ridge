import ReactPelFactory from '../factory/ReactPelFactory'
import VuePelFactory from '../factory/VuePelFactory'
import webpackExternals from 'ridge-externals';
import ky from 'ky';
import debug from 'debug'
import loadjs from 'loadjs'

// 组态化组件资源服务地址
const log = debug('editor:ridge-loader')
const important = debug('important')

if (window.top.globalExternalConfig) {
  webpackExternals.externals.push(...window.top.globalExternalConfig)
}
/**
 * 组件定义（js及其依赖）加载服务类
 * @class
 */
class RidgeLoader {
  /**
   * 构造器
   * @param {string} baseUrl  图元下载基础地址
   * @param {object} opts 第三方依赖定义信息，这个配置会覆盖 @gw/wind-pack-externals 中webpackExternals 定义
   */
  constructor (baseUrl, opts) {
    this.baseUrl = baseUrl || ''
    this.unpkgUrl = 'http://unpkg.com'

    important('RidgeLoader baseUrl: ' + this.baseUrl)

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

    // 调试服务的地址
    this.debugUrl = null
    // 调试组件包名称
    this.debugPackageName = null

    this.packageLoadingPromises = {}

    this.externalOptions = opts || {}

    if (window.top.fdreConfig && window.top.fdreConfig.loaderOptions) {
      Object.assign(this.externalOptions, window.top.fdreConfig.loaderOptions)
    }

    this.scriptLoadingPromises = {}

    // 组件加载器回调事件
    this.eventCallbacks = []

    // 脚本地址对应的lib名称
    this.scriptUrlLibName = {}

    this.pelCacheByLibName = {}

    // 组件加载中的Map
    this.componentLoading = new Map()
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
    return `${this.baseUrl}/${packageName}/${path}`
  }

  getPackageJSONUrl ( packageName ) {
    return `${this.baseUrl}/${packageName}/package.json`;
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
     * 获取或者加载（图元js文件已经load）图元的fcp对象
     */
  async getComponetCache ({
    packageName,
    path
  }) {
    try {
      // 拼接组件url（加版本号）
      const componentUrl = this.getPelUrl({ packageName, path })

      if (this.componentCache[componentUrl]) {
        return this.componentCache[componentUrl]
      } else {
        // 组件库更新了，保证之前绘制的组件版本仍然可用
        const pelLibName = this.getComponentLibName(pel)
        const esModule = window[pelLibName]

        if (esModule && esModule.default) {
          const fcp = esModule && esModule.default

          await this.initFcp(fcp, pel)
          this.fcCache[componentUrl] = fcp
          this.setPelLoaded(componentUrl, fcp)
          return fcp
        }
        return null
      }
    } catch (e) {
      console.log(`There is no ${pel} component`)
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

        const externalLibPath = `${this.unpkgUrl}/${externalModule.dist}`;

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

  /**
     * 加载前端组件的代码，支持2种方式 globalThis 及 amd
     */
  async loadComponentScript ({
    packageName,
    path
  }) {
    const scriptUrl = this.getComponentUrl({ packageName, path})
    const scriptLibName = this.getComponentLibName({ packageName, path });
   
    // 从本地调试加载组件代码
    if (this.debugUrl && this.debugPackageName === packageName) {
      scriptUrl = `${this.debugUrl}${url}`
    }

    // 加载图元脚本，其中每个图元在编译时都已经设置到了window根上，以图元url为可以key
    await this.loadScript(scriptUrl)

    // globalThis方式
    if (window[scriptLibName]) {
      return window[scriptLibName].default
    } else {
      return null;
    }
  }

  /**
     * 一次性加载多个组件
     * @param {Array} pelList 组件列表
     */
  async loadPels (pelList) {
    const pels = pelList.filter(each => each.packageName).map(each => {
      return {
        packageName: each.packageName,
        path: each.path
      }
    })
    const packagesToLoad = Array.from(new Set(pels.map(each => each.packageName))).filter(name => name)

    for (const packageName of packagesToLoad) {
      await this.confirmPackageDependencies(packageName)
    }
    const pelsPath = Array.from(new Set(pels.map(each => {
      if (this.appName) {
        return `${this.appName}/npm_packages/${each.packageName}/${each.path}`
      } else {
        return `/npm_packages/${each.packageName}/${each.path}`
      }
    }))).filter(name => name)
    const concatPath = await getConcatPath(pelsPath)

    await this.loadScript(concatPath)
  }

  /**
   * Load Component By Id：
   * {
   *   packageName: '@gw/wind-pels-standard',
   *   path: './build/container1.pel.js'
   * }
   * @param {String} packageName Npm package from which component belongs to
   * @param {String} path Component path
   */
  async loadComponent ({
    packageName,
    path
  }) {
    
    const componentUrl = this.getComponentUrl({ packageName, path })
    const cache = this.getComponent(componentUrl);

    if (cache) {
      return cache
    }

    // 对于正在加载中的， 监听成功、失败的回调
    if (this.componentLoading.get(componentUrl) === 'loading') {
      return new Promise((resolve, reject) => {
        this.on('component-ready', (url, fcp) => {
          if (url === componentUrl) {
            resolve(fcp)
          }
        })
        this.on('component-fail', url => {
          if (url === componentUrl) {
            resolve(null)
          }
        })
      })
    } else if (this.componentLoading.get(componentUrl) === 'fail') {
      return null
    }

    this.componentLoading.set(componentUrl, 'loading')
    
    try {
      const fcp = this.doLoadComponent({ packageName, path });
      this.componentLoading.set(componentUrl, 'loaded');

      this.componentCache[componentUrl] = fcp
      this.setPelLoaded(componentUrl, fcp)
      return fcp
    } catch (e) {
      this.setPelLoadFail(componentUrl)
      log('组件加载异常', e)
      return null
    }
  }

  async doLoadComponent({
    packageName, path
  }) {
    // Load Dependecies in package.json
    await this.confirmPackageDependenciesIndividual(packageName);
    const fcp = await this.loadComponentScript({ packageName, path });
    if (fcp) {
      await this.prepareComponent(fcp, { packageName, path });
    } else {
      throw new Error();
    }
    return fcp;
  }

  async prepareComponent (fcp, {
    packageName,
    path
  }) {
    fcp.packageName = packageName
    fcp.path = path

    // 对于icon定义中含有图片名后缀，认为是预览图元，设置previewUrl
    const imageNameRegex = /\.(jpg|gif|png|jpeg|svg)$/i

    if (fcp.externals && fcp.externals.length) {
      await this.loadExternals(fcp.externals)
    }

    if (fcp.icon && imageNameRegex.test(fcp.icon)) {
      if (this.debugPackageName === pel.packageName && this.debugUrl) {
        fcp.previewUrl = `${this.debugUrl}${fcp.icon}`
      } else {
        fcp.previewUrl = `${this.getServePath(pel.loadFromProject)}/npm_packages/${pel.packageName}/${fcp.icon}`
      }
    }

    // 处理渲染器，加载渲染器依赖
    if (fcp.component) {
      let fc = fcp.component

      // 支持异步的加载情况
      if (typeof fc === 'function' && fc.constructor.name === 'AsyncFunction') {
        fc = (await fc()).default
      }
      if (fc.props) {
        // vue 图元
        fcp.factory = new VuePelFactory(fc)
      } else {
        fcp.factory = new ReactPelFactory(fc)
      }
    }
    if (fcp.factory) {
      // 加载渲染器依赖
      await fcp.factory.loadDependencies()
    } else {
      log('组件 Component定义未加载到', fcp)
    }
  }

  setPelLoaded (url, fcp) {
    this.componentLoading.set(url, 'loaded')
    try {
      this.eventCallbacks.filter(item => item.eventName === 'component-ready').forEach(item => {
        item.callback(url, fcp)
      })
    } catch (e) {
      // callback error ignored
    }
  }

  setPelLoadFail (url) {
    this.componentLoading.set(url, 'fail')
    try {
      this.eventCallbacks.filter(item => item.eventName === 'component-fail').forEach(item => {
        item.callback(url)
      })
    } catch (e) {
      // callback error ignored
    }
  }

  on (eventName, callback) {
    this.eventCallbacks.push({
      eventName,
      callback
    })
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

  async confirmPackageDependencies (packageName) {
    if (this.packageJSONCache[packageName]) {
      if (this.packageJSONCache[packageName].dependencies) {
        log('加载库依赖', packageName, Object.keys(this.packageJSONCache[packageName].dependencies))
        await this.loadPelExternals(Object.keys(this.packageJSONCache[packageName].dependencies))
      }
    } else {
      try {
        const packageJSONUrl = this.getPackageJSONUrl(packageName);
  
        const packageJSONObject = await await ky.get(packageJSONUrl).json();

        this.packageJSONCache[packageJSONObject] = packageJSONObject;
        return packageJSONObject;
      } catch (e) {
        throw new Error('组件包未安装:' + packageName)
      }
    }
  }

  /**
     * 加载前端组件包的package.json中的dependencies
     * @param pel
     * @returns {Promise<void>}
     */
  async confirmPackageDependenciesIndividual (packageName) {
    // 直接使用unpkg方式获取package.json
    if (this.packageNotInstalled.indexOf(packageName) > -1) {
      // 包无法加载，说明未安装，后续组件也就无法加载了
      throw new Error('组件包未安装:' + packageName)
    } else if (!this.packageJSONCache[packageName]) {
      if (this.packageLoadingPromises[packageName]) {
        await this.packageLoadingPromises[packageName]
      } else {
        this.packageLoadingPromises[packageName] = (async () => {
          const packageJSONUrl = this.getPackageJSONUrl(packageName)
          const jsonLoaded = await ky.get(packageJSONUrl).json()

          if (jsonLoaded.name === packageName) {
            // 可以加载到包
            if (jsonLoaded.dependencies) {
              log('加载库依赖', jsonLoaded.name, Object.keys(jsonLoaded.dependencies))
              await this.loadExternals(Object.keys(jsonLoaded.dependencies))
            }
            this.packageJSONCache[packageName] = jsonLoaded
          } else {
            this.packageNotInstalled.push(packageName)
            // 包无法加载，说明未安装，后续组件也就无法加载了
            throw new Error('组件包未安装:' + packageName)
          }
        })()
      }
      await this.packageLoadingPromises[packageName]
    }
  }
}

export default RidgeLoader