
export default class PackageManager {
  constructor () {
    /** @property 组件加载器 */
    this.packageNames = ['ridge-antd', 'ridge-basic', 'ridge-container']
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

    // Check & Load Debug Pacakge.json
    const debugPkg = await window.Ridge.loader.getDebugPackage()
    if (debugPkg) {
      packagesLoading.push(await window.Ridge.loader.getPackageJSON(debugPkg.name))
    }

    // Load Package
    for (const pkname of this.packageNames) {
      packagesLoading.push(await window.Ridge.loader.getPackageJSON(pkname))
    }

    await Promise.allSettled(packagesLoading)
    this.packagesDetails = packagesLoading.filter(n => n != null)

    return this.packagesDetails
  }
}
