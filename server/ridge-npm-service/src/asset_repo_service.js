/*
* @Description: 资源管理中心端服务，提供中心端资源列表、信息、查询等服务
*/
const { BadRequestError } = require('ridge-http')
const axios = require('axios')
const cron = require('node-cron')
const debug = require('debug')('apollo:asset-repo')
const OFFICIAL_NPM_SERVER = 'https://registry.npmjs.org'
const REPO_PREFIX = '/repo'

module.exports = class ApplicationRepoService {
  constructor (app) {
    this.npmServer = app.config.npmServer || OFFICIAL_NPM_SERVER
    this.app = app
  }

  async init () {
    this.repo = await this.app.getDb('repo')

    cron.schedule('*/5 * * * *', () => {
      debug('running a task every two minutes')
      try {
        this.pullAllAssets()
      } catch (e) {
        console.log(e)
      }
    })
  }

  async initRoute (router) {
    await this.init()

    router.post(`${REPO_PREFIX}/register`, async (ctx, next) => {
      ctx.body = await this.pullAsset(ctx.request.body)
      await next()
    })

    router.post(`${REPO_PREFIX}/unregister`, async (ctx, next) => {
      ctx.body = await this.unRegisterAsset(ctx.request.body)

      await next()
    })

    router.get(`${REPO_PREFIX}/pull/all`, async (ctx, next) => {
      ctx.body = await this.pullAllAssets()

      await next()
    })

    router.get(`${REPO_PREFIX}/list`, async (ctx, next) => {
      ctx.body = await this.listAllAssets()
      await next()
    })

    router.get(`${REPO_PREFIX}/list/:type/:tag`, async (ctx, next) => {
      const { type, tag } = ctx.request.params

      ctx.body = await this.getPackageListByTypeTag(type, tag)
      await next()
    })

    router.get(`${REPO_PREFIX}/list/:type`, async (ctx, next) => {
      const { type } = ctx.request.params

      ctx.body = await this.getPackageListByType(type)
      await next()
    })

    router.get(`${REPO_PREFIX}/versions`, async (ctx, next) => {
      const { name, tag } = ctx.request.query

      ctx.body = await this.getPackageVersions(name, tag)
      await next()
    })
  }

  async getPackageVersions (name, tag) {
    // 获取整体的NPM包信息
    const packageInfo = (await axios.get(this.npmServer + '/' + name)).data

    return packageInfo
  }

  async getPackageListByType (type) {
    const assetTagsColl = this.repo.getCollection('asset-tags')

    const targets = await assetTagsColl.find({
      type
    })

    return targets
  }

  async getPackageListByTypeTag (type, tag) {
    const assetTagsColl = this.repo.getCollection('asset-tags')

    const targets = await assetTagsColl.find({
      type,
      tag
    })

    return targets
  }

  async sceduleUpdateAllVersions () {
    const assetsColl = this.repo.getCollection('assets')
    // 更新所有资源的版本情况
    const allAssets = await assetsColl.find()

    for (const asset of allAssets) {
      await this.pullAsset({
        name: asset.name,
        type: asset.type
      })
    }
  }

  async listAllAssets () {
    const assetsColl = this.repo.getCollection('assets')
    // 更新所有资源的版本情况
    const allAssets = await assetsColl.find()

    return {
      packages: allAssets
    }
  }

  async pullAllAssets () {
    const assets = await this.listAllAssets()
    const result = {}

    for (const pkg of assets.packages) {
      result[pkg.name] = await this.pullAsset(pkg)
    }

    return result
  }

  async unRegisterAsset ({ name }) {
    if (!name) {
      throw new BadRequestError('Package name must be provided')
    }

    const assetTagsColl = this.repo.getCollection('asset-tags')

    // 删除现有的所有tag数据
    const tagsRemoved = await assetTagsColl.remove({
      name
    })

    const assetsColl = this.repo.getCollection('assets')
    // 检查是否是新增的包
    const assetRemoved = await assetsColl.remove({
      name
    })

    return {
      tagsRemoved,
      assetRemoved
    }
  }

  /**
     * 注册登记新的资源及版本信息
     * @returns
     */
  async pullAsset ({ name, type }) {
    if (!name) {
      throw new BadRequestError('Package name must be provided')
    }

    // 获取整体的NPM包信息
    const packageInfo = (await axios.get(this.npmServer + '/' + name)).data

    if (packageInfo.error) {
      throw new BadRequestError('Package Not Found:' + this.npmServer + '/' + name)
    }
    const tags = packageInfo['dist-tags']
    const assetTagsColl = this.repo.getCollection('asset-tags')

    // 删除现有的所有tag数据
    await assetTagsColl.remove({
      name
    })

    // 插入最新的tag数据
    for (const key in tags) {
      const versionData = packageInfo.versions[tags[key]]

      await assetTagsColl.insert({
        name,
        type,
        tag: key,
        version: versionData.version,
        description: versionData.description,
        snapshot: versionData.snapshot,
        license: versionData.license,
        icon: versionData.icon,
        publish_time: new Date(versionData.publish_time),
        components: versionData.components
      })
    }

    const assetsColl = this.repo.getCollection('assets')
    // 检查是否是新增的包
    const existed = await assetsColl.findOne({
      name
    })

    if (existed) {
      await assetsColl.update({
        name
      }, {
        name,
        type,
        tags
      })
    } else {
      await assetsColl.insert({
        name,
        type,
        tags
      })
    }

    return {
      name,
      type,
      tags
    }
  }
}
