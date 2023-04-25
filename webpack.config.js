const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const WatchExternalFilesPlugin = require('webpack-watch-files-plugin').default;
const glob = require('glob');

const generateHtmlPlugins = (templateDir, entryPoint) => {
  const templateFiles = glob.sync(`${templateDir}/blogs/*.html`);
  return templateFiles.map(item => {
    const parts = item.split('/');
    const name = parts[parts.length - 1].replace('.html', '').replace("src\\", "");
    return new HtmlWebpackPlugin({
      filename: `${name}.html`,
      template: item,
      chunks: [entryPoint]
    });
  });
};

module.exports = {
    mode: 'development',
    devtool: 'eval-source-map',
    output: {
      path: path.resolve(__dirname, 'docs'),
      filename: '[name].bundle.js'
    },

    entry: {
      blog: './src/js/blog.js',
      index: './src/js/index.js',
      createBlog: './src/js/createBlog.js'
    },
    
    watch: true,
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'src/index.html',
        chunks: ['index']
      }),
      new HtmlWebpackPlugin({
        filename: 'createBlog.html',
        template: 'src/createBlog.html',
        chunks: ['createBlog']
      }),
      ...generateHtmlPlugins('./src', 'parser'),
      new HtmlWebpackPlugin({
        filename: 'blog.html',
        template: 'src/blog.html',
        chunks: ['blog']
      }),
      new WatchExternalFilesPlugin({
        files: [
          './src/blogsraw/**/*'
        ]
      }),
      new WebpackShellPluginNext({
        onDoneWatch: {
          scripts: ['node src/blogsBuild.js'],
          blocking: true,
          parallel: false
        },
      })
    ],
    module: {
        rules: [
            // ...
            {
              test: /\.css$/,
              use: ['style-loader', 'css-loader']
            },
        ]
    }
};