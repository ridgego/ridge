import BarRaceChart from './BarRaceChart'
export default {
  name: 'BarRaceChart',
  title: '条形图',
  component: BarRaceChart,
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
  }, {
    name: 'stack',
    label: '堆叠',
    width: '50%',
    type: 'boolean',
    value: false
  }],
  events: [],
  width: 540,
  height: 480
}
