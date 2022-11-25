process.env.DEBUG = 'wind:*'
const BootStrap = require('./bootstrap')

async function testProxy () {
  const config = {
    port: 8082,
    debug: 'wind:boot',
    proxy: {
      '/portal': {
        target: 'https://10.10.2.67:9090',
        writeLog: true,
        secure: false
      },
      '/api': {
        target: 'http://10.10.247.1:4877',
        pathRewrite: {
          '^/api/old': '/api/new',
          '^/api/remove': '',
          invalid: 'path/new',
          '/valid': '/path/new',
          '/some/specific/path': '/awe/some/specific/path',
          '/some': '/awe/some'
        }

      }
    },
    // httpsPort: 4099,
    httpsKey: './key/server.key',
    httpsCert: './key/server.crt',
    packages: [async app => {
      app.proxy.on('proxyReq', async function (proxyRes, req, res) {
        if (req.ctx) {
          console.log('headers', req.ctx.headers)
          console.log('originalUrl', req.ctx.originalUrl)
          console.log('ip', req.ctx.ip)
          console.log('query', JSON.stringify(req.ctx.query))
          console.log('body', JSON.stringify(req.body))
        }
      })

      app.proxy.on('proxyRes', async function (proxyRes, req, res) {
        if (req.ctx) {
          console.log('headers', req.ctx.headers)
          console.log('originalUrl', req.ctx.originalUrl)
          console.log('ip', req.ctx.ip)
          console.log('query', JSON.stringify(req.ctx.query))
          console.log('body', JSON.stringify(req.body))
        }
      })
    }]
  }
  const boot = new BootStrap(config)

  boot.start()
}

testProxy()
