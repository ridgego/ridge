const index = require('../ridge-runtime/src/utils/externals')
const path = require('path')
const download = require('download')

/**
 * 执行将所有external的发布js文件按unpkg服务的形式保存到本地目录中， 以方便发布时第三方系统直接拷贝你用
 * @param servicePath
 * @param dist
 * @returns {Promise<void>}
 */
async function exportToLocal (servicePath, dist) {
  for (const lib of index.externals) {
    try {
      let moduleFolder = ''
      if (lib.dist.lastIndexOf('/') > -1) {
        moduleFolder = lib.dist.substring(0, lib.dist.lastIndexOf('/'))
      }
      await download(
        `${servicePath}/${lib.module}@latest/${lib.dist}`,
        path.resolve(dist, `./${lib.module}@latest`, moduleFolder)
      )
    } catch (e) {
      console.log(e)
    }
  }
}

exportToLocal('http://10.10.247.1:4877/api/unpkg', './unpkg')
