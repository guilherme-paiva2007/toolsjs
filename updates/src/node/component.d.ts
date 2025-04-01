import { PageLoadParameters } from "./page"

declare type ComponentType = "hypertext" | "execute"

declare interface ComponentConfig {
    allowSubComponents: boolean
}

declare class Component {
    constructor(name: string, file: string, type?: ComponentType, configs?: ComponentConfig)

    readonly name: string
    readonly id: number
    readonly file: string
    readonly type: ComponentType

    open(parameters: object, pageParameters: PageLoadParameters): Promise<string>
}

declare class ComponentCollection {
    private map: Map<string, Component>
    
    /**
     * Insere componentes na coleção.
     * @param components 
     */
    add(...components: Component[]): void

    /**
     * Remove componentes da coleção.
     * @param components 
     */
    remove(...components: Component[]): void

    /**
     * Carrega os componentes da coleção dentro do texto HTML.
     * 
     * Substitui o seguinte modelo de tag:
     * 
     * ```html
     * <component name="header" size="29" />
     * ```
     * @param html
     */
    load(html: string, pageParameters: PageLoadParameters & { apis: object }): Promise<string>

    keys(): MapIterator<string>

    values(): MapIterator<Component>

    entries(): MapIterator<[string, Component]>

    get length(): number
}

declare namespace Component {
    export { ComponentCollection as Collection }

    export type ExecuteComponentFunction = (parameters: object, pageParameters: PageLoadParameters & { apis: object }) => string
}

export = Component