import browserSync from 'browser-sync';
import webpackStream from 'webpack-stream';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import path from 'path';
import fs from 'fs';

function getEntryPoints(dir) {
  const files = fs.readdirSync(dir)
    .filter(file => file.endsWith('.js') && !file.startsWith('_')) // ← добавили исключение
    .reduce((entries, file) => {
      const name = path.basename(file, '.js');
      entries[name] = path.resolve(dir, file);
      return entries;
    }, {});
  return files;
}

export const scripts = () => {
  const entry = getEntryPoints(app.paths.base.src + '/js');

  return app.gulp.src(app.paths.srcMainJs)
    .pipe(plumber(
      notify.onError({
        title: "JS",
        message: "Error: <%= error.message %>"
      })
    ))
    .pipe(webpackStream({
      mode: app.isProd ? 'production' : 'development',
      entry,
      output: {
        filename: '[name].js',
      },
      module: {
        rules: [{
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: "defaults"
                }]
              ]
            }
          }
        }]
      },
      devtool: !app.isProd ? 'source-map' : false
    }))
    .on('error', function (err) {
      console.error('WEBPACK ERROR', err);
      this.emit('end');
    })
    .pipe(app.gulp.dest(app.paths.buildJsFolder))
    .pipe(browserSync.stream());
}
