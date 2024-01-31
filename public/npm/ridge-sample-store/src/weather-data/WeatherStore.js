import axios from 'axios'
import _ from 'lodash'

export default {
  state: ({ location }) => {
    return {
      location: location ?? 'Beijing',
      last_updated_epoch: 1705019400,
      last_updated: '--',
      temp_c: -8.0,
      temp_f: 17.6,
      is_day: 1,
      icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
      text: 'Sunny',
      wind_mph: 4.3,
      wind_kph: 6.8,
      wind_degree: 360,
      wind_dir: 'N',
      pressure_mb: 1021.0,
      pressure_in: 30.15,
      precip_mm: 0.0,
      precip_in: 0.0,
      humidity: 79,
      cloud: 0,
      feelslike_c: -10.9,
      feelslike_f: 12.4,
      vis_km: 10.0,
      vis_miles: 6.0,
      uv: 2.0,
      gust_mph: 6.0,
      gust_kph: 9.6
    }
  },

  setup () {
    this.updateCurrentRealtime()
    this.debounceUpdate = _.debounce(this.updateCurrentRealtime, 500)

    this.timer = setTimeout(() => {
      this.updateCurrentRealtime()
    }, 60 * 60 * 1000)
  },

  exit () {
    window.clearTimeout(this.timer)
  },

  watch: {
    location () {
      this.debounceUpdate()
    }
  },

  actions: {
    // 获取实时天气
    async updateCurrentRealtime () {
      if (this.state.location && this.properties.token) {
        try {
          const result = await axios.get(`//api.weatherapi.com/v1/current.json?q=${this.state.location}&aqi=no&key=${this.properties.token}&lang=zh`)
          Object.assign(this.state, result.data.current)
          this.state.temp_c = this.state.temp_c + '°'
          Object.assign(this.state, result.data.current.condition)
          console.log(result)
        } catch (e) {

        }
      }
    }
  }
}
