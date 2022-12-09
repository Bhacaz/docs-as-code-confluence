class SyncConfluence {
  constructor(confluenceApi, spaceId) {
    this.spaceId = spaceId;
    this.confluenceApi = confluenceApi;
  }

  getPageIdByTitle(title) {
    return new Promise((resolve) => {
      this.confluenceApi.getContentByPageTitle(
        this.spaceId,
        title,
        (err, data) => {
          if (err) {
            console.error(err);
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
      } else {
        cb(data.version.number);
      }
    });
  }

  createEmptyParentPage(title, parentId) {
    return new Promise((resolve) => {
      this.confluenceApi.postContent(
        this.spaceId,
        title,
        "",
        parentId,
        (err, data) => {
          if (err) {
            console.error(err);
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
        this.spaceId,
        pageId,
        version + 1,
        title,
        content,
        (err, data) => {
          if (err) {
            console.error(err);
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
          this.spaceId,
          pageId,
          (err, data) => {
            if (err) {
              console.error(err);
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
          this.spaceId,
          pageId,
          attachmentId,
          source,
          (err, data) => {
            if (err) {
              console.error(err);
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
          this.spaceId,
          pageId,
          source,
          (err, data) => {
            if (err) {
              console.error(err);
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
