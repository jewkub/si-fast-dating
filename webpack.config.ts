import * as path from 'path';
import * as webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import CopyPlugin from 'copy-webpack-plugin';

const config: webpack.Configuration = {
  entry: './src/server.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: 'static',
          to: 'static'
        },
        'package.json',
        'app.yaml',
        'env_variables.yaml',
        '.gcloudignore',
      ],
    }),
  ],
  target: 'node',
  externals: [nodeExternals()],
  mode: 'production',
};

export default config;
