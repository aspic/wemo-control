var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');
var config = require('../webpack.config.js');

var production = _.extend({}, config, {
  devtool: 'source-map',
  entry: ['./index.js'],
  output: {
    path: __dirname,
    filename: 'bundle.js',
    publicPath: '/'
  },
  plugins: config.plugins.concat(
    new webpack.NormalModuleReplacementPlugin(
      /^webpack-react-starter$/,
      '../src/index'
    ),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  ),
  eslint: {
    configFile: '../.eslintrc',
    emitError: true
  }
});

module.exports = production;