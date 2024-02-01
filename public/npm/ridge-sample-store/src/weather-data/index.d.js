import WeatherStore from './WeatherStore'

export default {
  name: 'WeatherData',
  icon: 'bi bi-cloud-sun',
  title: '天气数据',
  type: 'store',
  component: WeatherStore,
  props: [{
    name: 'location',
    label: '城市/位置',
    connect: true,
    type: 'string'
  }, {
    name: 'token',
    label: 'API Token',
    type: 'string',
    value: '6cfe4cf6818d420581703248241201'
  }]
}
