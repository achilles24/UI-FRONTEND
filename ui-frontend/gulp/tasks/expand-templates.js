const nunjucks = require("gulp-nunjucks");

function main({ config, gulp, pkg }) {
  const vars = Object.assign({}, config, { pkg });
  const nunjucksOptions = {
    autoescape: false,
    throwOnUndefined: true,
  };

  function expandtemplates() {
    return gulp
      .src(`${config.paths.templateDir}/**/*.*`)
      .pipe(nunjucks.compile(vars, nunjucksOptions))
      .pipe(gulp.dest("."));
  }

  return { "expand-templates": expandtemplates };
}

module.exports = main;
