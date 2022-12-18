const basicStoreRoot = '../../public'
const Boostrap = require('ridge-boot') // 启动器
const bootApp = new Boostrap(Object.assign({
  api: '/api',
  port: 4977,
  // npm 全局资源服务器地址，非研发环境无法访问。应用内的资源安装时使用
  npmServer: 'http://10.12.7.250:8081/repository/npm-group',
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
  isRepo: true
}, {
  // 组件包请按次序放置，一些依赖是要求次序的
  packages: [require('ridge-http'), require('ridge-npm-service')]
}))

bootApp.start()
