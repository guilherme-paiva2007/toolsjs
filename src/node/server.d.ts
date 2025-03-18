import http, { IncomingMessage, ServerOptions, ServerResponse } from "http"
import WebSocket, { WebSocketServer } from "ws"
import net from "net"
import Page from "./page"

declare class APIManager {
    private map: Map<string, object>

    add(api: object)
}

declare class ServerManager<Req extends typeof IncomingMessage = typeof IncomingMessage, Res extends typeof ServerResponse = typeof ServerResponse> extends http.Server<Req, Res> {

    constructor(options?: ServerOptions)

    // readonly websocket: WebSocketServer
    readonly pages: Page.Collection
    readonly sessions: unknown
    APIObjects: object

    setAPI(name: string, api: object): void

    openPageDir(dirpath: string, pathbase: string): void

    openPageList(array: Page.PageListObject, path: string): void

    openWebSocket(path?: string): WebSocketServer
}

export = ServerManager