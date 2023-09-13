import BaseChart from '../utils/BaseChart'

class BaseLineChart extends BaseChart {
  getChartOptions () {
    const { chartData } = this.props
    return {
      xAxis: {
        type: 'category',
        data: chartData.categories
      },
      yAxis: {
        type: 'value'
      },
      series: (chartData.series || []).map(serie => {
        return {
          type: 'line',
          data: serie.data,
          smooth: true,
          name: serie.name
        }
      })
    }
  }
}

export default BaseLineChart
