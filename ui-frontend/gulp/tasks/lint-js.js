const eslint = require("gulp-eslint");

function main({ config, gulp }) {
  function lintJs() {
    const sources = gulp.src([
      "gulpfile.js",
      "gulp/**/*.js",
      "src/**/*.js",
      "!src/js/config.js",
    ]);

    return sources
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  }

  return { "lint:js": lintJs };
}

module.exports = main;
