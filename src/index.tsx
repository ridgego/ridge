import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './demo/Moveable'

const container = document.getElementById('root')

if (container) {
  const root = createRoot(container)
  root.render(<App />)
}
