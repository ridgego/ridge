import 'bootstrap-icons/font/bootstrap-icons.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import Editor from './Editor.jsx'
import './reset.less'

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<Editor />)
}
