window.weather = {
  state: () => {
    return {
      lastUpdate: '',
      city: [],
      mainCity: {
        id: '',
        name: '',
        temph: '',
        temprl: '',
        sum: '',
        wind: '',
        windpower: ''
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
      if (window.ky) {
        const cityMap = await window.ky.get('/weather/api/map/weather/1').json()
        console.log('cityMap', cityMap)
        this.city = cityMap.data.city
        this.lastUpdate = cityMap.data.lastUpdate
        setInterval(() => {
          const city = cityMap.data.city[Math.floor(Math.random() * cityMap.data.city.length)]

          this.mainCity.id = city[0]
          this.mainCity.name = city[1]
          this.mainCity.temprh = city[4]
          this.mainCity.temprl = city[11]
          this.mainCity.sum = (city[5] === city[12]) ? city[5] : (city[5] + '转' + city[12])
          this.mainCity.wind = city[9] === city[14] ? city[9] : (city[9] + '转' + city[14])
          this.mainCity.windpower = city[10] === city[15] ? city[10] : (city[10] + '转' + city[15])
        }, 2000)
      } else {
        console.error('weather 库运行需要 ky.js 库')
      }
    }
  },
  alias: {
    name: '姓名'
  }
}
