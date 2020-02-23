import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import * as path from 'path'
import webpack from 'webpack'
import { getClientConfig } from '../../webpack.config'

export default ({ config: storybookConfig }: { config: webpack.Configuration }) => {
  const config = getClientConfig({
    mode: 'development',
    context: path.resolve(path.join(__dirname, '..', '..', 'src')),
    sourceMap: 'eval-source-map',
  })
  return {
    ...config,
    ...storybookConfig,
    module: {
      ...storybookConfig.module,
      rules: config.module && config.module.rules,
    },
    plugins: [
      ...storybookConfig.plugins || [],
      ...(config.plugins || []).filter(p => !(
          p instanceof HtmlWebpackPlugin // Storybook handles page generation.
          || p instanceof CopyWebpackPlugin // Avoids overwriting index.html.
        ),
      ),
    ],
    resolve: {
      ...storybookConfig.resolve,
      extensions: [
        ...(storybookConfig.resolve && storybookConfig.resolve.extensions || []),
        ...(config.resolve && config.resolve.extensions || []),
      ],
    },
  }
}
