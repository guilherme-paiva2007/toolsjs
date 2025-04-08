const path = require("path");

const Component = require( "../src/node/component" );
const { Page } = require( "../src/index.js" );

/**
 * 
 * @param {import("../src/node/server.js")} server 
 */
module.exports = function loadPages(server) {
    Page.clearCache();

    server.pages.clear();

    delete require.cache[require.resolve("./pages_list.js")];
    const { pages, components } = require("./pages_list.js");

    server.openPageDir(path.resolve(__dirname, "../assets/"), "/assets/");
    server.openPageList(pages, path.resolve(__dirname, "./pages/"));

    for (const c of components) {
        try {
            server.components.add(new Component(c.name, path.resolve(__dirname, "./components/", c.filelocation), c.type));
        } catch(err) {
            console.error(`${err?.name ?? "Error"} loading ${c?.name} component: ${err?.message}`);
        }
    }

    console.log(`Loaded ${server.pages.length} pages.`);
    console.log(`Loaded ${server.components.length} components.`);
}