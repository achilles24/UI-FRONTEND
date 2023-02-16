const markdown2bootstrap = require("gulp-markdown2bootstrap");
const rename = require("gulp-rename");

function main({ config, gulp, pkg }) {
  function buildDoc() {
    const { doc } = config.paths;
    const options = { theme: "readable" };

    Object.defineProperty(options, "pkg", {
      value: pkg,
      writable: false,
    });

    return gulp
      .src(doc.srcFile)
      .pipe(markdown2bootstrap(options))
      .pipe(rename(doc.destFile))
      .pipe(gulp.dest(doc.destDir));
  }

  return { "build:doc": buildDoc };
}

module.exports = main;
