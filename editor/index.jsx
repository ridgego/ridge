import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.less'
import App from './App.jsx'

// const fcViewManager = new ViewManager(loader)
// const packageManager = new PackageManager(loader)
// const appService = new RidgeApplicationService()

// window.fcViewManager = fcViewManager
// window.packageManager = packageManager
// window.appService = appService

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}
