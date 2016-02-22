var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');
var config = require('../webpack.config.js');

var development = _.extend({}, config, {
  devtool: 'eval',
  entry: ['webpack/hot/dev-server','./index.js'],
  output: {
    path: __dirname,
    filename: 'bundle.js',
    publicPath: '/'
  },
  plugins: config.plugins.concat(
    new webpack.NormalModuleReplacementPlugin(
      /^webpack-react-starter$/,
      '../src/index'
    )
  ),
  eslint: {
    configFile: '../.eslintrc'
  }
});

module.exports = development;