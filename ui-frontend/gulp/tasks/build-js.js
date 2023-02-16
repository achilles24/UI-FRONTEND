const babelify = require("babelify");
const browserify = require("gulp-bro");
const gulpif = require("gulp-if");
const uglify = require("gulp-uglify");
const html = require("html-browserify");
const twigify = require("twigify");

const PKG = require("../../package.json");

const BABEL_OPTIONS = {
  sourceMaps: "inline",
  presets: [
    [
      "env",
      {
        useBuiltIns: true,
        debug: false,
        targets: { browsers: PKG.browserslist },
      },
    ],
    "stage-3",
  ],
  plugins: ["lodash"],
};

function main({ config, gulp }) {
  const browserifyOptions = {
    debug: !config.minifyAssets,
    transform: [babelify.configure(BABEL_OPTIONS), html, twigify],
  };

  if (config.isDownstream) {
    browserifyOptions.noParse = [config.paths.aemCommons.jsBundle];
  }

  function buildJs() {
    return gulp
      .src(config.paths.browserifyEntry, { base: config.paths.srcDir })
      .pipe(browserify(browserifyOptions))
      .pipe(gulpif(config.minifyJs, uglify()))
      .pipe(gulp.dest(config.paths.buildDir));
  }

  return { "build:js": buildJs };
}

module.exports = main;
