const del = require("del");

function main({ config }) {
  function clean() {
    return del([config.paths.buildDir, config.paths.distDir]);
  }

  return { clean };
}

module.exports = main;
