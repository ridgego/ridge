import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { FCViewManager } from 'ridge-view-manager'

const fcViewManager = new FCViewManager({
  baseUrl: '/npm_packages'
})
window.fcViewManager = fcViewManager

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}
