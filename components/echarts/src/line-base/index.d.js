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
    type: 'LineChart',
    value: {}
  }],
  events: [],
  width: 540,
  height: 480
}
