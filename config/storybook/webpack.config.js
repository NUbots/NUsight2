const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = (baseConfig, configType) => {
  baseConfig.module.rules.push(
    // .ts, .tsx
    {
      test: /\.(ts|tsx)$/,
      include: path.resolve(__dirname, '../../'),
      loader: require.resolve('awesome-typescript-loader'),
    },
    {
      test: /\.css$/,
      exclude: [
        path.resolve(__dirname, 'node_modules'),
      ],
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          {
            loader: 'css-loader',
            query: {
              modules: true,
              sourceMap: true,
              importLoaders: 1,
              localIdentName: '[local]__[hash:base64:5]',
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: loader => [
                require('postcss-import')({ root: loader.resourcePath }),
                require('postcss-url')(),
                require('postcss-cssnext')(),
                require('postcss-reporter')(),
                require('postcss-browser-reporter')(),
              ],
            },
          },
        ],
      }),
    },
    {
      test: /\.svg$/,
      use: [
        {
          loader: 'babel-loader',
          query: {
            presets: ['env'],
          },
        },
        {
          loader: 'react-svg-loader',
          query: {
            svgo: {
              // svgo options
              plugins: [{ removeTitle: true }],
              floatPrecision: 2,
            },
          },
        },
      ],
    },
    // static assets
    { test: /\.html$/, use: 'html-loader' },
    { test: /\.png$/, use: 'url-loader?limit=10000' },
    { test: /\.jpg$/, use: 'file-loader' },
    { test: /\.vert$/, use: 'raw-loader' },
    { test: /\.frag$/, use: 'raw-loader' },
  )
  baseConfig.plugins.push(
    new ExtractTextPlugin({
      filename: 'styles.css',
    }),
  )
  baseConfig.resolve.extensions.push('.ts', '.tsx')

  return baseConfig
}

// module.exports = {
//   resolve: {
//     extensions: ['.ts', '.tsx'],
//   },
//   module: {
//     rules: [
//       {
//         test: /\.tsx?$/,
//         //include: path.resolve(__dirname, '../../src'),
//         use: require.resolve('awesome-typescript-loader'),
//       },
//     ]
//   }
// }

