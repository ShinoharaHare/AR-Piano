const fs = require('fs')
const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: path.resolve(__dirname, 'src/main.ts'),
    devServer: {
        port: 80,
        compress: true,
        disableHostCheck: true
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        mainFiles: ['index', 'hands', 'drawing_utils'],
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
            'ar-threex': '@ar-js-org/ar.js/three.js/build/ar-threex.js'
        }
    },
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'src/vendor')
                ],
                use: ['script-loader']
            }
        ],
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'AR Piano',
            template: './src/public/index.ejs',
            filename: 'index.html',
            inject: true
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    context: 'src',
                    from: 'public',
                    globOptions: {
                        ignore: ['**/*.ejs'],
                    }
                }
            ]
        })
    ]
};
