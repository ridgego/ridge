const { merge } = require('webpack-merge')
const config = require('./webpack.config.js')
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = merge(config, {
  mode: 'production',
  devtool: false,
  optimization: {
    minimize: true,
    usedExports: true
  },
  output: {
    filename: '[name].bundle.js',
    clean: true,
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  plugins: [
    new BundleAnalyzerPlugin()
  ]
})