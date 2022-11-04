const config = require('./webpack.config.js')

config.mode = 'production'
delete config.devtool
module.exports = config
