
//  python markdown-to-confluence.py --api_url=https://petalmd.atlassian.net/wiki/rest/api --username jfbastien@petalmd.com --password vFPMWOKtsrFBn5XHro10BC4E --space ~661332374 --ancestor_id 1028915542 test.md

// ---
// layout: "test"
// title: "Test"
// wiki:
//   share: true
// ---
//
// # Hello world form docker

// var Marked = require("marked")
// const fs = require('fs')
//
// var Confluence = require("confluence-api");
// var config = {
//     username: "jfbastien@petalmd.com",
//     password: "vFPMWOKtsrFBn5XHro10BC4E",
//     baseUrl:  "https://petalmd.atlassian.net/wiki"
// };
// var confluence = new Confluence(config);

// confluence.getSpace("~661332374", function(err, data) {
//     // do something interesting with data; for instance,
//     // data.results[0].body.storage.value contains the stored markup for the first
//     // page found in space 'space-name' matching page title 'page-title'
//     console.log(data);
// });

// confluence.getContentByPageTitle("~661332374", "Docs as code Test", function(err, data) {
//     console.log(data.results[0].body);
// });

// fs.readFile('./docs/Home.md', 'utf8' , (err, data) => {
//     if (err) {
//         console.error(err)
//         return
//     }
//     console.log(data)
//     Marked.parse(data, function(err, data) {
//         console.log(err)
//         console.log(data)
//         confluence.postContent("~661332374", "Hello", data, "1028915542", function(err, data) {
//             console.log(data)
//         });
//     })
// })

// Marked.parse("./docs", function(err, data) {
//     console.log(err)
//     console.log(data)
// })


const Confluence = require("confluence-api");
const filesStructure = require('./files')
const SyncConflence = require("./confluence")

const root = './docs/';
const spaceId = "~661332374";
const rootParentPageId = "1028915542";

const config = {
    username: "jfbastien@petalmd.com",
    password: "vFPMWOKtsrFBn5XHro10BC4E",
    baseUrl:  "https://petalmd.atlassian.net/wiki"
};

const confluenceAPI = new Confluence(config);
const syncConfluence = new SyncConflence(confluenceAPI, spaceId, rootParentPageId);

const cachedPageIdByTitle = {};

async function findOrCreatePage(pageTitle, parentPageId) {
    let pageId;
    if (cachedPageIdByTitle[pageTitle]) {
        pageId = cachedPageIdByTitle[pageTitle];
    } else {
        pageId = await syncConfluence.getPageIdByTitle(pageTitle)
        if (pageId) {
        } else {
            pageId = await syncConfluence.createEmptyParentPage(pageTitle, parentPageId)
        }
        cachedPageIdByTitle[pageTitle] = pageId
    }
    return pageId;
}

async function main() {
    for (const f of filesStructure(root)) {
        let path = f.join('/')
        let currentParentPageId = rootParentPageId;
        for(const subPath of f) {
            if (subPath.includes('.md')) {
                let pageTitle = subPath.replace('.md', '')
                // markdownForFile(root + path, (data, err) => {
                //     // console.log(data);
                // })
            } else {
                currentParentPageId = await findOrCreatePage(subPath, currentParentPageId)
            }
        }
    }
}

main()

