import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RidgeLoader } from 'ridge-render'
import { FCViewManager } from 'ridge-view-manager'
import PackageManager from './manager/PackageManager'

const baseUrl = '/npm_packages'

const ridgeLoader = new RidgeLoader(baseUrl)

const fcViewManager = new FCViewManager(ridgeLoader)
const packageManager = new PackageManager(ridgeLoader)

window.ridgeLoader = ridgeLoader
window.fcViewManager = fcViewManager
window.packageManager = packageManager

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}
