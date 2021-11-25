const Marked = require("marked");
const fs = require("fs");

const markdownForFile = (path, cb) => {
  fs.readFile(path, { encoding: "utf-8" }, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    Marked.parse(data, cb);
  });
};

module.exports = markdownForFile;
