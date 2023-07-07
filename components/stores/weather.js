window.weather = {
  state: () => {
    return {
      lastUpdate: '--',
      city: [],
      mainCity: {
        id: '',
        name: '--',
        temprl: '--',
        temprh: '--',
        sum: '--',
        wind: '--',
        windpower: '--'
      }
    }
  },
  getters: {
    hello: (state) => {
      return 'Hello ' + state.name
    }
  },
  actions: {
    async loadCityMap () {
      if (this.city.length === 0) {
        if (window.ky) {
          const cityMap = await window.ky.get('/weather/api/map/weather/1').json()
          this.city = cityMap.data.city
          this.lastUpdate = cityMap.data.lastUpdate
        }
      }
      const city = this.city[Math.floor(Math.random() * this.city.length)]
      this.mainCity.id = city[0]
      this.mainCity.name = city[1]
      this.mainCity.temprh = city[6]
      this.mainCity.temprl = city[11]
      this.mainCity.sum = (city[7] === city[12]) ? city[7] : (city[7] + '转' + city[12])
      this.mainCity.wind = city[9] === city[14] ? city[9] : (city[9] + '转' + city[14])
      this.mainCity.windpower = city[10] === city[15] ? city[10] : (city[10] + '转' + city[15])
    }
  },
  alias: {
    loadCityMap: '随机设置当前城市',
    name: '名称',
    mainCity: '当前城市',
    lastUpdate: '数据时间',
    'mainCity.tempr': '当前城市温度',
    sum: '概要',
    wind: '风向',
    windpower: '风力'
  }
}
