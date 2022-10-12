
export default class PackageManager {
  constructor (loader) {
    /** @property 组件加载器 */
    this.loader = loader
    this.packageNames = ['ridge-basic', 'ridge-antd', 'ridge-bizchart']
    this.packagesDetails = []
  }

  async getBuildInPackages () {
    if (!this.packagesDetails.length) {
      await this.loadPackages()
    }
    return this.packagesDetails
  }

  async loadPackageComponents (packageName) {
    const packageJSONObject = this.loader.getPackageJSON(packageName)
  }

  async loadPackages () {
    const packagesLoading = []
    for (const pkname of this.packageNames) {
      packagesLoading.push(await this.loader.getPackageJSON(pkname))
    }
    await Promise.allSettled(packagesLoading)
    this.packagesDetails = packagesLoading.filter(n => n != null)

    return this.packagesDetails
  }
}
