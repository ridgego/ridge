import { createRoot } from 'react-dom/client'
import React from 'react'
import Ridge, { RidgeReact } from '../src/index.js'

function start () {
  const ridge = new Ridge({
    baseUrl: '/npm'
  })
  // ridge.mountPage(document.querySelector('#app'), 'start', 'start/webstart/WeatherForcast.json')

  ridge.mountPage(document.querySelector('#app'), 'ridge-app-start', 'hi.json')

  const container = document.getElementById('app-react')
  if (container) {
    const root = createRoot(container)
    root.render(<RidgeReact app='ridge-app-start' page='hi.json' />)
  }
}

start()
