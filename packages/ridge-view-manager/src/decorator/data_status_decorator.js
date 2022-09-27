import ViewDecorator from './view_decorator.js'
import './data_status.css'
import ky from 'ky'

const fetchContent = async url => {
  const got = await ky.get(url).text()

  return got
}
const asyncOnce = async func => {
  let onceCalled = null

  return async function () {
    if (onceCalled == null) {
      onceCalled = func.apply(this, arguments)
    }
    return onceCalled
  }
}

const seriesChecker = data => {
  if (data == null) {
    return true
  }
  if (data.series == null || data.series.length === 0) {
    return true
  }
  // 增加对series有系列处理的判断： 对所有系列的values  如果都是 [] 则也判断为空
  if (data.series && data.series.length) {
    let isEmptyData = true

    for (const serie of data.series) {
      if (serie.values && serie.values.length) {
        isEmptyData = false
        break
      }
    }
    if (isEmptyData) {
      return true
    }
  }
}

/**
 * 检查数据获取是否满足， 如果未获取 显示一个加载中的遮罩层
 */
export default class DataStatusDecorator extends ViewDecorator {
  constructor (viewManager) {
    super()
    this.viewManager = viewManager
    this.validCheckers = {
      CategorySeries: data => {
        return data.series !== undefined
      },
      TimeSeries: data => {
        return data.series !== undefined
      },
      DataEntry: data => {
        return data.value !== undefined
      },
      Percentage: data => {
        return data.value !== undefined
      },
      Table: data => {
        return data.rows !== undefined
      }
    }
    this.emptyChecker = {
      CategorySeries: seriesChecker,
      TimeSeries: seriesChecker,
      DataEntry: data => {
        return data && data.value == null
      },
      Percentage: data => {
        return data && (data.value == null || data.value.length === 0)
      },
      Table: data => {
        return data && (data.rows == null || data.rows.length === 0)
      }

    }

    if (window.top.fdreConfig && window.top.fdreConfig.dataValidCheckers) {
      Object.assign(this.validChecker, window.top.fdreConfig.validCheckers)
    }
    if (window.top.fdreConfig && window.top.fdreConfig.dataEmptyChecker) {
      Object.assign(this.validChecker, window.top.fdreConfig.dataEmptyChecker)
    }
    if (window.top.fdreConfig && window.top.fdreConfig.emptyMessageColor) {
      this.emptyMessageColor = window.top.fdreConfig.emptyMessageColor
    }
  }

  mounted (fcViewInstance) {
    // 保存默认的组件display样式
    if (fcViewInstance.el.querySelector(':scope>:not(.extra-layer)') && fcViewInstance.el.querySelector(':scope>:not(.extra-layer)').style.display) {
      fcViewInstance.el.querySelector(':scope>:not(.extra-layer)').style.originalDisplay = fcViewInstance.el.querySelector(':scope>:not(.extra-layer)').style.display
    }
    this.checkDataValid(fcViewInstance) && this.checkDBLoaded(fcViewInstance)
  }

  updateProps (fcViewInstance) {
    this.checkDataValid(fcViewInstance) && this.checkDBLoaded(fcViewInstance)
  }

  /**
     * 检查组件的属性schema是否符合
     * @param {*} fcViewInstance
     */
  checkDataValid (fcViewInstance) {
    if (fcViewInstance.componentDefinition && fcViewInstance.componentDefinition.props) {
      for (const prop of fcViewInstance.componentDefinition.props) {
        // 多个属性，只要之一为不合法就判断属性值不合法
        if (fcViewInstance.instancePropConfig[prop.name] != null && this.validCheckers[prop.type]) {
          if (!this.validCheckers[prop.type](fcViewInstance.instancePropConfig[prop.name])) {
            this.setSchemaInvalid(fcViewInstance, true)
            return false
          }
        }
      }
    }
    this.setSchemaInvalid(fcViewInstance, false)
    return true
  }

  /**
     * 设置组件信息为： 数据结构错误
     * @param {*} invalid  true为格式错误
     */
  setSchemaInvalid (fcViewInstance, invalid) {
    if (fcViewInstance.el) {
      if (invalid) {
        let loadingEl = document.querySelector('#schema-' + fcViewInstance.uuid)

        if (!loadingEl) {
          loadingEl = document.createElement('div')
          loadingEl.id = 'schema-' + fcViewInstance.uuid
        }

        loadingEl.className = 'cover-invalid extra-layer'

        loadingEl.innerHTML = '数据结构错误'

        if (fcViewInstance.el.style.position !== 'absolute') {
          fcViewInstance.el.style.position = 'relative'
        }
        fcViewInstance.el.style.border = '1px solid #faad1440'
        fcViewInstance.el.appendChild(loadingEl)
      } else {
        const loadingEl = document.querySelector('#schema-' + fcViewInstance.uuid)

        fcViewInstance.el.style.border = ''
        if (loadingEl) {
          fcViewInstance.el.removeChild(loadingEl)
        }
      }
    }
  }

  /**
     * 检查并设置数据绑定的加载：
     * 如果绑定的数据未获取到，则加载Loading层
     * 否则取消loading层
     */
  checkDBLoaded (fcViewInstance) {
    if (this.isDbFetched(fcViewInstance) === false && fcViewInstance.fcInstanceConfig.showNoData !== false) {
      this.setNoData(fcViewInstance, true)
    } else {
      this.setNoData(fcViewInstance, false)
    }
  }

  // 根据数据绑定配置的内容获取 是否属性已经得到了数据绑定的信息
  isDbFetched (fcViewInstance) {
    let fetched = true

    if (fcViewInstance.fcInstanceConfig) {
      if (fcViewInstance.fcInstanceConfig.db) {
        const dbKeys = Object.keys(fcViewInstance.fcInstanceConfig.db)

        for (const propName of dbKeys) {
          if (this.checkPropEmpty(fcViewInstance, propName)) {
            fetched = false
          }
        }
      }

      if (fcViewInstance.fcInstanceConfig.reactiveProps) {
        const dbKeys = Object.keys(fcViewInstance.fcInstanceConfig.reactiveProps)

        for (const propName of dbKeys) {
          if (this.checkPropEmpty(fcViewInstance, propName)) {
            fetched = false
          }
        }
      }
    }
    return fetched
  }

  checkPropEmpty (fcViewInstance, propName) {
    if (fcViewInstance.instancePropConfig[propName] == null) {
      return true
    }
    if (fcViewInstance.componentDefinition && fcViewInstance.componentDefinition.props) {
      const propDef = fcViewInstance.componentDefinition.props.filter(prop => prop.name === propName)[0]

      // 组件属性无对应定义的情况： 可能属于历史遗留问题，这里就不做判空处理
      if (propDef == null) {
        return false
      }

      if (propDef.isEmptyData) {
        return propDef.isEmptyData(fcViewInstance.instancePropConfig[propName])
      }
      if (this.emptyChecker[propDef.type]) {
        return this.emptyChecker[propDef.type](fcViewInstance.instancePropConfig[propName])
      }
    }
    return false
  }

  async getIconContent (url) {
    if (this.iconTextContent) {
      return this.iconTextContent
    }
    if (!this.iconContentFetching) {
      this.iconContentFetching = fetchContent(url)
    }
    this.iconTextContent = await this.iconContentFetching
    return this.iconTextContent
  }

  /**
     * 设置组件信息为： 组件暂时无数据
     * @param {*} isNoData  true为无数据
     */
  setNoData (fcViewInstance, isNoData) {
    if (fcViewInstance.el) {
      let emptyIcon = this.viewManager.apolloApp.appSetting.emptyIcon?.icon

      if (!emptyIcon) {
        emptyIcon = 'empty.svg'
      }

      if (isNoData) {
        let loadingEl = fcViewInstance.el.querySelector('.apollo-empty-status')

        if (!loadingEl) {
          loadingEl = document.createElement('div')
          loadingEl.className = 'apollo-empty-status extra-layer'
          const textContentEl = document.createElement('div')
          const emptyImageEl = document.createElement('div')

          emptyImageEl.className = 'empty-img'
          textContentEl.className = 'empty-msg'
          if (emptyIcon.endsWith('.svg')) {
            // 对于SVG的图片，需要获取正文内容，加入DOM之中，以便后续主题的CSS变量产生效果
            this.getIconContent('/' + emptyIcon).then(text => {
              emptyImageEl.innerHTML = text
            })
          } else {
            // 普通图片直接 img.src
            const imgEl = document.createElement('img')

            imgEl.src = '/' + emptyIcon
            emptyImageEl.appendChild(imgEl)
          }
          textContentEl.style.color = this.emptyMessageColor || 'var(--fgGrayA_60,#808080)'
          textContentEl.innerHTML = fcViewInstance.fcInstanceConfig.emptyMessage || this.getText('暂无数据')
          loadingEl.appendChild(emptyImageEl)
          loadingEl.appendChild(textContentEl)
        }

        if (fcViewInstance.el.style.position !== 'absolute') {
          fcViewInstance.el.style.position = 'relative'
        }
        fcViewInstance.el.appendChild(loadingEl)

        if (fcViewInstance.fcInstanceConfig.hideOnEmpty !== false) {
          if (fcViewInstance.el.querySelector(':scope>:not(.extra-layer)')) {
            // fcViewInstance.el.querySelector(':scope>:not(.extra-layer)').originalDisplay = fcViewInstance.el.querySelector(':scope>:not(.extra-layer)').style.display;
            fcViewInstance.el.querySelector(':scope>:not(.extra-layer)').style.display = 'none'
          }
        }
      } else {
        try {
          const loadingEl = fcViewInstance.el.querySelector('.apollo-empty-status')

          if (loadingEl) {
            fcViewInstance.el.removeChild(loadingEl)
          }
        } catch (e) {
          // 删除失败不做处理
        }
        if (fcViewInstance.fcInstanceConfig.hideOnEmpty !== false) {
          if (fcViewInstance.el.querySelector(':scope>:not(.extra-layer)') && fcViewInstance.el.querySelector(':scope>:not(.extra-layer)').style.display === 'none') {
            fcViewInstance.el.querySelector(':scope>:not(.extra-layer)').style.display = fcViewInstance.el.querySelector(':scope>:not(.extra-layer)').originalDisplay || ''
          }
        }
      }
    }
  }

  getText (text) {
    if (this.viewManager && this.viewManager.i18nManager) {
      return this.viewManager.i18nManager.getText(text)
    } else {
      return text
    }
  }
}
