const assert = require("assert");
const glob = require("globby");
const gulp = require("gulp");
const _ = require("lodash");
const config = require("./gulp/config");
const { format, mkdir } = require("./gulp/util");
const files = require("./gulp/files");
const pkg = require("./package.json");
const del = require("del");

// 1) Set up a default build task for each resource type, which copies the resources from the source directory
//    to the same location in the build directory e.g.:
//
//    src/css/example.css -> build/css/example.css
//
// 2) Set up corresponding watch tasks which invoke the build task whenevera resource of the specified type is modified.
//
// the default build tasks are overridden by tasks in gulp/tasks/*.js for the resources which are (pre-)processed
// in any way i.e. Sass, Javascript etc.
for (const type of config.resourcesTypes) {
  const buildTask = `build:${type}`;
  const src = config.paths.src[type];

  // create a build task for this type which just copies the resources to the destination directory.
  gulp.task(buildTask, () => {
    return gulp
      .src(src, { base: config.paths.srcDir })
      .pipe(gulp.dest(config.paths.buildDir));
  });

  // create a watch task which involves the build task whenver a resource of this type is modified.
  gulp.task(`watch:${type}`, () => {
    return gulp.watch(src, gulp.registry().get(buildTask));
  });
}

// load each task spec in gulp/tasks/*.js.
//
// each file exports an object with task-name (string) => task (function) pairs e.g.:
//
//  {
//         "build:foo": function () { ... }
//         "build:bar": function () { ... }
//  }
glob.sync(`${config.paths.taskDir}/**/*.js`).forEach((taskPath) => {
  const main = require(`./${taskPath}`) || _.noop;
  assert(
    _.isFunction(main),
    `invalid default export for ${taskPath}: must export a function`
  );

  const tasks = main({ config, gulp, pkg }) || {};

  _.each(tasks, (task, name) => {
    assert(_.isString(name), `invlid name (${name}): name must be a string`);
    assert(
      _.isFunction(task),
      `invlid task for (${name}): task must be a function`
    );
    gulp.task(name, task);
  });
});

gulp.task("rename-css", function () {
  return gulp
    .src(`${config.paths.buildDir}/css/index-portal.css`)
    .pipe(gulp.dest(`./${config.paths.buildDir}`));
});

gulp.task("rename-js", function () {
  return gulp
    .src(`${config.paths.buildDir}/js/index-portal.js`)
    .pipe(gulp.dest(`./${config.paths.buildDir}`));
});

gulp.task("copy-html", function () {
  return gulp
    .src(["src/*.html"], { base: "./src" })
    .pipe(files.processFile())
    .pipe(gulp.dest("./build/"));
});

gulp.task("watch-html", function () {
  return gulp.watch(
    ["src/*.html", "src/partials/*.html"],
    gulp.series("copy-html")
  );
});

gulp.task("del-partials", function (done) {
  del.deleteSync(["build/partials/**"]);
  done();
});

const buildTasks = config.resourcesTypes.map(format("build:%s"));
const watchTasks = config.resourcesTypes.map(format("watch:%s"));

buildTasks.splice(1, 0, "copy-html");
watchTasks[watchTasks.indexOf("watch:html")] = "watch-html";

watchTasks.splice(watchTasks.indexOf("watch:partials", 1));

gulp.task("build:assets", gulp.parallel(buildTasks));
gulp.task("watch:assets", gulp.parallel(watchTasks));
gulp.task(
  "build",
  gulp.parallel("build:doc", gulp.series("expand-templates", "build:assets"))
);
gulp.task("build:dist", gulp.series("build", mkdir("distDir")));
gulp.task(
  "build:release",
  gulp.series("clean", "lint:js", "build:dist", "rename-css", "rename-js")
);
gulp.task(
  "serve",
  gulp.series("build:assets", gulp.parallel("watch:assets", "browser-sync"))
);
gulp.task("default", gulp.task("serve"));
