const Confluence = require("confluence-api");
const filesStructure = require('./files')
const SyncConflence = require("./confluence")
const markdownToHtml = require('./markdownToHtml')

const root = './docs/';
const spaceId = "~661332374";
const rootParentPageId = "1028915542";

const config = {
    username: "jfbastien@petalmd.com",
    password: "",
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
                let contentPageId = await findOrCreatePage(pageTitle, currentParentPageId)
                markdownToHtml(root + path, (err, data) => {
                    syncConfluence.putContent(contentPageId, pageTitle, data)
                })
            } else {
                currentParentPageId = await findOrCreatePage(subPath, currentParentPageId)
            }
        }
    }
}

main()
