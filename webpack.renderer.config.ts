import type { Configuration } from 'webpack'

import { rules } from './webpack.rules'
import { plugins } from './webpack.plugins'

rules.push({
    test: /\.css$/,
    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
})

rules.push({
    test: /\.scss$/,
    use: ['style-loader', 'css-loader', 'sass-loader'],
})
rules.push({
    test: /\.svg$/,
    use: ['@svgr/webpack'],
})

export const rendererConfig: Configuration = {
    module: {
        rules,
    },
    plugins,
    resolve: {
        fallback: {
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            os: require.resolve('os-browserify'),
            url: require.resolve('url'),
        },
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    },
}
