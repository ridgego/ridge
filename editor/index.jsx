import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RidgeLoader } from 'ridge-render'
import { FCViewManager } from 'ridge-view-manager'
import PackageManager from './manager/PackageManager'
import RidgeApplicationService from './service/RidgeApplicationService'

const baseUrl = '/npm_packages'

const ridgeLoader = new RidgeLoader(baseUrl, baseUrl)

const fcViewManager = new FCViewManager(ridgeLoader)
const packageManager = new PackageManager(ridgeLoader)
const appService = new RidgeApplicationService()

window.ridgeLoader = ridgeLoader
window.fcViewManager = fcViewManager
window.packageManager = packageManager
window.appService = appService

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}
