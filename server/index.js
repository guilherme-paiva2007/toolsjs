const { ServerManager } = require("../src/");
const loadPages = require("./pages_load.js");

const server = new ServerManager({ componentRequests: true, cacheContent: true });

loadPages(server);

const pagesSearchFlags = [ "--default", "--contentType", "--fileExt", "--fileName", "--pathName", "--pageType" ];
const pageSearchResultObjectAndPush = (arr, page) => {
    arr.push({ path: page.path, ["content-type"]: page.contentType, file: page.filelocation, type: page.pageType });
};
const componentsSearchFlags = [ "--default", "--type", "--fileName", "--fileExt" ];
const componentSearchResultObjectAndPush = (arr, component) => {
    arr.push({ name: component.name, file: component.filelocation, type: component.type });
}
const pathLib = require("path");

process.stdin.on("data", data => {
    data = data.toString("utf-8").replace("\r\n", "").trim();

    let params = data.split(" ").slice(1);
    let flags = params.filter(f => f?.startsWith("--"));
    
    if (data.startsWith("pages")) {
        if (params[0] === "reload" || params[0] === "restart") return loadPages(server);

        if (params[0] === "length" || params[0] === "count") return console.log(`There's currently ${server.pages.length} pages in the server.`);

        if (params[0] === "search" || params[0] === undefined) {
            let search = params[0] === "search" ? params[1] ?? "" : "";
            
            let sFlags = params.filter(f => f?.startsWith("--") && pagesSearchFlags.includes(f));
            let flag = sFlags.length > 0 ? sFlags[sFlags.length - 1] : "--default";

            if (flag === "--default" && !search.startsWith("/")) search = "/" + search;
            if (flag === "--fileExt" && !search.startsWith(".")) search = "." + search;

            let searchSide = flags.includes("--fromEnd") ? "endsWith" : "startsWith";
            search = searchSide === "endsWith" ? (search.startsWith("/") ? search.slice(1) : search) : search

            let searchResult = [];
            for (const [path, page] of server.pages.entries()) {
                switch (flag) {
                    default:
                    case "--default":
                        if (path[searchSide](search)) pageSearchResultObjectAndPush(searchResult, page);
                        break;
                    case "--contentType":
                        if (page.contentType[searchSide](search)) pageSearchResultObjectAndPush(searchResult, page);
                        break;
                    case "--fileExt":
                        let fileExt = pathLib.parse(page.filelocation).ext;
                        if (fileExt[searchSide](search)) pageSearchResultObjectAndPush(searchResult, page);
                        break;
                    case "--fileName":
                        let fileName = pathLib.parse(page.filelocation).name;
                        if (fileName[searchSide](search)) pageSearchResultObjectAndPush(searchResult, page);
                        break;
                    case "--pathName":
                        let pathName = pathLib.parse(path).name;
                        if (pathName[searchSide](search)) pageSearchResultObjectAndPush(searchResult, page);
                        break;
                    case "--pageType":
                        if (page.pageType[searchSide](search)) pageSearchResultObjectAndPush(searchResult, page);
                        break;
                }

            }
            if (flags.includes("--count")) console.log(`There's ${searchResult.length} pages matching the search.`); else console.table(searchResult);
            return;
        }
    }

    if (data.startsWith("components")) {
        if (params[0] === "reload" || params[0] === "restart") return loadPages(server);

        if (params[0] === "length" || params[0] === "count") return console.log(`There's currently ${server.components.length} components in the server.`);

        if (params[0] === "search" || params[0] === undefined) {
            let search = params[0] === "search" ? params[1] ?? "" : "";
            let searchSide = flags.includes("--fromEnd") ? "endsWith" : "startsWith";

            let results = [];

            let sFlags = params.filter(f => f?.startsWith("--") && componentsSearchFlags.includes(f));
            let flag = sFlags.length > 0 ? sFlags[sFlags.length - 1] : "--default";

            for (const [name, component] of server.components.entries()) {
                switch (flag) {
                    default:
                    case "--default":
                        if (name[searchSide](search)) componentSearchResultObjectAndPush(results, component);
                        break;
                    case "--type":
                        if (component.type[searchSide](search)) componentSearchResultObjectAndPush(results, component);
                        break;
                    case "--fileName":
                        let fileName = pathLib.parse(component.filelocation).name;
                        if (fileName[searchSide](search)) componentSearchResultObjectAndPush(results, component);
                        break;
                    case "--fileExt":
                        let fileExt = pathLib.parse(component.filelocation).ext;
                        if (fileExt[searchSide](search)) componentSearchResultObjectAndPush(results, component);
                        break;
                }
            }

            if (flags.includes("--count")) console.log(`There's ${results.length} components matching the search.`); else console.table(results);
            return;
        }
    }

    if (data.startsWith("reload")) return loadPages(server);

    if (data.startsWith("close") || data.startsWith("exit")) {
        console.log("Closing server...");
        process.exit(0);
    }
});

server.listen(8080, "localhost");