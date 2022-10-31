import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ElementLoader } from 'ridge-render'
import { ViewManager } from 'ridge-view-manager'
import PackageManager from './manager/PackageManager'
import RidgeApplicationService from './service/RidgeApplicationService'

const baseUrl = '/npm_packages'

const loader = new ElementLoader({
  baseUrl,
  debugUrl: 'https://localhost:8700',
  unpkgUrl: baseUrl
})

const fcViewManager = new ViewManager(loader)
const packageManager = new PackageManager(loader)
const appService = new RidgeApplicationService()

window.fcViewManager = fcViewManager
window.packageManager = packageManager
window.appService = appService

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}
