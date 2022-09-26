const { BadRequestError, HttpError, NotFoundError, ServiceUnavailableError } = require('@gw/wind-core-http')
const download = require('download')
const axios = require('axios')
const fs = require('fs')
const tar = require('tar')
const concat = require('concat')
const hash = require('object-hash')
const debug = require('debug')('apollo:assets')
const webpackExternals = require('@gw/wind-pack-externals')
const path = require('path')
// compareVersions = require('compare-versions');

const ASSETS_PREFIX = '/assets'
const OFFICIAL_NPM_SERVER = 'https://registry.npmjs.org'

/**
 * 资源安装、管理服务。
 * @class AssetsService
 */
class AssetsService {
  constructor ({
    app,
    logger,
    concatRoot,
    storage,
    npmServer
  }) {
    this.packageStorage = storage
    this.npmServer = npmServer
    this.logger = logger
    this.app = app
    this.concatRoot = concatRoot
    this.packageListCache = {}
  }

  async initRoute (router) {
    if (!fs.existsSync(this.packageStorage)) {
      await fs.mkdirSync(`${this.packageStorage}`)
    }
    if (!fs.existsSync(`${this.packageStorage}/fs-concat`)) {
      await fs.mkdirSync(`${this.packageStorage}/fs-concat`)
    }
    // 获取npm版本包的信息
    router.get(ASSETS_PREFIX + '/pkg/info', async (ctx, next) => {
      const { name, version, app } = ctx.query

      ctx.body = await this.getModuleVersionMeta(name, version, app)
      await next()
    })

    // 批量下载多个文件
    router.post(ASSETS_PREFIX + '/concat', async (ctx, next) => {
      const { files } = ctx.request.body
      const id = hash(files)

      const fullFilePath = files.map(file => `${this.concatRoot}/apps/${file}`)

      console.log(fullFilePath)
      concat(fullFilePath, `${this.packageStorage}/fs-concat/${id}.js`)

      ctx.body = {
        concatPath: `/fs-concat/${id}.js`
      }
      await next()
      // ctx.response.redirect(`/fs-concat/${id}.js`);
    })

    // 获取npm版本包的信息
    router.get(ASSETS_PREFIX + '/package/fc/list', async (ctx, next) => {
      const { name, app, version, project } = ctx.query

      ctx.body = await this.getPackagePels(app, project, name, version)
      await next()
    })

    // 安装包到指定路径
    router.get(ASSETS_PREFIX + '/install', async (ctx, next) => {
      const { name, version, app, project, tag, path: packagePath } = ctx.query

      if (packagePath) {
        ctx.body = await this.installPackageTo(name, version, packagePath)
      } else {
        ctx.body = await this.installPackage(name, version || tag, app, project)
      }

      await next()
    })

    // 上传文件服务
    router.post(ASSETS_PREFIX + '/file/upload', async (ctx, next) => {
      const { name, app, filePath } = ctx.query

      const file = ctx.request.files.file

      ctx.body = await this.uploadFile(app, name, filePath, file)
      await next()
    })

    // 删除一个本地NPM包
    router.delete(ASSETS_PREFIX + '/:name+', async (ctx, next) => {
      const { name } = ctx.params

      ctx.body = await this.removePackage(name, ctx.request.query.app, ctx.request.query.project)
      await next()
    })
  }

  /**
     * 使用 verdaccio 服务器提供的按名称搜索npm包方法，返回包列表
     * @param {String} name 包名称
     */
  async searchPackageByName (name) {
    const response = await axios.get(this.npmServer + '/-/verdaccio/search/' + name)

    return response.data
  }

  async ftSearchPackages (query) {
    const response = await axios.get(OFFICIAL_NPM_SERVER + '/search?q=' + query)

    return response.data
  }

  /**
     * 获取指定模块的的版本信息
     * @param {String} name 模块名称
     * @param {String} [version] 对应模块版本，空值表示获得最新的版本
     * @returns {Object} 版本信息， 如果未找到模块则返回 null
     */
  async getModuleVersionMeta (name, version, app) {
    try {
      if (!name) {
        throw new BadRequestError()
      }

      let pkgFolder = path.resolve(this.packageStorage, name)

      if (app) {
        pkgFolder = path.resolve(await this.appService.getPackageStorage(app), name)
      }
      let pkgData = null

      // 直接获取本地的package.json
      if (fs.existsSync(pkgFolder + '/package.json')) {
        pkgData = JSON.parse(fs.readFileSync(pkgFolder + '/package.json', 'utf8'))
        // pkgData = await fs.readJson(pkgFolder + '/package.json');
      } else {
        try {
          // 未找到则调用私服获取
          const moduleMeta = await axios.get(this.npmServer + '/' + name)

          pkgData = moduleMeta.data
        } catch (e) {
          throw new ServiceUnavailableError('请确保资源中心端服务可访问')
        }
      }

      // 未提供版本号则直接下载最新版本
      const npmversion = version || pkgData['dist-tags'].latest

      this.logger && this.logger.debug('version:', npmversion)

      // 获取对应版本的数据
      const versionData = pkgData.versions[npmversion]

      if (!versionData) {
        throw new NotFoundError('指定版本未找到')
      }
      return {
        module: pkgData,
        versionData
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        this.logger && this.logger.error('npm package not found name=%s version=%s', name, version)
        return null
      } else {
        throw err
      }
    }
  }

  /**
     * Node 8 方法,递归创建目录
     * @param {*} dirname
     * @returns
     */
  mkdirsSync (dirname) {
    if (fs.existsSync(dirname)) {
      return true
    } else {
      if (this.mkdirsSync(path.dirname(dirname))) {
        fs.mkdirSync(dirname)
        return true
      }
    }
  }

  /**
   * 从npm服务器获取资源包，将资源包下载到本地同时更新资源包库信息
   * @param name 组件包名称
   * @param version 版本或标签号
   * @param app 安装所属的应用
   * @param project 安装所属项目
   */
  async installPackage (name, version, app, project) {
    if (!name) {
      throw new BadRequestError('package name must be provided')
    }

    const distPath = await this.getPackageStoragePath(app, project)

    delete this.packageListCache[distPath]

    return this.installPackageTo(name, version, distPath + '/' + name)
  }

  /**
     * 安装资源包到指定路径
     * @param {*} packageName 资源包名称
     * @param {*} packageVersion 资源包版本或Tag号
     * @param {*} distPath 目标路径
     */
  async installPackageTo (packageName, packageVersion, distPath) {
    if (!this.npmServer) {
      throw new HttpError(1005021, 'NPM服务地址未配置')
    }

    let packageInfo = null

    // 获取组件包信息
    try {
      packageInfo = (await axios.get(this.npmServer + '/' + packageName)).data

      if (packageInfo.error) {
        throw new BadRequestError('组件包未找到:' + this.npmServer + '/' + packageName)
      }
    } catch (e) {
      console.log(e)
      throw new BadRequestError('组件包未找到:' + this.npmServer + '/' + packageName)
    }

    let useVersion = packageVersion

    if (useVersion == null) { // 为空： 使用latest tag
      useVersion = packageInfo['dist-tags'].latest
    } else if (packageInfo['dist-tags'][useVersion]) { // 否则从tag中先查找
      useVersion = packageInfo['dist-tags'][useVersion]
    }

    if (!useVersion || !packageInfo.versions[useVersion]) {
      throw new BadRequestError('组件包的应用版本未找到:' + packageName + '@' + packageVersion)
    }

    this.logger && this.logger.debug(`fetch with query name=${packageName}, version=${packageVersion}`)

    // 清空既有目录
    fs.rmdirSync(distPath, {
      recursive: true
    })

    this.mkdirsSync(distPath)

    await download(packageInfo.versions[useVersion].dist.tarball, distPath, {
      filename: 'package.tgz'
    })

    let extractFiles = null

    // 判断是否是外部模块， 外部模块要排除多余的文件，只使用声明的文件
    const externalModules = webpackExternals.externals.filter(ex => ex.module.startsWith(packageName))

    const getDistPath = dist => {
      const splite = dist.split('/')

      if (splite[0].startsWith('@')) {
        splite.splice(0, 2)
      } else {
        splite.splice(0, 1)
      }

      return splite.join('/')
    }

    if (externalModules.length) {
      extractFiles = []
      extractFiles.push('package/package.json')
      for (const externalModule of externalModules) {
        if (externalModule.dist) {
          extractFiles.push('package/' + getDistPath(externalModule.dist))
        }
        if (externalModule.style) {
          if (typeof externalModule.style === 'string') {
            extractFiles.push('package/' + getDistPath(externalModule.style))
          }
        }
      }
    }

    await tar.extract({
      file: `${distPath}/package.tgz`,
      cwd: distPath
    }, extractFiles)

    // 删除文件
    await fs.unlinkSync(`${distPath}/package.tgz`)

    const fileNames = await fs.readdirSync(`${distPath}/package`)

    fileNames.forEach(async function (fileName) {
      await fs.renameSync(`${distPath}/package/${fileName}`, `${distPath}/${fileName}`)
    })

    return {
      installedPackage: {
        packageName,
        version: useVersion
      }
    }
  }

  /**
     * 获取指定路径下安装的组件包列表
     * @param {string} distPath 指定路径
     * @returns {Array} 组件包列表
     */
  async getInstalledPackages (distPath) {
    const pkgPath = distPath || this.packageStorage

    if (!fs.existsSync(pkgPath)) {
      return []
    }
    if (!this.packageListCache[pkgPath]) {
      const fileNames = await fs.readdirSync(pkgPath)
      const packages = []

      for (const folder of fileNames) {
        if (folder.startsWith('@')) { // 在域内的包，要再深入一级获取信息
          delete this.packageListCache[pkgPath + '/' + folder]
          packages.push(...(await this.getInstalledPackages(`${pkgPath}/${folder}`)))
        } else {
          const packageInfo = await this.getPackageInfo(`${pkgPath}/${folder}`)

          if (packageInfo) {
            const fcpList = await this.getPackageFcpList(`${pkgPath}/${folder}`)

            packageInfo.fcps = fcpList
            packages.push(packageInfo)
          }
        }
      }
      this.packageListCache[pkgPath] = packages
    }
    return this.packageListCache[pkgPath]
  }

  /**
     * 获取指定包下的图元列表 (规则：以 .fcp.js结尾)
     * @param {*} packagePath
     */
  async getPackageFcpList (packagePath) {
    if (!fs.existsSync(packagePath + '/build')) {
      return null
    } else {
      return fs.readdirSync(packagePath + '/build').filter(fname => fname.endsWith('.fcp.js'))
    }
  }

  async getPackageInfo (folder) {
    try {
      return JSON.parse(fs.readFileSync(`${folder}/package.json`))
    } catch (e) {
      return null
    }
  }

  /**
     * 判断组件包是否已经在产品安装
     * @param {*} app
     * @param {*} packageName
     * @returns
     */
  async isAppInstallled (app, appVersion, packageName) {
    const appInstalled = await this.appService.getAppInstalled(app, appVersion)
    const allPackageNames = appInstalled.gw.map(pkg => pkg.name)

    return allPackageNames.indexOf(packageName) > -1
  }

  async uploadFile (app, name, filePath, file) {
    let pkgFolder = path.resolve(this.packageStorage, name)

    if (app) {
      pkgFolder = path.resolve(await this.appService.getPackageStorage(app), name)
    }

    const targetPath = path.join(pkgFolder, filePath)

    await fs.copyFileSync(file.path, targetPath)

    return {
      targetPath
    }
  }

  async getPackagePels (app, project, name, version) {
    const destPath = await this.getPackageStoragePath(app, project)
    const buildPath = destPath + '/' + name + '/build'

    if (!fs.existsSync(buildPath)) {
      return {
        list: []
      }
    } else {
      return {
        list: fs.readdirSync(buildPath).filter(fname => fname.endsWith('.fcp.js'))
      }
    }
  }

  /**
     * 删除本地资源模块
     * @param {String} name 模块名称
     */
  async removePackage (name, app, project) {
    const distPath = await this.getPackageStoragePath(app, project)

    delete this.packageListCache[distPath]
    const pkgFolder = distPath + '/' + name

    debug('Remove Package', pkgFolder)

    if (fs.existsSync(pkgFolder)) {
      fs.rmdirSync(pkgFolder, {
        recursive: true
      })
      return {
        deleted: pkgFolder
      }
    } else {
      return {
        deleted: ''
      }
    }
  }

  /**
     * 获取组件包的安装目录 (npm_packages) 提供应用和项目目录转换支持
     * @param {*} app 应用名称
     * @param {*} project 项目id
     * @returns {string} 目录位置
     */
  async getPackageStoragePath (app, project) {
    let packageStoragePath = this.packageStorage

    if (app && project) {
      const { projectService } = this.app.services

      packageStoragePath = await projectService.getProjectFilePath(app, project) + '/npm_packages'
    } else if (app) {
      const { appService } = this.app.services

      packageStoragePath = await appService.getPackageStorage(app)
    }
    return packageStoragePath
  }
}

module.exports = AssetsService
