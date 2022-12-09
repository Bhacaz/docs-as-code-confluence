const Confluence = require("confluence-api");
const filesStructure = require("./files");
const SyncConflence = require("./confluence");
const markdownToHtml = require("./markdownToHtml");
const core = require("@actions/core");
const parser = require("node-html-parser")
const path = require('path')

const root = "./" + 'docs/' // core.getInput("folder", { required: true }) + "/";
const spaceKey = '~661332374' // core.getInput("space-id", { required: true });
const rootParentPageId = '1282506753' // core.getInput("parent-page-id", { required: true });

const config = {
  username: 'jfbastien@petalmd.com', // core.getInput("username", { required: true }),
  password: 'BmVpYrzsXp8lby9gx6UlDDB3', //core.getInput("password", { required: true }),
  baseUrl: 'https://petalmd.atlassian.net/wiki' // core.getInput("confluence-base-url", { required: true }),
};

const confluenceAPI = new Confluence(config);
const syncConfluence = new SyncConflence(
  confluenceAPI,
  spaceKey,
  rootParentPageId
);

const cachedPageIdByTitle = {};

async function findOrCreatePage(pageTitle, parentPageId) {
  let pageId;
  if (cachedPageIdByTitle[pageTitle]) {
    pageId = cachedPageIdByTitle[pageTitle];
  } else {
    pageId = await syncConfluence.getPageIdByTitle(pageTitle);
    if (pageId) {
    } else {
      pageId = await syncConfluence.createEmptyParentPage(
        pageTitle,
        parentPageId
      );
    }
    cachedPageIdByTitle[pageTitle] = pageId;
  }
  return pageId;
}

async function uploadAttachment(attachmentSource, pageId) {
  attachmentSource = root + attachmentSource;
  const existingAttachments = await syncConfluence.getAttachments(pageId)
  if (existingAttachments) {
    for (let attachment of existingAttachments) {
      if (attachment.title === path.basename(attachmentSource)) {
        return await syncConfluence.updateAttachment(pageId, attachment.id, attachmentSource);
      }
    }
  }
  return await syncConfluence.uploadAttachment(pageId, attachmentSource);
}

async function handleAttachments(contentPageId, data) {
  const html = parser.parse(data);
  const images = html.querySelectorAll("img")
  for (var image of images) {
    const attachmentSource = image.getAttribute("src");
    // TODO handle remote images
    if (attachmentSource.includes("http")) { continue; }
    var attachment = await uploadAttachment(attachmentSource.replace("..", "."), contentPageId);
    image.replaceWith(parser.parse('<ac:image><ri:attachment ri:filename=' + attachment.title +' /></ac:image>'));
  }
  return await html.toString()
}

async function main() {
  for (const f of filesStructure(root)) {
    let path = f.join("/");
    let currentParentPageId = rootParentPageId;
    for (const subPath of f) {
      if (subPath.includes(".md")) {
        let pageTitle = subPath.replace(".md", "");
        let contentPageId = await findOrCreatePage(
          pageTitle,
          currentParentPageId
        );
        markdownToHtml(root + path,  (err, data) => {
          let htmlContent = await handleAttachments(contentPageId, data);
          console.log(htmlContent);
          syncConfluence.putContent(contentPageId, pageTitle, htmlContent);
        });
      } else {
        currentParentPageId = await findOrCreatePage(
          subPath,
          currentParentPageId
        );
      }
    }
  }
}

main();
