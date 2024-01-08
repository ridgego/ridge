const loads = {
  react: [
    'react/umd/react.production.min.js',
    'react-dom/umd/react-dom.production.min.js'
  ]
}

const externals = {
  react: 'React',
  vue: 'Vue'
}

export {
  externals,
  loads
}
