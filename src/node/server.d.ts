import http, { IncomingMessage } from "http"
import WebSocket, { WebSocketServer } from "ws"
import net from "net"
import Page from "./page"

declare class APIManager {
    private map: Map<string, object>

    add(api: object)
}

declare class ServerManager<Req = typeof http.IncomingMessage, Res = typeof http.ServerResponse> extends http.Server<Req, Res> {
    constructor()

    readonly websocket: WebSocketServer
    readonly pages: Page.Collection
    readonly sessions: unknown
    APIObjects: object

    setAPI(name: string, api: object): void

    openPageDir(): void

    openPageList(): void
}

export = ServerManager