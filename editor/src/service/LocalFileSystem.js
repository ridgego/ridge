import NeCollection from './NeCollection.js'
import Localforge from 'localforage'
const { nanoid } = require('../utils/string')

export default class LocalFileSystem {
  constructor () {
    this.collection = new NeCollection('ridge.app.db')
    this.store = Localforge.createInstance({ name: 'ridge-store' })
  }

  /**
   * 新增文件
   * @param {*} file
   * @param {*} dir
   * @returns
   */
   async createFile (path, blob, mimeType) {
    const id = nanoid(10)
    const dataUrl = await blobToDataUrl(blob)

    await this.store.setItem(id, dataUrl)
    await this.collection.insert({
      id,
      mimeType: blob.type || mimeType,
      size: blob.size,
      name: await this.getNewFileName(parentId, blob.name || name, n => `(${n})`),
      parent: parentId
    })
    return true
  }
}