import Ridge from '../src/Ridge'

function start () {
  const ridge = new Ridge({
    baseUrl: 'https://ridgego.github.io'
  })
  ridge.mountPage(document.querySelector('#app'), 'start', 'webstart/WeatherForcast.json')
}

start()
