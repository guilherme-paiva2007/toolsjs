module.exports = function execute({ server }) {
    let pages = [];
    for (const page of server.pages.values()) {
        pages.push({
            path: page.path,
            contenttype: page.contentType
        });
    }
    return JSON.stringify(pages);
}