import { nanoid } from '../utils/string'

export default class PackageManager {
  constructor (loader) {
    /** @property 组件加载器 */
    this.loader = loader
    this.packageNames = ['ridge-antd', 'ridge-basic', 'ridge-bizchart']
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
    for (const pkname of this.packageNames) {
      packagesLoading.push(await this.loader.getPackageJSON(pkname))
    }
    await Promise.allSettled(packagesLoading)
    this.packagesDetails = packagesLoading.filter(n => n != null)

    return this.packagesDetails
  }
}
