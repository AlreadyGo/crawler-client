var path = require('path');
var webpack = require("webpack");

config = {
  entry: {
    main: path.resolve(__dirname, 'app.js')
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].bundle.js'
  },

  resolve: {
    extensions: ['', '.js', '.jsx']
  },

  module: {

    loaders: [{
      test: /\.jsx?$/,
      exclude: /(node_modules|bower_components|vendor)/,
      loader: 'babel',
      query: {
        optional: ['runtime', 'es6.spec.symbols'],
        stage: 0,
        retainLines: true,
        cacheDirectory: true
      }
    }, {
      test: /\.less$/,
      loader: "style!css!less"
    }, {
      test: /\.jpe?g$|\.gif$|\.png$|\.json$|\.svg$/i,
      loader: "file-loader?name=[path][name].[ext]?[hash]"
    }]
  }
};

module.exports = config;
