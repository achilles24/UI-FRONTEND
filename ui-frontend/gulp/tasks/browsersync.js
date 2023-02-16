const BrowserSync = require("browser-sync");

function main({ config }) {
  function browserSync() {
    const browserSync = BrowserSync.create();
    const { buildDir } = config.paths;

    return browserSync.init({
      open: false,
      notify: false,
      files: `${buildDir}/**/*.*`,
      server: buildDir,
    });
  }
  return { "browser-sync": browserSync };
}

module.exports = main;
