const autoprefixer = require("autoprefixer");
const cleanCSS = require("gulp-clean-css");
const gulpif = require("gulp-if");
const postcss = require("gulp-postcss");
const sass = require("gulp-sass")(require("sass"));

function main({ config, gulp }) {
  function buildSass() {
    let includePaths;

    if (config.isUpstream) {
      includePaths = config.paths.bootstrapSrcDir;
    } else {
      includePaths = [
        config.aemCommons.paths.bootstrapSrcDir,
        config.paths.aemCommons.sassDir,
      ];
    }

    const sassConfig = { includePaths };

    if (config.minifyAssets) {
      sassConfig.outputStyle = "compressed";
    } else {
      sassConfig.outputStyle = "expanded";
      sassConfig.sourceComments = true;
    }

    return gulp
      .src(config.paths.src.sass)
      .pipe(sass(sassConfig).on("error", sass.logError))
      .pipe(postcss([autoprefixer()]))
      .pipe(gulpif(config.minifyAssets, cleanCSS({ level: 2 })))
      .pipe(gulp.dest(`${config.paths.buildDir}/css`));
  }

  return { "build:sass": buildSass };
}

module.exports = main;
