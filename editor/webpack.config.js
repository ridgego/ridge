const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = {
  entry: './src/index.jsx',
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, '../public')
    },
    compress: true,
    proxy: {
      '/weather': {
        target: 'https://weather.cma.cn',
        secure: false,
        changeOrigin: true,
        pathRewrite: { '^/weather': '' },
        onProxyReq: (proxyReq, req, res) => {
          proxyReq.setHeader('host', 'weather.cma.cn')
          proxyReq.setHeader('referer', 'http://weather.cma.cn/')
          /* handle proxyReq */
        }
      }
    },
    port: 9000
  },
  devtool: 'eval-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/index.html'),
      title: 'Output Management'
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', 'jsx']
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              [
                '@babel/env',
                { modules: false }
              ],
              '@babel/react'
            ]
          }
        }]
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        // test: /\.svg$/,
        include: [
          /icons/
        ],
        use: [
          '@svgr/webpack', 'url-loader'
        ]
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.less$/i,
        use: [
          // compiles Less to CSS
          'style-loader',
          'css-loader',
          'less-loader'
        ]
      }
    ]
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/'
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    '@douyinfe/semi-ui': 'SemiUI'
    // moveable: 'Moveable'
  }
}
