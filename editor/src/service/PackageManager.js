import { ridge } from './RidgeEditService'

export default class PackageManager {
  constructor () {
    /** @property 组件加载器 */
    this.packageNames = ['ridge-basic', 'ridge-container', 'ridge-bootstrap', 'ridge-bulma', 'ridge-echarts']
    this.packagesDetails = []
  }

  async getBuildInPackages () {
    if (!this.packagesDetails.length) {
      await this.loadPackages()
    }
    return this.packagesDetails
  }

  async loadPackages () {
    const packagesLoading = []

    // Load Package
    for (const pkname of this.packageNames) {
      packagesLoading.push(await ridge.loader.getPackageJSON(pkname))
    }

    await Promise.allSettled(packagesLoading)
    this.packagesDetails = packagesLoading.filter(n => n != null)

    return this.packagesDetails
  }
}
