import NeCollection from './NeCollection.js'

import BackUpService from './BackUpService.js'
import { emit } from './RidgeEditService.js'
import { EVENT_APP_OPEN } from '../constant.js'
const { nanoid } = require('../utils/string')

export default class ApplicationService {
  constructor () {
    this.collection = new NeCollection('ridge.app.db')
    this.trashColl = new NeCollection('ridge.trash.db')

    this.backUpService = new BackUpService()
  }

  async createDirectory (parent, name) {
    const dirObject = {
      parent,
      id: nanoid(10),
      name,
      type: 'directory'
    }

    let n = 0
    while (await this.collection.findOne({
      parent,
      name: n === 0 ? (name || '文件夹') : ((name || '文件夹') + n)
    })) {
      n++
    }

    dirObject.name = (n === 0 ? (name || '文件夹') : ((name || '文件夹') + n))
    await this.collection.insert(dirObject)
  }

  async createPage (parentId, name) {
    let n = 0
    const pageObject = {
      id: nanoid(10),
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

    while (await this.collection.findOne({
      parent: parentId,
      name: n === 0 ? (name || '页面') : ((name || '页面') + n)
    })) {
      n++
    }
    pageObject.name = (n === 0 ? (name || '页面') : ((name || '页面') + n))
    await this.collection.insert(pageObject)
  }

  /**
   * 新增文件
   * @param {*} file
   * @param {*} dir
   * @returns
   */
  async createFile (file, dir) {
    const existed = await this.collection.findOne({ parent: dir, name: file.name })
    if (existed) {
      return false
    }

    await this.collection.insert({
      id: nanoid(10),
      type: 'file',
      mimeType: file.type,
      size: file.size,
      name: file.name,
      dataUrl: await this.blobToDataUrl(file),
      parent: dir
    })
    return true
  }

  /**
   * 保存一个页面配置
   */
  async saveOrUpdate (pageObject) {
    if (await this.collection.findOne({ id: pageObject.id })) {
      return await this.collection.update({ id: pageObject.id }, pageObject)
    } else {
      return await this.collection.insert(pageObject)
    }
  }

  /**
   * 资源重新命名
   * @param {*} id
   * @param {*} newName
   * @returns
   */
  async rename (id, newName) {
    const existed = await this.collection.findOne({ id })
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

    await this.collection.patch({ id }, {
      name: newName
    })
    return true
  }

  /**
   * 移动到新的目录
   */
  async move (id, newParent) {
    const existed = await this.collection.findOne({ id })

    if (existed.parent === newParent) {
      return false
    }

    const nameDup = await this.collection.findOne({ parent: newParent, name: existed.name })
    if (!nameDup) {
      await this.collection.patch({ id }, {
        parent: newParent
      })
      return true
    } else {
      return false
    }
  }

  // 删除一个节点到回收站
  async trash (id) {
    const existed = await this.collection.findOne({ id })
    if (existed) {
      delete existed._id
      await this.trashColl.insert(existed)

      // 递归删除
      const children = await this.collection.find({
        parent: id
      })
      if (children.length) {
        for (const child of children) {
          await this.trash(child.id)
        }
      }
      await this.collection.remove({ id })
    }
  }

  async blobToDataUrl (file) {
    return new Promise((resolve) => {
      const reader = new FileReader()

      reader.addEventListener('load', () => {
        // convert image file to base64 string
        resolve(reader.result)
      }, false)
      reader.readAsDataURL(file)
    })
  }

  async getFiles (filter) {
    const query = {}
    if (filter) {
      query.name = new RegExp(filter)
    }
    return await this.collection.find(query)
  }

  async getFileTree () {
    const files = await this.collection.find({})
    const roots = files.filter(file => file.parent === -1).map(file => {
      const treeNode = {
        key: file.id,
        label: file.name,
        value: file.id
      }
      if (file.type === 'directory') {
        treeNode.children = this.buildDirTree(file, files)
      }
      return treeNode
    })
    return roots
  }

  async getFile (id) {
    const file = await this.collection.findOne({ id })
    return file
  }

  /**
   * 根据路径获取文件
   */
  async getFileByPath (filePath) {
    const parentNames = filePath.split('/')
    let parentId = -1
    let currentFile = null

    for (const fileName of parentNames) {
      currentFile = await this.collection.findOne({
        parent: parentId,
        name: fileName
      })
      if (currentFile == null) {
        return null
      } else {
        parentId = currentFile.id
      }
    }
    return currentFile
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
      return this.createPage(-1)
    } else {
      return pages[0]
    }
  }

  /**
   * 根据文件获取文件所在路径
   */
  async getFilePath (file) {
    if (file.parent && file.parent !== -1) {
      const parentFile = await this.getFile(file.parent)
      return (await this.getFilePath(parentFile)) + '/' + file.name
    } else {
      return file.name
    }
  }

  async getByMimeType (mime) {
    const files = await this.collection.find({
      mimeType: new RegExp(mime)
    })
    return files.map(file => {
      if (file.mimeType.indexOf('image') > -1) {
        file.src = file.dataUrl
      }
      return file
    })
  }

  async exportAppArchive () {
    this.backUpService.exportAppArchive(this.collection)
  }

  async importAppArchive (file) {
    await this.backUpService.importAppArchive(file, this.collection)
    emit(EVENT_APP_OPEN)
  }

  async backUpAppArchive (tag) {
    await this.backUpService.createHistory(this.collection, tag)
  }

  async recoverBackUpAppArchive (id) {
    await this.backUpService.recover(id, this.collection)
    emit(EVENT_APP_OPEN)
  }

  async getAllBackups () {
    return await this.backUpService.listAllHistory()
  }

  async removeBackup (id) {
    return await this.backUpService.deleteHistory(id)
  }

  async exportArchive () {
    this.backUpService.exportColl(this.collection)
  }

  async archive () {

  }
}
