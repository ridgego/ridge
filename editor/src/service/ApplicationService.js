import NeCollection from './NeCollection.js'
const { nanoid } = require('../utils/string')

export default class ApplicationService {
  constructor () {
    this.collection = new NeCollection('ridge.app.db')
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

  async getRecentPage () {
    // 首先更新页面目录数据
    const pages = await this.collection.find({
      parent: -1,
      type: 'page'
    }, {
      sort: {
        name: 1
      }
    })
    if (pages.length === 0) {
      return this.createNewPage(-1)
    } else {
      return pages[0]
    }
  }

  async createNewFolder (parent) {
    let n = 1
    while (await this.collection.findOne({
      parent,
      name: '文件夹' + n
    })) {
      n++
    }
    const folderObject = {
      parent,
      id: nanoid(10),
      name: '文件夹' + n,
      type: 'folder'
    }
    await this.collection.insert(folderObject)
  }

  async createNewPage (parentId) {
    let n = 1
    while (await this.collection.findOne({
      parent: parentId,
      name: '页面' + n
    })) {
      n++
    }
    const pageObject = {
      id: nanoid(10),
      title: '页面' + n,
      type: 'page',
      parent: parentId,
      properties: {
        type: 'fixed',
        width: 800,
        height: 600
      },
      variables: [],
      elements: []
    }
    await this.collection.insert(pageObject)
  }

  /**
   * 保存一个页面配置
   */
  async saveUpdatePage (pageObject) {
    if (await this.collection.findOne({ id: pageObject.id })) {
      return await this.collection.update({ id: pageObject.id }, pageObject)
    } else {
      return await this.collection.insert(pageObject)
    }
  }

  async rename (id, newName) {
    const existed = await this.collection.findOne(id)
    if (!existed) {
      return false
    }

    const nameDuplicated = await this.collection.findOne({
      parent: existed.parent,
      name: newName
    })

    if (nameDuplicated) {
      return false
    }

    await this.collection.patch(id, {
      name: newName
    })
  }

  deletePage (pageId) {
  }

  saveAppResource (appName, pid, object) {}

  listAppResource (appName) {}
}
