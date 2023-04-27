import debug from 'debug'
import _ from 'lodash'
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
    store
  }) {
    this.store = store
    log('RidgeLoader baseUrl: ' + this.baseUrl)

    this.packageJSONCache = {}
    this.getPackageJSON = _.memoize(this.getPackageJSONOnce)
    this.loadComponent = _.memoize(this.loadComponentOnce)
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

  async loadScript (scriptPath) {

  }

  async loadComponent (componentPath) {
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
      rc = await this.store.loadScript(packageName, path)
    } else {
      await this.confirmPackageDependencies(packageName)
      const bundle = await this.store.loadScript(packageName, 'ridge.js')
      rc = bundle[path]
    }
    rc.packageName = packageName
    rc.path = path

    return rc
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
   * 获取package.json定义对象
   * @param {*} packageName
   * @returns
   */
  async getPackageJSON (packageName) {
    if (this.packageJSONCache[packageName]) {
      return this.packageJSONCache[packageName]
    }

    let packageJSONObject = null
    for (const store of this.stores) {
      packageJSONObject = await store.getPackageJSON(store)
      if (packageJSONObject) break
    }

    this.prefixPackageJSON(packageJSONObject)

    this.packageJSONCache[packageName] = packageJSONObject
    return packageJSONObject
  }
}

export default Loader
