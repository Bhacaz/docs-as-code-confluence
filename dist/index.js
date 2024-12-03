/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 312:
/***/ ((module) => {

class SyncConfluence {
  constructor(confluenceApi, spaceKey) {
    this.spaceKey = spaceKey;
    this.confluenceApi = confluenceApi;
  }

  getPageIdByTitle(title) {
    return new Promise((resolve) => {
      this.confluenceApi.getContentByPageTitle(
        this.spaceKey,
        title,
        (err, data) => {
          if (err) {
            resolve(undefined);
          } else {
            if (data.results[0]) {
              resolve(data.results[0].id);
            } else {
              resolve(undefined);
            }
          }
        }
      );
    });
  }

  getPageVersion(pageId, cb) {
    return this.confluenceApi.getContentById(pageId, (err, data) => {
      if (err) {
        console.error(err);
        process.exit(1);
      } else {
        cb(data.version.number);
      }
    });
  }

  createEmptyParentPage(title, parentId) {
    return new Promise((resolve) => {
      this.confluenceApi.postContent(
        this.spaceKey,
        title,
        "",
        parentId,
        (err, data) => {
          if (err) {
            console.error(err);
            process.exit(1);
          } else {
            resolve(data.id);
          }
        }
      );
    });
  }

  putContent(pageId, title, content) {
    this.getPageVersion(pageId, (version) => {
      this.confluenceApi.putContent(
        this.spaceKey,
        pageId,
        version + 1,
        title,
        content,
        (err, data) => {
          if (err) {
            console.error(err);
            process.exit(1);
          } else {
            console.log("Uploaded content successfuly to page %s", data._links.base + data._links.webui);
          }          
        },
        false,
        "editor2"
      );
    });
  }

  getAttachments(pageId) {
    return new Promise((resolve) => {
      this.confluenceApi.getAttachments(
          this.spaceKey,
          pageId,
          (err, data) => {
            if (err) {
              console.error(err);
              process.exit(1);
            } else {
              if (data.results[0]) {
                resolve(data.results);
              } else {
                resolve(undefined);
              }
            }
          }
      );
    });
  }

  updateAttachment(pageId, attachmentId, source) {
    return new Promise((resolve) => {
      this.confluenceApi.updateAttachmentData(
          this.spaceKey,
          pageId,
          attachmentId,
          source,
          (err, data) => {
            if (err) {
              console.error(err);
              process.exit(1);
            } else {
              if (data) {
                resolve(data);
              } else {
                resolve(undefined);
              }
            }
          }
      );
    });
  }

  uploadAttachment(pageId, source) {
    return new Promise((resolve) => {
      this.confluenceApi.createAttachment(
          this.spaceKey,
          pageId,
          source,
          (err, data) => {
            if (err) {
              console.error(err);
              process.exit(1);
            } else {
              if (data.results[0]) {
                resolve(data.results[0]);
              } else {
                resolve(undefined);
              }
            }
          }
      );
    });
  }
}

module.exports = SyncConfluence;


/***/ }),

/***/ 671:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fs = __nccwpck_require__(896);
const path = __nccwpck_require__(928);

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


/***/ }),

/***/ 719:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const Marked = __nccwpck_require__(503);
const fs = __nccwpck_require__(896);

module.exports = (path, cb) => {
  fs.readFile(path, { encoding: "utf-8" }, (err, data) => {
    if (err) {
      return cb(err);
    }
    Marked.parse(data, cb);
  });
};


/***/ }),

/***/ 984:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 822:
/***/ ((module) => {

module.exports = eval("require")("confluence-api");


/***/ }),

/***/ 503:
/***/ ((module) => {

module.exports = eval("require")("marked");


/***/ }),

/***/ 81:
/***/ ((module) => {

module.exports = eval("require")("node-html-parser");


/***/ }),

/***/ 896:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 928:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
const Confluence = __nccwpck_require__(822);
const core = __nccwpck_require__(984);
const parser = __nccwpck_require__(81)
const path = __nccwpck_require__(928)

const filesStructure = __nccwpck_require__(671);
const SyncConfluence = __nccwpck_require__(312);
const markdownToHtml = __nccwpck_require__(719);

const root = "./" + core.getInput("folder", { required: true }) + "/";
const spaceKey = core.getInput("space-key", { required: true });
const rootParentPageId = core.getInput("parent-page-id", { required: true });

const config = {
  username: core.getInput("username", { required: true }),
  password: core.getInput("password", { required: true }),
  baseUrl: core.getInput("confluence-base-url", { required: true }),
};

const confluenceAPI = new Confluence(config);
const syncConfluence = new SyncConfluence(
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
  return html.toString()
}

async function main() {
  const files = filesStructure(root);
  if (!files.length) {
    console.log("No markdown files found in %s", root);
  }
  for (const f of files) {
    let path = f.join("/");
    let currentParentPageId = rootParentPageId;
    let pathsInRoot = root.split("/");
    let newRoot= root;       
    if(pathsInRoot.length > 1){
        newRoot = pathsInRoot[0] + "/"
        console.log("Root for action includes subfolder. Assigning root as: " +  newRoot)
    }
    for (const subPath of f) {
      if (subPath.includes(".md")) {
        let pageTitle = subPath.replace(".md", "");
        let contentPageId = await findOrCreatePage(
          pageTitle,
          currentParentPageId
        );
        markdownToHtml(root + path,  async (err, data) => {
          if(err) {
            console.log(err);
          }
          let htmlContent = await handleAttachments(contentPageId, data);
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

module.exports = __webpack_exports__;
/******/ })()
;