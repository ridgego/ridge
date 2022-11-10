import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.less'
import { Ridge } from 'ridge-runtime'
import App from './App.jsx'

window.Ridge = new Ridge({
  debugUrl: 'https://localhost:8700'
})

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}
