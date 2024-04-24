const Marked = require("marked");
const fs = require("fs");

module.exports = (path, cb) => {
  fs.readFile(path, { encoding: "utf-8" }, (err, data) => {
    if (err) {
      return cb(err);
    }
    Marked.parse(data, cb);
  });
};
