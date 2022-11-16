import { nanoid } from '../utils/string'

export default class PackageManager {
  constructor () {
    /** @property 组件加载器 */
    this.packageNames = ['ridge-antd', 'ridge-basic']
    this.packagesDetails = []
  }

  async getBuildInPackages () {
    if (!this.packagesDetails.length) {
      await this.loadPackages()
    }
    return this.packagesDetails
  }

  generateComponent ({
    packageName,
    width,
    height,
    path
  }) {
    return {
      id: nanoid(),
      component: {
        packageName,
        path
      },
      props: {

      },
      style: {
        position: 'absolute',
        width: width + 'px',
        height: height + 'px'
      }
    }
  }

  async loadPackages () {
    const packagesLoading = []
    const debugPkg = await window.Ridge.loader.getDebugPackage()
    if (debugPkg) {
      packagesLoading.push(await window.Ridge.loader.getPackageJSON(debugPkg.name))
    }
    for (const pkname of this.packageNames) {
      packagesLoading.push(await window.Ridge.loader.getPackageJSON(pkname))
    }

    await Promise.allSettled(packagesLoading)
    this.packagesDetails = packagesLoading.filter(n => n != null)

    return this.packagesDetails
  }
}