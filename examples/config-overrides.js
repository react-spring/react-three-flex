const { override, addWebpackAlias, addWebpackPlugin, removeModuleScopePlugin, babelInclude } = require('customize-cra')
const { addReactRefresh } = require('customize-cra-react-refresh')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const path = require('path')

module.exports = (config, env) => {
  config.resolve.extensions = [...config.resolve.extensions, '.ts', '.tsx']
  return override(
    addReactRefresh(),
    removeModuleScopePlugin(),
    babelInclude([path.resolve('src'), path.resolve('../src')]),
    addWebpackAlias({
      'react-three-flex': path.resolve('../src/index'),
      postprocessing: path.resolve('node_modules/postprocessing'),
      react: path.resolve('node_modules/react'),
      'react-dom': path.resolve('node_modules/react-dom'),
      scheduler: path.resolve('node_modules/scheduler'),
      'react-scheduler': path.resolve('node_modules/react-scheduler'),
      'react-three-fiber': path.resolve('node_modules/react-three-fiber'),
      drei: path.resolve('node_modules/drei'),
      three$: path.resolve('./src/utils/three.js'),
      '../../../build/three.module.js': path.resolve('./src/utils/three.js'),
    }),
    //addWebpackPlugin(new BundleAnalyzerPlugin())
  )(config, env)
}
