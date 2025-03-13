import { IncomingMessage, ServerResponse } from "http";

declare class Session {
    constructor(response: ServerResponse, collection?: SessionCollection)

    readonly id: string
    stored: Map<any, any>
    lastUse: number
    collection: SessionCollection

    renew(): void

    get(key: any): any
    set(key: any, value: any): any
    delete(key: any): boolean
    has(key: any): boolean
    clear(): void

    keys(): MapIterator<any>
    values(): MapIterator<any>
    entries(): MapIterator<[any, any]>

    get size(): number
}

declare class SessionCollection {
    constructor(name: string, { maxAge, clearInterval }: { maxAge: number, clearInterval: number })

    readonly id: string
    readonly name: string
    get cookieKeyName(): string

    private sessions: Map<string, Session>

    maxAge: number
    clearInterval: number
    private intervalId: number

    get(id: string): Session

    has(id: string): boolean

    insert(session: Session): void

    remove(session: Session): void

    /**
     * Limpa as sessões que forem mais velhas que a data passada.
     * 
     * Se nenhuma data for passada, será usada a padrão.
     * @param maxAge Contada em milissegundos.
     */
    clear(maxAge?: number): void

    /**
     * Inicia um novo intervalo de rotina de limpeza.
     * @param interval Em milissegundos.
     */
    setClearInterval(interval: number): void

    unsetClearInterval(): void

    values(): MapIterator<Session>
    keys(): MapIterator<string>
    entries(): MapIterator<[string, Session]>
}

declare namespace Session {
    export { SessionCollection as Collection }

    /**
     * Procura por uma sessão existente. Se não existir, cria uma nova.
     * @param request 
     * @param response 
     * @param collection 
     */
    export function create(request: IncomingMessage, response: ServerResponse, collection: SessionCollection): Session
}

export = Session