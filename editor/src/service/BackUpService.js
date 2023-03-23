/* global Blob File */
import JSZip from 'jszip'
import NeCollection from './NeCollection.js'
import { dataURLtoBlob, saveAs } from '../utils/blob'
import { basename, dirname, extname, formateDate } from '../utils/string.js'
import { getFileTree } from '../panels/files/buildFileTree.js'
import { getByMimeType } from '../utils/mimeTypes.js'

export default class BackUpService {
  constructor (appService) {
    this.appService = appService
    this.coll = appService.collection
    this.store = appService.store
    this.archiveColl = new NeCollection('ridge.backup.db')
  }

  async createHistory (coll, name) {
    const date = formateDate()
    const dbname = 'ridge.backup-store-' + date + '.db'
    const historyObject = {
      created: date,
      name,
      pageCount: await coll.count({ type: 'page' }),
      dbname
    }
    await this.archiveColl.insert(historyObject)

    const hisColl = new NeCollection(dbname)

    await this.dumpColl(coll, hisColl)
  }

  async dumpColl (from, to) {
    await to.clean()
    const documents = await from.find({})

    for (const doc of documents) {
      await to.insert(doc)
    }
  }

  async listAllHistory () {
    return await this.archiveColl.find({})
  }

  async deleteHistory (id) {
    const historyObject = await this.archiveColl.findOne(id)
    if (historyObject) {
      const hisColl = new NeCollection(historyObject.dbname)
      await hisColl.clean()
      await this.archiveColl.remove(id)
    }
  }

  async recover (id, coll) {
    const historyObject = await this.archiveColl.findOne(id)
    if (historyObject) {
      const hisColl = new NeCollection(historyObject.dbname)
      await coll.clean()
      await this.dumpColl(hisColl, coll)
      return true
    } else {
      return false
    }
  }

  /**
   * 导出一个文件归档
   * @param {*} coll
   * @param {*} key
   * @param {*} store
   */
  async exportFileArchive (id) {
    const document = await this.coll.findOne({
      id
    })
    const content = await this.store.getItem(id)

    if (content) {
      if (document.type === 'page') {
        saveAs(new Blob([JSON.stringify(content)]), document.name + '.json')
      } else {
        saveAs(await dataURLtoBlob(content), document.name)
      }
    }
  }

  async importFileArchive (parent, file) {
    const { appService } = this
    if (file.name.endsWith('.json')) { // 对json文件判断是否为图纸，是图纸则导入
      const jsonObject = JSON.parse(await file.text())
      if (jsonObject.elements) {
        await appService.createPage(parent, basename(file.name, '.json'), jsonObject)
      } else {
        await appService.createFile(parent, new File([JSON.stringify(jsonObject)], file.name, {
          type: 'text/json'
        }))
      }
    } else {
      await appService.createFile(parent, file)
    }
  }

  /**
   * 导出应用归档
   * @param {*} coll
   * @param {*} store
   */
  async exportAppArchive () {
    const zip = new JSZip()
    const files = await this.coll.find({})

    const treeData = getFileTree(files)

    await this.zipFolder(zip, treeData)
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, '应用归档' + formateDate() + '.zip')
  }

  /**
   * 递归将目录压缩到zip包中
   * @param {*} zip
   * @param {*} files
   */
  async zipFolder (zip, files) {
    for (const file of files) {
      if (file.type === 'directory') {
        const zipFolder = zip.folder(file.label)
        await this.zipFolder(zipFolder, file.children)
      } else {
        const content = await this.store.getItem(file.key)
        if (file.type === 'page') {
          zip.file(file.label + '.json', JSON.stringify(content))
        } else {
          zip.file(file.label, await dataURLtoBlob(content))
        }
        // zip.file(file.label, JSON.stringify(file.raw))
      }
    }
  }

  /**
   * 导入应用的存档
   * @param {*} file 选择的文件
   * @param {*} appService 应用管理服务
   */
  async importAppArchive (file) {
    const zip = new JSZip()
    await zip.loadAsync(file)
    const { appService } = this

    await this.coll.clean()
    await this.store.clear()
    const fileMap = []
    zip.forEach(async (filePath, zipObject) => {
      fileMap.push({
        filePath,
        zipObject
      })
    })

    for (const { filePath, zipObject } of fileMap) {
      if (!zipObject.dir) {
        const dirNode = await appService.ensureDir(dirname(filePath))
        const parentId = dirNode ? dirNode.id : -1
        if (filePath.endsWith('.json')) { // 对json文件判断是否为图纸，是图纸则导入
          const jsonObject = JSON.parse(await zipObject.async('text'))
          if (jsonObject.elements) {
            await appService.createPage(parentId, basename(filePath, '.json'), jsonObject)
          } else {
            await appService.createFile(parentId, new File([JSON.stringify(jsonObject)], basename(zipObject.name), {
              type: 'text/plain'
            }))
          }
        } else {
          await appService.createFile(parentId, new File([await zipObject.async('blob')], basename(zipObject.name), {
            type: getByMimeType(extname(zipObject.name))
          }))
        }
      } else {
        await appService.ensureDir(filePath)
      }
    }

    return fileMap
  }
}
