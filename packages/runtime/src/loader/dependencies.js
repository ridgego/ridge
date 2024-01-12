const loads = {
  react: [
    'react/umd/react.production.min.js',
    'react-dom/umd/react-dom.production.min.js'
  ],
  axios: [
    'axios/dist/axios.min.js'
  ],
  lodash: [
    'lodash/lodash.min.js'
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
