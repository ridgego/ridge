import NeCollection from './NeCollection.js'

// import LowCollection from './LowCollection.js'
import Localforge from 'localforage'
import BackUpService from './BackUpService.js'
import { emit } from './RidgeEditService.js'
import { EVENT_APP_OPEN } from '../constant.js'
const { nanoid } = require('../utils/string')

export default class ApplicationService {
  constructor () {
    this.collection = new NeCollection('ridge.app.db')
    // this.trashColl = new NeCollection('ridge.trash.db')

    this.store = Localforge.createInstance({
      name: 'ridge-store'
    })
    this.backUpService = new BackUpService()
    this.dataUrls = {}
  }

  /**
   * 获取新的文件名称（去重）
   * @param {*} parent
   * @param {*} baseName
   * @param {*} nextNameFunc
   * @returns
   */
  async getNewFileName (parent, baseName, nextNameFunc) {
    let n = 0
    while (await this.collection.findOne({
      parent,
      name: n === 0 ? baseName : (baseName + nextNameFunc(n))
    })) {
      n++
    }
    return n === 0 ? baseName : (baseName + nextNameFunc(n))
  }

  async createDirectory (parent, name) {
    const dirObject = {
      parent,
      id: nanoid(10),
      name: await this.getNewFileName(parent, name || '新建文件夹', n => `(${n})`),
      type: 'directory'
    }
    await this.collection.insert(dirObject)
  }

  async createPage (parentId, name) {
    const id = nanoid(10)
    const pageContent = {
      id,
      states: [],
      scopeStates: [],
      reducers: [],
      properties: {
        type: 'fixed',
        width: 800,
        height: 600
      },
      variables: [],
      elements: []
    }
    const pageObject = {
      id,
      name: await this.getNewFileName(parentId, name || '新建页面', n => `(${n})`),
      type: 'page',
      parent: parentId,
      mimeType: 'text/json'
    }
    await this.store.setItem(id, pageContent)
    await this.collection.insert(pageObject)
  }

  /**
   * 新增文件
   * @param {*} file
   * @param {*} dir
   * @returns
   */
  async createFile (file, dir) {
    const id = nanoid(10)
    const dataUrl = await this.blobToDataUrl(file)

    await this.store.setItem(id, dataUrl)
    await this.collection.insert({
      id,
      mimeType: file.type,
      size: await this.getNewFileName(dir, file.name, n => `(${n})`),
      name: file.name,
      parent: dir
    })
    return true
  }

  /**
     * 保存页面配置
     */
  async savePageContent (id, content) {
    await this.collection.patch({ id }, {})
    await this.store.setItem(id, content)
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

  async copy (id) {
    const existed = await this.collection.findOne({ id })

    if (existed) {
      const newId = nanoid(10)
      const newObject = {
        id: newId,
        name: await this.getNewFileName(existed.parent, existed.name, n => `(${n})`),
        type: existed.type,
        parent: existed.parent,
        mimeType: existed.mimeType,
        copyFrom: id
      }
      await this.collection.insert(newObject)
      const content = await this.store.getItem(existed.id)
      if (content) {
        await this.store.setItem(newId, content)
      }
    }
  }

  // 删除一个节点到回收站
  async trash (id) {
    const existed = await this.collection.findOne({ id })
    if (existed) {
      if (existed.type !== 'directory') {
        await this.store.removeItem(id)
      }
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

  async getFile (id) {
    const file = await this.collection.findOne({ id })

    if (file) {
      file.content = await this.store.getItem(id)
      return file
    }
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
      return {
        ...pages[0],
        ...(await this.store.getItem(pages[0].id))
      }
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
    for (const file of files) {
      if (file.type === 'file') {
        file.src = await this.store.getItem(file.id)
      }
    }
    return files
  }

  async isParent (parent, child) {
    let lop = await this.getFile(child)
    while (lop.parent !== -1) {
      if (lop.parent === parent) {
        return true
      }
      lop = await this.getFile(lop.parent)
    }
    return false
  }

  async updateDataUrl () {
    const images = await this.getByMimeType('image')
    for (const image of images) {
      this.dataUrls[image.id] = image.dataUrl
    }
  }

  async getDataUrl (path) {
    const file = await this.getFileByPath(path)
    if (file) {
      return await this.store.getItem(file.id)
    }
  }

  async exportAppArchive () {
    this.backUpService.exportAppArchive(this.collection, this.store)
  }

  async importAppArchive (file) {
    await this.backUpService.importAppArchive(file, this.collection, this.store)
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
