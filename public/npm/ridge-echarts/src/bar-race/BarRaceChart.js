import BaseChart from '../utils/BaseChart'

class BarRaceChart extends BaseChart {
  getChartOptions () {
    const { chartData, stack } = this.props
    return {
      yAxis: {
        type: 'category',
        data: chartData.categories
      },
      xAxis: {
        type: 'value'
      },
      series: (chartData.series || []).map(serie => {
        const x = {
          type: 'bar',
          data: serie.data,
          name: serie.name
        }
        if (stack) {
          x.stack = 'total'
        } else {
          x.stack = null
        }
        return x
      })
    }
  }
}

export default BarRaceChart
