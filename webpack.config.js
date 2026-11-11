const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        content: './src/content.ts',
        popup: './src/popup.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        clean: true
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'manifest.json', to: 'manifest.json' },
                // 圧縮で invert(1) が invert() に書き換わるのを避けるため、圧縮済みとして扱わせる
                { from: 'src/dark.css', to: 'dark.css', info: { minimized: true } },
                { from: 'src/popup.html', to: 'popup.html' },
                { from: 'src/popup.css', to: 'popup.css' },
                { from: 'icons', to: 'icons' },
                { from: '_locales', to: '_locales' }
            ]
        })
    ],
    optimization: {
        minimize: true
    },
    devtool: false
};
