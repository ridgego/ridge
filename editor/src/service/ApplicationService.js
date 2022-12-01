import localforage from 'localforage'
import { nanoid } from 'ridge-runtime/src/utils/string'

export default class ApplicationService {
  constructor () {
    localforage.config({
      baseStore: localforage.INDEXEDDB
    })
    this.baseStore = localforage.createInstance({
      name: 'pageStore'
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

  async getRecentPage () {
    // 首先更新页面目录数据
    let itemIndex = await this.baseStore.getItem('pages')
    if (!itemIndex) {
      await this.saveUpdatePage({
        id: nanoid(10),
        title: '页面',
        parent: null,
        content: `<object id="ridge-page-properties" data-variables="[]" data-properties="{&quot;title&quot;:&quot;页面&quot;,&quot;type&quot;:&quot;fixed&quot;,&quot;width&quot;:800,&quot;height&quot;:600}" title":"新增页面","type":"fixed","width":800,"height":600}"="">
        </object>
        <main>
        </main>`
      })
    }
    itemIndex = await this.baseStore.getItem('pages')

    const first = itemIndex.sort((a, b) => a.updated - b.updated)[0]

    return {
      id: first.id,
      content: await this.baseStore.getItem('page.' + first.id)
    }
  }

  /**
   * 保存一个页面配置
   */
  async saveUpdatePage ({
    id,
    title,
    parent,
    content
  }) {
    // 首先更新页面目录数据
    let itemIndex = await this.baseStore.getItem('pages')
    if (!itemIndex) {
      itemIndex = []
    }
    let existed = false
    const now = new Date().getTime()
    itemIndex = itemIndex.map(item => {
      if (item.id === id) {
        existed = true
        return {
          id,
          title,
          updated: now,
          parent
        }
      } else {
        return item
      }
    })

    if (!existed) {
      itemIndex.push({
        id,
        title,
        updated: now,
        parent
      })
    }
    await this.baseStore.setItem('pages', itemIndex)
    await this.baseStore.setItem('page.' + id, content)
  }

  async listPage () {
    let itemIndex = await this.baseStore.getItem('pages')
    if (!itemIndex) {
      itemIndex = []
    }
    return itemIndex
  }

  deletePage (pageId) {
  }

  saveAppResource (appName, pid, object) {}

  listAppResource (appName) {}
}
