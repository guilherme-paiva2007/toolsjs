/**
 * @typedef {import("../src/node/page.js").PageListObject} PageListObject
 */
/**
 * @typedef {{
 *      filelocation: string,
 *      name: string,
 *      type: "hypertext" | "execute"
 * }} ComponentListObject
 */

/**
 * @type {{
 *      pages: PageListObject[],
 *      components: ComponentListObject[]
 * }}
 */
module.exports = {
    pages: [
        {
            filelocation: "docs.html",
            pagelocation: "/docs"
        },
        {
            filelocation: "index.html",
            pagelocation: [ "/", "/index", "/main", "/home" ]
        }
    ],
    components: [
        {
            filelocation: "text.js",
            name: "text",
            type: "execute"
        },
        {
            filelocation: "session_id.js",
            name: "sessionId",
            type: "execute"
        },
        {
            filelocation: "apis.js",
            name: "apis",
            type: "execute"
        }
    ]
}