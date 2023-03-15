import JSZip from 'jszip'
import NeCollection from './NeCollection.js'
import { dataURLtoBlob, saveAs } from '../utils/blob'
import { formateDate } from '../utils/string.js'

export default class BackUpService {
  constructor () {
    this.collection = new NeCollection('ridge.backup.db')
  }

  async createHistory (coll, name) {
    const mill = new Date().getTime()
    const dbname = 'ridge.backup-store-' + mill + '.db'
    const historyObject = {
      created: formateDate(mill),
      name,
      pageCount: await coll.count({ type: 'page' }),
      dbname
    }
    await this.collection.insert(historyObject)

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
    return await this.collection.find({})
  }

  async deleteHistory (id) {
    const historyObject = await this.collection.findOne(id)
    if (historyObject) {
      const hisColl = new NeCollection(historyObject.dbname)
      await hisColl.clean()
      await this.collection.remove(id)
    }
  }

  async recover (id, coll) {
    const historyObject = await this.collection.findOne(id)
    if (historyObject) {
      const hisColl = new NeCollection(historyObject.dbname)
      await coll.clean()
      await this.dumpColl(hisColl, coll)
      return true
    } else {
      return false
    }
  }

  async folderSubFile (folder, coll, parentId) {
    const childNodes = await coll.find({ parent: parentId })

    for (const node of childNodes) {
      if (node.type === 'directory') {
        const currentFolder = folder.folder(node.name)
        await this.folderSubFile(currentFolder, coll, node.id)
      } else {
        if (node.type === 'page') {
          folder.file(node.name + '.json', JSON.stringify(node))
        } else {
          folder.file(node.name, await dataURLtoBlob(node.dataUrl))
        }
      }
    }
  }

  async exportAppArchive (coll, store) {
    const zip = new JSZip()
    const documents = await coll.find({})
    for (let i = 0; i < documents.length; i++) {
      documents[i].content = await store.getItem(documents[i].id)
      zip.file(i + '.json', JSON.stringify(documents[i]))
    }
    const blob  = await zip.generateAsync({ type: 'blob' })

    saveAs(blob, 'app.zip')
  }

  /**
   * 导入应用的存档
   * @param {*} file 选择的文件
   * @param {*} appService 应用管理服务
   */
  async importAppArchive (file, coll, store) {
    await coll.clean()
    const zip = new JSZip()
    await zip.loadAsync(file)

    zip.forEach(async (filePath, zipObject) => {
      const doc = JSON.parse(await zipObject.async('string'))
      await store.setItem(doc.id, doc.content)
      delete doc.content
      await coll.insert(doc)
    })
  }
}
