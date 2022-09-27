const Koa = require('koa')
const http = require('http')
const http2 = require('http2')
const https = require('https')
const process = require('process')
const fs = require('fs')
const proxyEnable = require('./proxy_enable')
const debug = require('debug')('wind:boot')

class BootStrap {
  constructor (config) {
    this.config = Object.assign({
      public: './public', // 静态资源托管
      api: '/api',
      packages: [] // 模块列表，按序启动
    }, config)
  }

  async start () {
    const app = new Koa()

    this.app = app

    // 设置booter到app
    app.booter = this

    app.config = this.config

    app.services = app.context.services = {}
    if (this.config.packages) {
      app.packages = app.context.packages = this.config.packages.filter(packageModule => !packageModule.disabled)
      delete this.config.packages
    }

    debug('config %O', this.config)

    // 增加代理系统模块，默认打开，可以通过config.disableProxy=true关闭
    if (!this.config.disableProxy) {
      app.packages = [proxyEnable].concat(app.packages)
    }

    // 冻结配置， 后续拒绝修改
    Object.freeze(this.config)

    // 预启动 加载系统模块
    await this.parepareBoot()

    // 复制支持proxy反向代理功能，需要设置 config.proxy
    const callback = app.proxyEnabledCallback || app.callback()

    listened = initServer(app, this.config, callback)

    // 加载所有模块、初始化服务实例、调用模块created方法
    await this.packagesCreated()

    // 服务依赖的自动注入 使用_service方式
    await this.initPackageService()

    // 调用模块的ready方法
    await this.packagesReady()

    // 启动收尾，供系统级应用做最后的绑定
    await this.bootComplete()

    const bootFailed = app.packages.filter(p => p.err)

    if (bootFailed.length) {
      debug('以下模块启动失败')
      for (const packageModule of bootFailed) {
        debug(`${packageModule.description || ''}[${packageModule.name}]`)
      }
    }

    debug('√ boot complete')

    if (!listened) {
      debug('× No http or https port listening, server exited')
      debug('-> Add config.port or config.httpsPort to start http service')
    }

    process.on('exit', (code, e) => {
      debug('Process Exit  code = ', code)
      this.processExit()
      process.exit()
    })
    process.on('SIGINT', code => {
      debug('Process Exit on Pm2 SIGINT ', code)
      this.processExit()
      process.exit()
    })
  }

  async stop () {
    debug('stopping server')
    if (this.app.proxy) {
      this.app.proxy.close()
    }
    if (this.app.httpServer) {
      this.app.httpServer.close()
      debug('httpServer stopped')
    }
    if (this.app.httpsServer) {
      this.app.httpsServer.close()
      debug('httpServer stopped')
    }
  }

  async restart () {
    debug('stoppin server')
    this.httpServer.close(async err => {
      debug('listing port stopped')
      if (err) {
        debug('error:')
        debug(err)
      }
      debug('restarting .......')
      await this.start()
    })
  }

  /**
     * 系统启动前动作
     */
  async parepareBoot () {
    for (let i = 0; i < this.app.packages.length; i++) {
      const packageModule = this.app.packages[i]

      if (packageModule.prepareBoot) {
        debug(`System Prepare Boot: ${packageModule.description || packageModule.name}[${packageModule.name}]..`)
        try {
          await packageModule.prepareBoot(this.app)
        } catch (e) {
          debug(`module Prepare fail: ${packageModule.name}`)
          debug('error %O', e)
          packageModule.err = e
          continue
        }
      }
    }
  }

  /**
     * 模块进行依次加载并依次调用模块的created方法，
     * created方法主要是工作是系统类模块进行koa插件注册、业务模块进行对外服务初始化并挂载到app上
     * @return {Promise<void>}
     **/
  async packagesCreated () {
    for (let i = 0; i < this.app.packages.length; i++) {
      const packageModule = this.app.packages[i]

      delete packageModule.err
      debug(`preparing module ${packageModule.description || ''}[${packageModule.name}]..`)
      if (packageModule.created) {
        try {
          await packageModule.created(this.app)
        } catch (e) {
          debug(`module created fail: ${packageModule.name}`)
          debug('error %O', e)
          packageModule.err = e
          continue
        }
      }
    }
  }

  /**
     * 进行服务的自动发现、注册
     * 规则就是按名称进行匹配 _不进行注入
     * @return {Promise<void>}
     */
  async initPackageService () {
    const services = this.app.services

    for (const serviceName of Object.keys(services)) {
      // service list
      try {
        const constructorDefinedRefs = Object.getOwnPropertyNames(services[serviceName])

        debug('service ' + serviceName + ':' + (typeof constructorDefinedRefs))
        // 枚举所有属性
        for (const refName of constructorDefinedRefs) {
          // inject service by name
          if (!refName.startsWith('_') && // 按照 _serviceName 进行匹配，满足的就自动注入
                services[serviceName][refName] == null) {
            services[serviceName][refName] = services[refName]
          }
        }
      } catch (e) {
        //
      }
    }
  }

  /**
     * 模块初始化相关处理
     * @return {Promise<void>}
     */
  async packagesReady () {
    // 按模块添加次序顺讯运行
    for (let i = 0; i < this.app.packages.length; i++) {
      const packageModule = this.app.packages[i]

      // 前面出错的模块不再继续执行
      if (packageModule.err) {
        continue
      }
      try {
        if (packageModule.ready) {
          await packageModule.ready(this.app)
        } else if (typeof packageModule === 'function') {
          await packageModule(this.app)
        }
      } catch (err) {
        // ignore failed module
        debug(`module ${packageModule.name} ready failed:`, err)
        packageModule.err = err
      }
    }
  }

  /**
     * 模块启动完成回调
     * @return {Promise<void>}
     */
  async bootComplete () {
    // 结束时按模块次序反向执行。保证前面的模块最后收尾
    for (let i = this.app.packages.length - 1; i >= 0; i--) {
      const packageModule = this.app.packages[i]

      if (packageModule.err) {
        continue
      }
      try {
        packageModule.bootComplete && await packageModule.bootComplete(this.app)
      } catch (err) {
        // ignore failed module
        debug(`module ${packageModule.name} complete failed:`, err)
        packageModule.err = err
      }
    }
  }

  /**
     * 进程退出
     */
  processExit () {
    // 按模块添加次序顺讯运行
    for (let i = 0; i < this.app.packages.length; i++) {
      const packageModule = this.app.packages[i]

      // 前面出错的模块不再继续执行
      if (packageModule.err) {
        continue
      }
      try {
        packageModule.shutdown && packageModule.shutdown(this.app)
      } catch (err) {
        // 关机执行出错就忽略了
        debug('Shutdown Error', err)
      }
    }
  }

  async loadPackage (packageModule) {
    try {
      if (packageModule.created) {
        await packageModule.created(this.app)
      }
      if (packageModule.ready) {
        packageModule.ready(this.app)
      } else if (typeof packageModule === 'function') {
        packageModule(this.app)
      }
      return 'success'
    } catch (err) {
      // 模块加载失败
      debug(err)
      packageModule.err = err
      return err
    }
  }
}
module.exports = BootStrap

/**
 * @description: 初始化监听端口
 * @param {Map} app
 * @param {Map} config
 * @param {Function} callback
 * @return {boolean} 是否开启成功
 */
function initServer (app, config, callback) {
  let listened = false
  const createServer = config.h2Enable ? http2.createSecureServer : https.createServer

  if (config.tls && config.tls.enable === true) {
    if (config.tls.server && config.tls.server.key && config.tls.server.cert && config.tls.server.ca && config.httpsPort) {
      app.httpsServer = createServer({
        allowHTTP1: true,
        key: fs.readFileSync(config.tls.server.key),
        cert: fs.readFileSync(config.tls.server.cert),
        ca: [fs.readFileSync(config.tls.server.ca)],
        // 使用客户端证书验证
        requestCert: true,
        // 如果没有请求到客户端来自信任CA颁发的证书，拒绝客户端的连接
        rejectUnauthorized: true
      }, callback).listen(config.httpsPort, config.host || '0.0.0.0')
      listened = true
      debug('√ tls listening port: ' + config.httpsPort)
    }
  } else {
    // 声明了port参数，才会启动http服务
    if (config.port) {
      app.httpServer = http.createServer(callback).listen(config.port, config.host || '0.0.0.0')
      listened = true
      debug('√ http listening port: ' + config.port)
    }

    // 声明了httpsPort参数，才会启动https服务
    if (config.httpsPort && config.httpsKey && config.httpsCert) {
      app.httpsServer = createServer({
        allowHTTP1: true,
        key: fs.readFileSync(config.httpsKey),
        cert: fs.readFileSync(config.httpsCert)
      }, callback).listen(config.httpsPort, config.host || '0.0.0.0')
      debug('√ https listening port: ' + config.httpsPort)
      listened = true
    }
  }

  return listened
}
