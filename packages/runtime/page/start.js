import Ridge from '../src/Ridge'

function start () {
  const ridge = new Ridge({
    baseUrl: 'https://ridgego.github.io/npm'
  })
  // ridge.mountPage(document.querySelector('#app'), 'start', 'webstart/WeatherForcast.json')

  ridge.mountPage(document.querySelector('#app'), 'ridge-app-calculator', 'calculator.json')
}

start()
