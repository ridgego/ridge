import debug from 'debug'
import loadjs from 'loadjs'
import ky from 'ky'
import memoize from 'lodash/memoize'
const log = debug('ridge:loader')
/**
 * 组件定义（js及其依赖）加载服务类
 * @class
 */
class Loader {
/**
   * 构造器
   * @param {object} externalOptions 第三方依赖定义信息，这个配置会覆盖 wind-pack-externals 中webpackExternals 定义
   */
  constructor ({
    baseUrl
  }) {
    this.baseUrl = baseUrl
    log('RidgeLoader baseUrl: ' + this.baseUrl)

    this.packageJSONCache = {}
    this.getPackageJSON = memoize(this._getPackageJSON)
    this.loadComponent = memoize(this._loadComponent)
    this.loadScript = memoize(this._loadScript)
    this.confirmPackageDependencies = memoize(this._confirmPackageDependencies)
  }

  /**
   * 加载应用的所有组件包
   */
  async getComponentPackages () {
    return await this.store.getComponentPackages()
  }

  async loadFont (fonPath) {

  }

  async loadStyle (stylePath) {

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
  }

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

    let rc = null
    if (path.endsWith('.d.js')) {
      // 组件单个加载
      // 加载包依赖的js （必须首先加载否则组件加载会出错）
      await this.confirmPackageDependencies(packageName)
      await this.loadScript(`${this.baseUrl}/${packageName}/${path}`)

      if (window[`${packageName}/${path}`]) {
        rc = window[`${packageName}/${path}`].default
      }
    } else {
      await this.confirmPackageDependencies(packageName)
      const bundle = await this.loadScript(`${packageName}/ridge.js`)

      rc = bundle[path]
    }

    if (rc != null) {
      rc.packageName = packageName
      rc.path = path

      return rc
    }
  }

  /**
   * 加载组件包的依赖资源
   * @param {String} packageName 组件包名称
   */
  async _confirmPackageDependencies (packageName) {
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
   * 获取package.json定义对象
   * @param {*} packageName
   * @returns
   */
  async _getPackageJSON (packageName) {
    if (this.packageJSONCache[packageName]) {
      return this.packageJSONCache[packageName]
    }

    const packageJSONObject = await ky.get(`${this.baseUrl}/${packageName}/package.json`).json()

    this.packageJSONCache[packageName] = packageJSONObject
    return packageJSONObject
  }
}

export default Loader
