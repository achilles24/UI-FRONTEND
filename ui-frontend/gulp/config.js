const glob = require("globby");
const _ = require("lodash");
const Path = require("path");
const root = require("root-path");

// paths are relative to the application root directory
const BUILD_DIR = "build";
const DIST_DIR = "dist";
const GULP_DIR = "gulp";
const RESOURCE_DIR = "resources";
const ROOT_DIR = root();
const SOURCE_DIR = "src";

// rather than hardwiring the source directory's resource type (e.g: CSS, images etc.), infer them from the
// directory names (i.e. css, img etc.). exception are included statically e.g. HTML files, in the top-level (src/*.html)

// If a subdirectory path matches an already defined path, the globs are merged.
// e.g.:
//     { html: { src: "src/*.html" } }
//     { html: { src: "src/html/**/*.*" } }
//     { html: { src: [ "src/*.html", "src/html/**/*.*" ] } }

const env = process.env.NODE_ENV;

const config = {
  isDev: /^dev(elopment)?$/.test(env),
  idDownstream: false,
  isProd: env === "production",
  isUpstream: true,
  paths: {
    browserifyEntry: `${SOURCE_DIR}/js/index*.js`,
    buildDir: BUILD_DIR,
    distDir: DIST_DIR,
    gulpDir: GULP_DIR,
    rootDir: ROOT_DIR,
    srcDir: SOURCE_DIR,
    taskDir: `${GULP_DIR}/tasks`,
    templateDir: `${RESOURCE_DIR}/templates`,

    doc: {
      srcFile: "README.md",
      destDir: `${BUILD_DIR}/docs`,
      destFile: "index.html",
    },

    src: {
      html: `${SOURCE_DIR}/*.html`,
    },
  },
};

// only minify the Javascript/CSS bundles if NODE_ENV is not explicitly set to development or production mode.
//
// If it's explicitly set to "dev"/"development" (e.g. via `npm run watch:dev`),
// don't minify (i.e. explicitly disable minification for troubleshooting).
//
// If it's explicitly set to "production" (e.g. via `npm run build:release`), don't minify as that's handled by AEM.
//
// Otherwise (default) minify, as the unminified bundle is too big (currently ~450K vs ~175K minified for the JS)
// to push to the browser on every change during development.

config.minifyAssets = !(config.isDev || config.isProd);

// set config.paths.src.<type> to "src/<type>/**/*.*"
// for each subdirectory in src/
//  e.g.:
//      config.paths.src.js = "src/js/**/*.*"
//
// this is used to set up default build & watch tasks
//  e.g.:
//      build:css & watch:css - which just copy the files. these are then overriden by tasks defined in gulp/tasks/*.js
//      for resource types which need processing e.g. build:js & build:sass

glob
  .sync(`${SOURCE_DIR}/*`, {
    onlyDirectories: true,
    expandDirectories: false,
    onlyFiles: false,
  })
  .forEach((dir) => {
    const type = Path.posix.basename(dir);
    const path = ["paths", "src", type];
    const oldValue = _.get(config, path);
    let newValue = `${SOURCE_DIR}/${type}/**/*.*`;
    if (oldValue) {
      newValue = _.uniq(_.castArray(oldValue).concat(newValue));
    }
    _.set(config, path, newValue);
  });

// add the absolute path to the Bootstrap stylesheets dir i.e the "bootstrap" dir referenced in the '@import "bootstrap/whatever" etc.
// imports in src/sass/index.scss (the absolute path ensures the path works regardless of where the including file in located in src).

config.paths.bootstrapSrcDir = Path.resolve(
  // bootstrap-sass's entry point is assets/javascript/bootstrap.js,
  // so navigate up from it to the stylesheets dir
  require.resolve("bootstrap-sass"),
  "../../stylesheets"
);

// now we've determined the resource types, exposes them as an array
config.resourcesTypes = _.keys(config.paths.src).sort();
module.exports = config;
