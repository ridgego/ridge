import BaseChart from '../utils/BaseChart'

class BaseBarChart extends BaseChart {
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
          type: 'bar',
          data: serie.data,
          smooth: true,
          name: serie.name
        }
      })
    }
  }
}

export default BaseBarChart
