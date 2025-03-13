const path = require("path");
const ServerManager = require("./src/node/server.js");

const server = new ServerManager();

server.openPageDir(path.resolve(__dirname, "./src/"), "/src/");

server.openPageList([
    {
        filelocation: "./page.html",
        pagelocation: "/page1",
        contenttype: "text/html"
    },
    {
        filelocation: "./page2.html",
        pagelocation: "/page2"
    },
    {
        filelocation: "/page3.html",
        pagelocation: "/page3"
    }
], path.join(__dirname, "pages"));

server.listen(8080, "localhost");