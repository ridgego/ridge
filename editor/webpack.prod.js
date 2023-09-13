const { merge } = require('webpack-merge')
const config = require('./webpack.config.js')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = merge(config, {
  mode: 'production',
  devtool: false,
  optimization: {
    minimize: true,
    usedExports: true,
    splitChunks: {
      chunks: 'all',
      name: 'vendor'
    }
  },
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, '../../ridgego.github.io/editor'),
    clean: true,
    publicPath: './'
  },
  plugins: [
    new BundleAnalyzerPlugin()
  ]
})
