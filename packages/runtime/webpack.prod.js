const { merge } = require('webpack-merge')
const config = require('./webpack.config.js')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = merge(config, {
  mode: 'production',
  output: {
    filename: 'ridge.min.js',
    path: path.resolve(__dirname, 'build'),
    clean: true
  },
  devtool: false,
  optimization: {
    minimize: true,
    usedExports: true
  },
  plugins: [
    new BundleAnalyzerPlugin()
  ]
})
