// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// var nodeExternals = require('webpack-node-externals');

module.exports = [
{
  watch: true,
  entry: './js/StackedAreaLastFm.js',
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'eslint-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js']
  },
  output: {
    path: __dirname + '/public/js',
    publicPath: '/',
    filename: 'StackedAreaLastFm.js'
  },
  mode: 'development',
  target: 'node',
},
// {
//   watch: true,
//   entry: './js/StackedAreaSpotify.js',
//   module: {
//     rules: [
//       {
//         test: /\.(js)$/,
//         exclude: /node_modules/,
//         use: ['babel-loader', 'eslint-loader']
//       }
//     ]
//   },
//   resolve: {
//     extensions: ['*', '.js']
//   },
//   output: {
//     path: __dirname + '/public/js',
//     publicPath: '/',
//     filename: 'StackedAreaSpotify.js'
//   },
//   mode: 'development',
//   target: 'node',
// }
// ,{
//   entry: './js/react/ArtistTree.js',
//   module: {
//     rules: [
//       {
//         test: /\.(js)$/,
//         exclude: /node_modules/,
//         use: ['babel-loader', 'eslint-loader']
//       }
//     ]
//   },
//   resolve: {
//     extensions: ['*', '.js']
//   },
//   output: {
//     path: __dirname + '/public/js',
//     publicPath: '/',
//     filename: 'ArtistTree.js'
//   },
//   mode: 'development',
	// target: 'node'
// }
]