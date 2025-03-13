const http = require("http");
const ServerManager = require( "./src/node/server" );
const { PageCollection } = require( "./src/node/page.d.ts" );
require("./src/node/page.d.ts")
PageCollection

new ServerManager().pages

http.createServer().listen()