const fs = require("fs");
var buffer = require("safe-buffer").Buffer;

function getFileContents(path) {
  return fs.readFileSync(path, "utf8");
}

function getTagsFromtext(text) {
  return text.match(/{%(.*?)%}/g);
}

module.exports = {
  processFile: () => {
    function transform(file, cb) {
      let contents = String(file.contents);
      let tags = getTagsFromtext(contents);

      if (tags !== null && tags.length > 0) {
        for (let i = 0; i < tags.length; i++) {
          let partialPath = tags[i].replace("{%", "").replace("{%", "").trim();
          try {
            let partial = getFileContents(partialPath);
            contents = contents.replace(tags[i], partial);
          } catch (error) {
            console.error(`Partial: '${partialPath}' not found!`);
          }
        }
      }
      file.contents = Buffer.from(contents);
      cb(null, file);
    }
    return require("event-stream").map(transform);
  },
};
