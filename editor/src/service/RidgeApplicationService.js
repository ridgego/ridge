import localforage from 'localforage'

export default class RidgeApplicationService {
  constructor () {
    localforage.config({
      baseStore: localforage.INDEXEDDB
    })
    this.baseStore = localforage.createInstance({
      name: 'base'
    })
    this.resourceStore = localforage.createInstance({
      name: 'resources'
    })
    this.pageStore = localforage.createInstance({
      name: 'images'
    })
  }

  async addImage (name, blob) {
    await this.resourceStore.setItem(name, blob)
  }

  async getImages () {
    const keys = await this.resourceStore.keys()
    const result = []
    for (const key of keys) {
      result.push({
        name: key,
        src: URL.createObjectURL(await this.resourceStore.getItem(key))
      })
    }
    return result
  }

  listApps () {}

  deleteApp (appName) {}

  updateAppObject (appObject) {}

  saveUpdatePage (pageObject) {}

  listPage (appName) {}

  deletePage (pageId) {}

  saveAppResource (appName, pid, object) {}

  listAppResource (appName) {}
}
