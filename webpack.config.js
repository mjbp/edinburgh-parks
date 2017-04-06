const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const HOST = '0.0.0.0';
const PORT = 8080;
const ASSET_PATH = path.resolve('src/')
const APP_FILE_PATH = `${ASSET_PATH}/js/index.js`

module.exports = {
	entry: {
		app: APP_FILE_PATH,
	},
	output: {
		path: path.resolve('build/'),
		filename: 'index.js',
		sourceMapFilename: '[file].map',
	},
  	devServer: {
    	port: process.env.PORT || 8080,
      	host: HOST,
		port: PORT,
      	publicPath: '/',
      	contentBase: './src',
  	},
	resolve: {
		extensions: ['.js', '.jsx', '.css'],
		modules: [ASSET_PATH, 'node_modules']
	},
	module: {
		rules: [{
			test: /\.js$/,
			exclude: [/node_modules/],
			use: [{
				loader: 'babel-loader',
				options: { presets: ['es2015'] }
			}],
		},
		{
			test: /\.css$/,
			use: ExtractTextPlugin.extract({
				fallback: "style-loader",
				use: [
					"css-loader",
					"postcss-loader"
				]
			}),
		}],
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new ExtractTextPlugin("app.css"),
		new HtmlWebpackPlugin({
             template: './src/index.html',
             minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
            }
		})
	],
	devtool: "cheap-eval-source-map"
};