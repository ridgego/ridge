export default {
  state: ({ location }) => {
    return {
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

  watch: {

  },

  actions: {
    // 获取实时天气
    getRealTime () {

    }
  }
}
