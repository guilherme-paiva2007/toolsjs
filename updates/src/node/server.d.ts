import http, { IncomingMessage, ServerOptions, ServerResponse } from "http"
import { WebSocketServer } from "ws"
import Page from "./page"
import Session from "./session"
import Component from "./component"

declare class APIManager {
    private map: Map<string, object>

    add(api: object): void
}

declare class ServerManager<Req extends typeof IncomingMessage = typeof IncomingMessage, Res extends typeof ServerResponse = typeof ServerResponse> extends http.Server<Req, Res> {
    constructor(options?: ServerOptions)

    readonly pages: Page.Collection
    readonly sessions: Session.Collection
    readonly components: Component.Collection
    APIObjects: APIManager

    setAPI(name: string, api: object): void

    openPageDir(dirpath: string, pathbase: string): void

    openPageList(array: Page.PageListObject, path: string): void

    openWebSocket(path?: string): WebSocketServer
}

export = ServerManager