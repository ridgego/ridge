class BaseChart {
  constructor (props) {
    this.props = props || {}
  }

  getChartOptions () {

  }

  mount (el) {
    const { echarts, ResizeObserver } = window
    this.el = el
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.chartInstance.resize()
      }
    })
    resizeObserver.observe(this.el)

    if (!echarts) {
      console.log('no echarts loaded')
    }
    this.chartInstance = echarts.init(this.el)

    this.update()
  }

  update (props) {
    if (props) {
      this.props = props
    }
    if (this.chartInstance) {
      const chartOptions = this.getChartOptions()
      if (this.props.legend) {
        chartOptions.legend = {
          show: true
        }
      } else {
        chartOptions.legend = {
          show: false
        }
      }
      chartOptions.xAxis.axisLabel = {
        interval: 0
      }
      this.chartInstance.setOption(chartOptions)
    }
    if (this.props.loading) {
      this.chartInstance.showLoading()
    } else {
      this.chartInstance.hideLoading()
    }
  }
}
export default BaseChart
