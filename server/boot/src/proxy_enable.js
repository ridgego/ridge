const httpProxy = require('http-proxy')
const parser = require('co-body')
const queryString = require('querystring')
const createPathRewriter = require('./path_rewriter.js')
const debug = require('debug')('wind:proxy')
/**
     * 复制支持proxy反向代理功能，需要设置 config.proxy
     * @returns http.RequestListener 端口监听处理函数
     */
const getProxyEnabledCallback = app => {
  const proxyPaths = Object.keys(app.config.proxy || {})// 代理的路径列表

  // 未设置proxy则直接取koa的默认callback (暂时去除，在支持动态的情况下这个判断就无意义了)
  // if (proxyPaths.length === 0) {
  //     return this.app.callback();
  // }

  // 提供增加代理配置方法，支持动态增加代理
  app.applyProxy = (proxyConfig, prefix) => {
    try {
      const clonedConfig = JSON.parse(JSON.stringify(proxyConfig))

      for (const proxyPath of Object.keys(clonedConfig)) {
        debug(`ProxyPath=${proxyPath} -To Target=${clonedConfig[proxyPath].target}`)
        if (clonedConfig[proxyPath].pathRewrite) {
          clonedConfig[proxyPath].pathRewriter = createPathRewriter(clonedConfig[proxyPath].pathRewrite)
        }
      }
      Object.assign(app.dynamicProxies, clonedConfig)
    } catch (e) {
      debug('Apply Proxy Error', proxyConfig, e)
    }
  }

  for (const proxyPath of proxyPaths) {
    if (app.config.proxy[proxyPath].pathRewrite) {
      app.config.proxy[proxyPath].pathRewriter = createPathRewriter(app.config.proxy[proxyPath].pathRewrite)
    }
  }

  // rewrite path
  const applyPathRewrite = (req, pathRewriter) => {
    if (pathRewriter) {
      const path = pathRewriter(req.url, req)

      if (typeof path === 'string') {
        req.url = path
      } else {
        debug('[HPM] pathRewrite: No rewritten path found. (%s)', req.url)
      }
    }
  }
  const proxy = httpProxy.createProxyServer(Object.assign({
    changeOrigin: true
  }, app.config.proxyServer || {}))

  // 暴露proxy供应用进一步配置
  app.proxy = proxy

  // 处理响应头，欺骗浏览器服务是允许CORS的
  const enableCors = function (req, res) {
    if (req.headers['access-control-request-method']) {
      res.setHeader('access-control-allow-methods', req.headers['access-control-request-method'])
    }

    if (req.headers['access-control-request-headers']) {
      res.setHeader('access-control-allow-headers', req.headers['access-control-request-headers'])
    }

    if (req.headers.origin) {
      res.setHeader('access-control-allow-origin', req.headers.origin)
      res.setHeader('access-control-allow-credentials', 'true')
    }
  }

  const onProxyError = (errorInfo, req, response, target) => {
    // 必须处理 否则代理出错 整个node就退了
    response.writeHead(500, {
      'Content-Type': 'text/plain'
    })
    response.end(errorInfo.message, 'Something went wrong. And we are reporting a custom error message.')
  }

  // 带有proxy处理的callback
  const callback = (req, res) => {
    const path = req.url

    // You can define here your custom logic to handle the request
    // and then proxy the request.
    if (req.method === 'OPTIONS') {
      enableCors(req, res)
      res.writeHead(200)
      res.end()
      return
    }

    const proxyConfig = Object.assign({}, app.config.proxy, app.dynamicProxies)

    // 首先处理proxy路由，如果是api代理 则使用代理，不进koa
    for (const proxyPath of Object.keys(proxyConfig)) {
      // 非 / 开头的代理位置暂时忽略不处理
      if (proxyPath === '' || proxyPath === '/' || !proxyPath.startsWith('/')) {
        continue
      }
      if (path.startsWith(proxyPath)) { // 此处判断只按 startWith方式， 未来考虑使用正则等方式增加功能
        const originalUrl = req.url

        // ws的代理则不用web方式后续处理了， 在on('upgrade')后续代理ws
        if (proxyConfig[proxyPath].ws) {
          return
        }

        // 为https代理进行加密相关处理
        if (typeof proxyConfig[proxyPath].target === 'string' && proxyConfig[proxyPath].target.startsWith('https')) {
          proxyConfig[proxyPath].secure = false
        }

        // 增加路径重写处理
        if (proxyConfig[proxyPath].pathRewriter) {
          applyPathRewrite(req, proxyConfig[proxyPath].pathRewriter)
        }
        debug('Proxy: ' + originalUrl + '-->' + proxyConfig[proxyPath].target + req.url, proxyConfig[proxyPath])

        // 这里是scada需要的属性， 可以对代理
        if (proxyConfig[proxyPath].writeLog || proxyConfig[proxyPath].bodyLog) {
          req.ctx = app.createContext(req, res)
          // 传递ctx到proxy后续处理之中
          // 这里解析请求体到req.body， 供其他回调场合使用
          parser(req).then(body => {
            req.body = body
            proxy.web(req, res, proxyConfig[proxyPath], onProxyError)
            enableCors(req, res)
          })
        } else {
          try {
            proxy.web(req, res, Object.assign({}, proxyConfig[proxyPath]), onProxyError)
            enableCors(req, res)
          } catch (e) {
            res.write('fail')
          }
        }
        // 包含此路径则后续交给proxy，不进koa处理
        return
      }
    }
    // 非proxy路径照旧进入koa callback
    app.callback()(req, res)
  }

  // 对ws连接进行代理
  proxy.on('upgrade', function (req, socket, head) {
    proxy.ws(req, socket, head)
  })
  proxy.on('proxyReq', function (proxyReq, req) {
    // 如果路径处理过body，则需要重新生成req。
    if (req.body) {
      const contentType = proxyReq.getHeader('Content-Type')
      let bodyData

      if (contentType === 'application/json') {
        bodyData = JSON.stringify(req.body)
      }

      if (contentType.indexOf('application/x-www-form-urlencoded') >= 0) {
        bodyData = queryString.stringify(req.body)
      }

      if (bodyData) {
        debug('Body', bodyData)
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
        proxyReq.write(bodyData)
      }
    }
  })

  return callback
}

module.exports = {
  prepareBoot (app) {
    // 动态的代理配置路径列表， 应用可以修改
    app.createPathRewriter = createPathRewriter
    app.dynamicProxies = {}
    app.proxyEnabledCallback = getProxyEnabledCallback(app)
  }
}
