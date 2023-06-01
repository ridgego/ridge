import BaseBarChart from './BaseBarChart'
export default {
  name: 'BaseBarChart',
  title: '基础柱状图',
  component: BaseBarChart,
  icon: 'IconButtonStroked',
  type: 'vanilla',
  props: [{
    name: 'chartData',
    label: '数据',
    bindable: true,
    type: 'SeriesData',
    value: {}
  }, {
    name: 'legend',
    label: '图例',
    width: '50%',
    type: 'boolean',
    value: false
  }],
  events: [],
  width: 540,
  height: 480
}
