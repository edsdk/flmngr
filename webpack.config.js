var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpack = require('webpack');

module.exports = {
    mode: 'development',
    devtool: false,
    entry: {
        'flmngr.js': path.resolve(__dirname, 'src/flmngr.ts'),
    },
    output: {
        filename: '[name]',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: "commonjs"
    },
    module: {
        rules: [
            {
                test: /\.s?css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader',
                        'sass-loader'
                    ]
                })
            },
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            onlyCompileBundledFiles: true,
                            compilerOptions: {
                                noEmit: false
                            }
                        }
                    }
                ],
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    //presets: ['es2015']
                }
            }
        ]
    },
    resolve: {
        modules: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'node_modules')
        ],
        extensions: ['.ts', '.js']
    },
    plugins: [
        new ExtractTextPlugin("[name]"),
        new webpack.BannerPlugin(
            "Developer: EdSDK\n" +
            "Website: https://flmngr.com/\n" +
            "License: Commercial EdSDK license\n"
        )
    ]
};