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
