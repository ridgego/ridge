process.env.DEBUG = 'wind:*, apollo:*'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
const path = require('path')
const basicStoreRoot = path.resolve(__dirname, '../../public')
const Boostrap = require('ridge-boot') // 启动器
const bootApp = new Boostrap(Object.assign({
  api: '/api',
  port: 4977,
  npmServer: 'https://registry.npmmirror.com',
  // 文件上传临时保存的目录
  assetsPackageStorage: basicStoreRoot + '/npm_packages',
  nedb: {
    store: basicStoreRoot
  },
  proxy: {},
  // 启用CORS 默认启用
  cors: {
    credentials: true
  },
  // 静态托管地址 默认使用应用的public目录 110版本存储目录及应用部署根目录
  // 静态资源未找到进行的重定向302相关处理
  redirects: [{
    match: /\/[^/]+\/npm_packages/,
    replace: '/npm_packages'
  }, {
    match: /.+\.(svg|jpg|png|gif|bmp)$/,
    url: '/not_found.jpg'
  }],
  cache: {
    persistanceKeys: ''
  },
  isRepo: false
}, {
  // 组件包请按次序放置，一些依赖是要求次序的
  packages: [require('ridge-http'), require('../npm-service/src')]
}))

bootApp.start()
