process.on("uncaughtException", exception => {
    console.error(exception);
});

const path = require("path");
const ServerManager = require("./src/node/server.js");
const config = require("./config.json");
const Component = require( "./src/node/component.js" );

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
    },
    {
        filelocation: "/websocket.html",
        pagelocation: [ "ws", "websocket" ]
    },
    {
        filelocation: "/docs.html",
        pagelocation: "docs",
        events: {
            before: [
                () => { console.log("Test1") },
                () => { console.log("Test2") }
            ]
        }
    },
    {
        filelocation: "/ex.js",
        pagelocation: "execute",
        pagetype: "execute",
        events: {
            before({ localhooks }) {
                localhooks.abc = 123;
            }
        }
    },
    {
        filelocation: "/special.html",
        pagelocation: "param/[um]/[2]/[treees]",
        urltype: "special",
        flags: [ "HTMLClientParams" ],
        events: {
            before({ page, content }) {
                content.append(`<script>`);
                content.append(`window.PAGE = ${JSON.stringify(page)}`);
                content.append(`</script>`);
            }
        }
    },
    {
        filelocation: "/pages.js",
        pagelocation: "get/pages",
        pagetype: "execute",
        contenttype: "application/json"
    }
], path.join(__dirname, "pages"));

server.openPageDir("./assets/css/", "/css/");

server.listen(config?.port, config?.hostname);
server.on("listening", () => {
    console.log(`HTTP Server listening at ${config.port}`);
});

const wss = server.openWebSocket();
wss.on("listening", () => {
    console.log(`WebSocket Server listening at ${config.port}`);
});

wss.on("connection", socket => {
    socket.on("message", message => console.log("Message from WebSocket client:", message.toString("utf-8")))
});

server.components.add(
    new Component("test1", path.resolve(__dirname, "./pages/components/testcomp.html")),
    new Component("test2", path.resolve(__dirname, "./pages/components/testexec.js"), "execute")
);