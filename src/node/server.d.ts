import http from "http"
import ws from "ws"
import net from "net"
import Page from "./page"

declare class APIManager {
    private map: Map<string, object>

    add(api: object)
}

declare class ServerManager {
    constructor(requestListener: http.RequestListener<Request, Response>)
    constructor(options?: http.ServerOptions, requestListener: http.RequestListener<Request, Response>)

    readonly server: http.Server<Request, Response>
    readonly websocket: ws.Server
    readonly pages: Page.Collection
    readonly sessions: unknown
    APIObjects: object

    port: number
    hostname: string

    /**
     * Inicia a conexão na porta, ouvindo por requisições HTTP.
     * @param port 
     * @param hostname 
     * @param backlog 
     * @param listeningListener 
     */
    listen(port?: number, hostname?: string, backlog?: number, listeningListener?: () => void): this;
    listen(port?: number, hostname?: string, listeningListener?: () => void): this;
    listen(port?: number, backlog?: number, listeningListener?: () => void): this;
    listen(port?: number, listeningListener?: () => void): this;
    listen(path: string, backlog?: number, listeningListener?: () => void): this;
    listen(path: string, listeningListener?: () => void): this;
    listen(options: ListenOptions, listeningListener?: () => void): this;
    listen(handle: any, backlog?: number, listeningListener?: () => void): this;
    listen(handle: any, listeningListener?: () => void): this;
}

export = ServerManager