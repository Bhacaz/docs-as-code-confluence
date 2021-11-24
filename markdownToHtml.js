var Marked = require("marked")
const fs = require('fs')

const markdownForFile = (path, cb) => {
    fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        // console.log(data)
        Marked.parse(data, cb)
    })
}

module.exports = markdownForFile;
