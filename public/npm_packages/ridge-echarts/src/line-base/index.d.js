import BaseLineChart from './BaseLineChart'
export default {
  name: 'BaseLineChart',
  title: '基础线图',
  component: BaseLineChart,
  icon: 'IconButtonStroked',
  type: 'vanilla',
  props: [{
    name: 'chartData',
    label: '',
    bindable: true,
    type: 'SeriesData',
    value: {}
  }, {
    name: 'loading',
    label: '加载中',
    connect: true,
    type: 'boolean',
    value: false
  }, {
    name: 'darkMode',
    label: '暗色',
    connect: true,
    type: 'boolean',
    value: false
  }],
  events: [],
  width: 540,
  height: 480
}
