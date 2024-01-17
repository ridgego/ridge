export default {
  state: () => {
    return {
      城市数据集: [],
      当前城市: {
        id: '',
        天气: '--',
        名称: '--',
        全名: '--',
        温度: '--',
        湿度: '--',
        风向: '--',
        风力: '--',
        预报时间: '--',
        图标: 'sun'
      }
    }
  },
  getters: {
    hello: (state) => {
      return 'Hello ' + state.name
    },
    天气图标: state => {
       switch(state.当前城市.天气) {
         case "晴":
           return "sun"
         case "多云":
         case "阴":
           return "cloud"
         case "雷阵雨":           
           return "thunder"
         case "小雨":
         case "阵雨":           
           return "rain-small"
         case "中雨":
           return "rain-mid"
         case "大雨":
         case "暴雨":
           return "rain-heavy"
         default:
           return "sun"
       }
    }
  },
  actions: {
    async loadCityMap () {
      if (this.城市数据集.length === 0) {
        if (window.ky) {
          const cityMap = await window.ky.get('/weather/api/map/weather/1').json()
          this.城市数据集 = cityMap.data.city
        }
      }
      const city = this.城市数据集[Math.floor(Math.random() * this.城市数据集.length)]

      if (window.ky) {
        const cityInfo = await window.ky.get('/weather/api/weather/view?stationid=' + city[0]).json()

        this.当前城市.名称 = cityInfo.data.location.name
        this.当前城市.全名 = cityInfo.data.location.path
        this.当前城市.温度 = cityInfo.data.now.temperature
        this.当前城市.湿度 = cityInfo.data.now.humidity
        this.当前城市.风向 = cityInfo.data.now.windDirection
        this.当前城市.风力 = cityInfo.data.now.windScale
        this.当前城市.天气 = cityInfo.data.daily[0].dayText
        this.当前城市.预报时间 = cityInfo.data.lastUpdate

        
      }
    }
  },
  alias: {
    loadCityMap: '随机设置当前城市',
    name: '名称',
    mainCity: '当前城市',
    lastUpdate: '数据时间',
    'mainCity.tempr': '当前城市温度',
    sum: '概要',
    weatherPic: '天气图片',
    wind: '风向',
    windpower: '风力'
  }
}
