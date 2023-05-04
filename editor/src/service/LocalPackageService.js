import ky from 'ky'

export default class LocalPackageService {
  constructor (repoUrl, fs) {
    this.repoUrl = repoUrl
    this.fs = fs
  }

  async installPackage (name) {
    const { fs } = this
    const packageJSONObject = await ky.get(`${this.repoUrl}/${name}/package.json`)

    if (packageJSONObject) {
      await fs.ensureDirSync(`/packages/${name}`)
    }

    for (const file of packageJSONObject.files) {
      await ky.get(`${this.repoUrl}/${name}/${file}`).text()
    }
  }

  listPackages () {

  }
}
