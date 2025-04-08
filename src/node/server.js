const http = require("http");
const Page = require("./page.js");
const Session = require("./session");
const url = require("url");
const Cookie = require("../util/cookie.js");
const ws = require("ws");
const Component = require( "./component.js" );
const path = require("path");

var ServerManager = ( function() {
    const componentRequestPage = new Page.Special(
        path.join(__dirname, "./server_assets/component_request_page.js"),
        "/[name]",
        "execute",
        "application/json"
    );

    const ServerManager = class ServerManager extends http.Server {
        constructor(options) {
            /**
             * @param {http.IncomingMessage} request 
             * @param {http.ServerResponse} response 
             */
            const requestHandler = async(request, response) => {
                const beforeRequestEndPromises = [];
                const logInfo = {
                    timeStamp: undefined,
                    sublines: []
                };

                const session = new Session(request, response, this.sessions);

                const parsedUrl = url.parse(request.url);
                const pathname = parsedUrl.pathname;
                const query = Cookie.parse(parsedUrl.query?.replaceAll("&", ";") ?? "");

                let bodyStr = "";
                const body = {};

                if (request.method === "POST") {
                    const receivingPost = new Promise(resolve => {
                        request.on("data", data => {
                            bodyStr += data.toString();
                        });

                        request.on("end", () => {
                            const params = new URLSearchParams(bodyStr);
                            for (const [ key, value ] of params.entries()) {
                                body[key] = value;
                            }
                            resolve();
                        });
                    });

                    beforeRequestEndPromises.push(receivingPost);
                }

                let [ page, params ] = this.pages.match(pathname);
                if (request.headers["x-get-component"] === "true" && options?.componentRequests) {
                    page = componentRequestPage;
                    params = componentRequestPage.match(pathname, true);
                    Object.assign(query, JSON.parse(request.headers["x-get-component-parameters"]));
                }

                await Promise.all(beforeRequestEndPromises);

                const collectingContentPromises = [];

                const content = new Page.Content();

                const localhooks = {};

                if (page) {
                    response.setHeader("Content-Type", page.contentType);
                    if (page.statusCode) response.statusCode = page.statusCode;

                    const load = page.load({ query, body, params, content, page, request, response, server: this, components: this.components, session, localhooks }, this.APIObjects);

                    collectingContentPromises.push(load);
                } else {
                    response.writeHead(404, { "content-type": "text/html" });
                    content.append(`<h1>No page found at ${pathname}</h1>`);
                }

                await Promise.all(collectingContentPromises);

                content.write(response);

                response.end();

                console.log(`Request at: ${pathname} ${response.statusCode}`
                    + logInfo.sublines.reduce((prev, curr) => prev + "\n\t" + curr, "")
                );
            }


            if (options) super(options, requestHandler); else super(requestHandler);
        }

        pages = new Page.Collection();
        sessions = new Session.Collection("HTTP");
        components = new Component.Collection();
        APIObjects = {};

        setAPI(name, object) {
            this.APIObjects[name] = object;
        }

        openPageDir(dirpath, pathbase) {
            if (!pathbase.startsWith("/")) pathbase = "/" + pathbase;
            Page.MapDir(dirpath, pathbase, this.pages, true);
        }

        openPageList(array, path) {
            Page.LoadList(array, this.pages, path);
        }

        openWebSocket(path = "/") {
            return new ws.Server({ server: this, path });
        }
    }

    return ServerManager;
} )();

module.exports = ServerManager;