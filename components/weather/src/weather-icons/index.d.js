import WeatherIcon from './WeatherIcon'

export default {
  name: 'WeatherIcon',
  title: '天气图标',
  component: WeatherIcon,
  props: [{
    name: 'value',
    label: '当前天气',
    connect: true,
    type: 'string'
  }, {
    name: 'color',
    label: '颜色',
    connect: true,
    type: 'colorpicker'
  }, {
    name: 'daySunny',
    label: '白天晴',
    type: 'image'
  }, {
    name: 'nightClear',
    label: '夜间晴',
    type: 'image'
  }, {
    name: 'cloudy',
    label: '多云',
    type: 'image'
  }, {
    name: 'rain',
    label: '雨',
    type: 'image'
  }, {
    name: 'snow',
    label: '雪',
    type: 'image'
  }],
  width: 80,
  height: 80
}
