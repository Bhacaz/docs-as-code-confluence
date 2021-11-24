class SyncConfluence {
    constructor(confluenceApi, spaceId) {
        this.spaceId = spaceId;
        this.confluenceApi = confluenceApi
    }

    getPageIdByTitle(title) {
        return new Promise(resolve => {
            this.confluenceApi.getContentByPageTitle(this.spaceId, title, (err, data) => {
                if (err) {
                    console.error(err)
                } else {
                    resolve(data.results[0]?.id)
                }
            })
        })
    }

    getPageVersion(pageId, cb) {
        return this.confluenceApi.getContentById(pageId, (err, data) => {
            if (err) {
                console.error(err)
            } else {
                cb(data.version.number)
            }
        })
    }

    createEmptyParentPage(title, parentId) {
        return new Promise((resolve) => {
            this.confluenceApi.postContent(this.spaceId, title, '', parentId, (err, data) => {
                if (err) {
                    console.error(err)
                } else {
                    resolve(data.id)
                }
            })
        })
    }

    putContent(pageId, title, content) {
        this.getPageVersion(pageId, (version) => {
            console.log(version)
            this.confluenceApi.putContent(this.spaceId, pageId, version + 1, title, content, (err, data) => {
                if (err) {
                    console.error(err)
                }
            }, false, 'editor2')
        })
    }
}

module.exports = SyncConfluence;
