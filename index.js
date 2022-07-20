const Confluence = require("confluence-api");
const filesStructure = require("./files");
const SyncConflence = require("./confluence");
const markdownToHtml = require("./markdownToHtml");
const core = require("@actions/core");
const parser = require("node-html-parser")

const root = "./" + core.getInput("folder", { required: true }) + "/";
const spaceId = core.getInput("space-id", { required: true });
const rootParentPageId = core.getInput("parent-page-id", { required: true });
const path = require('path')

const config = {
  username: core.getInput("username", { required: true }),
  password: core.getInput("password", { required: true }),
  baseUrl: core.getInput("confluence-base-url", { required: true }),
};

const confluenceAPI = new Confluence(config);
const syncConfluence = new SyncConflence(
  confluenceAPI,
  spaceId,
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
  const existingAttachments = await syncConfluence.getAttachments(pageId)
  for (let attachment of existingAttachments) {
    if (attachment.title === path.basename(attachmentSource)) {
      return await syncConfluence.updateAttachment(pageId, attachment.id, attachmentSource);
    }
  }
  return await syncConfluence.uploadAttachment(pageId, attachmentSource);
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
        markdownToHtml(root + path, async (err, data) => {
          const html = parser.parse(data);
          const images = html.querySelectorAll("img")
          for (var image of images) {
            var attachment = await uploadAttachment(image.getAttribute("src").replace("..", "."), contentPageId);
            image.replaceWith(parser.parse('<ac:image><ri:attachment ri:filename=' + attachment.title +' /></ac:image>'));
          }
          syncConfluence.putContent(contentPageId, pageTitle, html.toString());
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
