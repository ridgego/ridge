import debug from 'debug'
import interval from 'interval-promise'
import ky from 'ky'

const BASE_SERVICE_URL = (window.top.fdreConfig && window.top.fdreConfig.baseServiceUrl) ? window.top.fdreConfig.baseServiceUrl : '/api'
const getUseInfoById = async uid => {
  return ky.post(`${BASE_SERVICE_URL}/common/user/getById`, {
    json: {
      id: uid
    }
  }).json()
}
const getDebugPackageInfo = async (debugUrl) => {
  return ky.get(`${debugUrl}package.json`).json()
}
const getDevBuildTimeStamp = async (debugUrl) => {
  return ky.get(`${debugUrl}api/t`).json()
}

class DebugManager {
  constructor (fcViewManager) {
    this.fcViewManager = fcViewManager
    this.initilized = false
    this.debugConfig = {
      isDebug: false
    }
  }

  async initDebug () {
    if (this.initilized) {
      return
    }

    if (localStorage.user) {
      // 运行时不要求平台用户登录， 但目前只能登录了才能调试 否则都不知道本地 debugUrl
      // 获取登录后的localStorage.user信息
      const userInfo = JSON.parse(localStorage.user)

      if (userInfo.user && userInfo.user.id) {
        const userDebugInfo = await getUseInfoById(userInfo.user.id)

        debug('平台调试：获取用户信息', userDebugInfo)
        if (userDebugInfo) {
          if (userDebugInfo.data.devIsOpen && userDebugInfo.data.devUrl && userDebugInfo.data.devUrl.match(/^https.+/)) {
            debug('调试模式启动')
            try {
              this.debugConfig.debugUrl = userDebugInfo.data.devUrl.endsWith('/') ? userDebugInfo.data.devUrl : (userDebugInfo.data.devUrl + '/')
              this.debugConfig.userId = userInfo.user.id
              await this.setDebugUsingUrl(this.debugConfig.debugUrl)
              this.debugConfig.isDebug = true
              this.showBox('已连接调试服务', 'green')
            } catch (e) {
              this.showBox('调试服务未连接', 'red')
            }
          }
        }
      }
    }
    this.initilized = true
  }

  /**
     * 显示调试连接状态信息
     * @param {string} text 显示信息内容
     * @param {string} color 显示信息背景颜色
     */
  showBox (text, color) {
    const boxDiv = document.createElement('div')

    boxDiv.style.position = 'absolute'
    boxDiv.style.zIndex = 999999
    boxDiv.style.left = '0px'
    boxDiv.style.top = '0px'
    boxDiv.style.right = '0px'
    boxDiv.style.height = '1px'
    boxDiv.style.border = '1px solid ' + color

    const messageBox = document.createElement('div')

    messageBox.style.color = 'white'
    messageBox.style.background = color
    messageBox.innerHTML = text
    messageBox.style.padding = '5px'
    messageBox.style.fontSize = '11px'
    messageBox.style.width = '110px'
    messageBox.style.margin = '0 auto'
    messageBox.style.textAlign = 'center'
    messageBox.style.borderRadius = '0 0 3px 3px'

    boxDiv.appendChild(messageBox)

    document.body.appendChild(boxDiv)
  }

  async setDebugUsingUrl (debugUrl) {
    const debugPackageInfo = await getDebugPackageInfo(debugUrl)

    this.fcViewManager.setDebugInfo(debugUrl, debugPackageInfo.name)

    interval(async (iteration, stop) => {
      const buildInfo = await getDevBuildTimeStamp(debugUrl)

      // 后续过程如果时间戳不一致
      if (this.debugTimeStamp != null && this.debugTimeStamp !== buildInfo.data.lastBuilt) {
        this.fireSourceCodeChange()
      }
      this.debugTimeStamp = buildInfo.data.lastBuilt
    }, 1000)
  }

  fireSourceCodeChange () {
    this.fcViewManager.refreshDebugViews()
  }
}

export default DebugManager
