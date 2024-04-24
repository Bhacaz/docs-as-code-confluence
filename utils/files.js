const fs = require("fs");
const path = require("path");

const readdirSync = (p, a = []) => {
  if (fs.statSync(p).isDirectory())
    fs.readdirSync(p).map((f) => {
      readdirSync(a[a.push(path.join(p, f)) - 1], a);
    });
  return a;
};

const filesStructure = (root) => {
  return readdirSync(root)
    .filter((f) => {
      return f.endsWith(".md");
    })
    .map((f) => {
      let splitted = f.split("/");
      splitted.shift();
      return splitted;
    });
};

module.exports = filesStructure;
