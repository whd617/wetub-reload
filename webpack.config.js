const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
   entry: {
      main: './src/client/js/main.js',
      videoPlayer: './src/client/js/videoPlayer.js',
      recorder: './src/client/js/recorder.js',
   },

   plugins: [
      new MiniCssExtractPlugin({
         filename: 'css/styles.css',
      }),
   ],
   mode: 'development',
   watch: true,
   output: {
      filename: 'js/[name].js',
      path: path.resolve(__dirname, 'assets'),
      clean: true, // output folder를 build를 시작하기 전에 clean 해주기
   },
   module: {
      rules: [
         {
            test: /\.js$/,
            use: {
               loader: 'babel-loader',
               options: {
                  presets: [['@babel/preset-env', { targets: 'defaults' }]],
               },
            },
         },
         {
            test: /\.scss$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'], // 역순임을 기억하자(뒤에서부터 시작)
         },
      ],
   },
};
