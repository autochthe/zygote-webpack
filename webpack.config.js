'use strict';

// Project settings

let project = 'visualizer';
let library = 'Visualizer';
let externals = {
	"react": "React",
	"react-dom": "ReactDOM",
};



// Build system

let webpack = require('webpack');
let FailPlugin = require('webpack-fail-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let ArchivePlugin = require('webpack-archive-plugin');
let nodeExternals = require('webpack-node-externals');

let options = {
	dev: process.argv.indexOf('--dev') != -1,
	dist: process.argv.indexOf('--dist') != -1,
	lib: process.argv.indexOf('--lib') != -1,
	default: process.argv.indexOf('--dev') == -1
		&& process.argv.indexOf('--dist') == -1
		&& process.argv.indexOf('--lib') == -1,
};

let base = {
	context: __dirname + "/src",
	entry: './main.tsx',
	module: {
		loaders: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
			},
			{
				test: /\.s?css$/,
				loader: ExtractTextPlugin.extract("css-loader?sourceMap!sass-loader?sourceMap"),
			},
		],
		preLoaders: [
			{
				test: /\.(css|js)$/,
				loader: "source-map-loader",
			}
		],
	},
	devtool: 'source-map',
};

let production_plugins = [
	FailPlugin,
	new webpack.DefinePlugin({
		'process.env.NODE_ENV': '"production"'
	}),
	new webpack.optimize.UglifyJsPlugin(),
	new webpack.optimize.OccurenceOrderPlugin(),
	new webpack.optimize.DedupePlugin(),
]

let dist = Object.assign({},base, {
	output: {
		path: __dirname + '/dist/dist',
		filename: project + '.js',
		library: library,
		libraryTarget: "var",
	},
	externals: externals,
	plugins: [
		FailPlugin,
		new ArchivePlugin(),
		new ExtractTextPlugin(project + '.css'),
	],
});

let dist_min = Object.assign({},dist, {
	output: {
		path: __dirname + '/dist/dist-min',
		filename: project + '.min.js',
		library: library,
		libraryTarget: "var",
	},
	plugins: [
		FailPlugin,
		new ExtractTextPlugin(project + '.min.css'),
		new ArchivePlugin(),
		...production_plugins,
	],
});

let libexternals = {}
for(let key in externals) {
	if(externals.hasOwnProperty(key)) {
		libexternals[key] = true;
	}
}
let lib = Object.assign({},dist, {
	output: {
		path: __dirname + '/lib',
		filename: project + '.js',
		library: library,
		libraryTarget: "commonjs2",
	},
	externals: libexternals,
	plugins: [
		FailPlugin,
		new ExtractTextPlugin(project + '.css'),
	],
});

let development = Object.assign({},base, {
	entry: '../dev/dev.tsx',
	output: {
		path: __dirname + '/dev/dist',
		filename: 'dev.js',
		library: "Dev",
		libraryTarget: "var",
	},
	plugins: [
		FailPlugin,
		new ExtractTextPlugin('dev.css'),
	],
});


let targets = [];
if(options.dev || options.default) {
	targets.push(development);
}
if(options.dist || options.default) {
	targets.push(dist, dist_min);
}
if(options.lib || options.default) {
	targets.push(lib);
}
module.exports = targets;
