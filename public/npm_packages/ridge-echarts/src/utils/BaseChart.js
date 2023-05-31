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
        console.log('Size changed', entry)
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
      this.chartInstance.setOption(this.getChartOptions())
    }
    if (this.props.loading) {
      this.chartInstance.showLoading()
    } else {
      this.chartInstance.hideLoading()
    }
  }
}
export default BaseChart
