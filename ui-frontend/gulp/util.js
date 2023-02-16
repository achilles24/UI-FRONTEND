const assert = require("assert");
const gulp = require("gulp");
const _ = require("lodash");
const makeDir = require("make-dir");
const { sprintf } = require("sprintf-js");
const config = require("./config");

/*
 * format (template: string) => ((...args: Array<any>) -> string)
 * takes an sprintf template & returns a function which format its arguments with that templates
 * used to provide an easy way to format a collections of values.
 *
 * [1, 2, 3].map(format("[%d]")) // [ "[1]", "[2]", "[3]"]
 */
function format(template) {
  return _.partial(sprintf, template);
}

/*
 * printf (template: string, ...args: Array<any>) -> void
 *
 * print the `sprintf`-style arguments to the console with `console.log`.
 * an alternative to  concatenating strings with `console.log`
 *
 * e.g.:
 *   before:
 *       console.log(
 *           'url: '
 *           + url +
 *           + ', result: '
 *           + JSON.stringify(result)
 *       )
 *
 *   after:
 *
 *       printf('url: %s, result: %j', url, result)
 *
 * uses sprintf-js, whih supports pretty printing JSON objects e.g.:
 *
 *       printf('object: %j', {...}) // compact
 *       printf('object: %4j', {...}) // pretty-printed with 4-space indent
 */
function printf(...args) {
  if (args.length < 2) {
    args = ["%s"].concat(args);
  }
  return console.log(sprintf.apply(null, args));
}

/*
 * mkdir (path: string,) -> string
 *
 * returns the name of a task which creates the specified directory,
 * creating the task if it doesn't exist. the path should be a dotted path into config.paths i.e.
 *
 *   mkdir("doc.destDir") is equivalent to:
 *
 *       function mkdir () { return makeDir(config.paths.doc.destDir) }
 *
 *   no error is raised if the directory exists i.e. the behaviour is the same as: mkdir -p
 *
 *   the path is registered as `mkdir:<path>` in the gulp registry so that it shows up by name in the ouput of
 *
 *       gulp --tasks
 */
function createMkdirTask(path) {
  const dir = _.get(config.paths, path);
  assert(dir, `path not found: ${path}`);

  const taskName = `mkdir:${path}`;
  const task = gulp.task(taskName);

  if (!task) {
    const mkdir = (done) => makeDir(dir);
    gulp.task(taskName, mkdir);
  }

  return taskName;
}

module.exports = { format, printf, mkdir: createMkdirTask };
