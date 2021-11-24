const markdownForFile = require('./markdownToHtml')

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



}

module.exports = SyncConfluence;
