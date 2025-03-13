type Manipulator = "freeze"|"unfreeze"|"hide"|"show"|"lock"

/**
 * Mapeia um objeto atrás de uma propriedade.
 */
class Property<OBJ> {
    /**
     * @param object 
     * @param property 
     * @param manipulators Manipuladores de `Property.set()`.
     */
    constructor(object: OBJ, property: string|symbol, ...manipulators: Manipulator[])

    object: OBJ
    property: string|symbol

    get: (function(): T) | undefined
    set: (function(T): void) | undefined
    value: any
    writable: boolean
    enumerable: boolean
    configurable: boolean

    /** Faz uma propriedade se tornar estática.
     * ```js
     * { writable: false }
     * ``` */
    static freeze(object: object, property: string|symbol): void
    /** Faz uma propriedade poder ser escrita.
     * ```js
     * { writable: true }
     * ``` */
    static unfreeze(object: object, property: string|symbol): void
    /** Faz uma propriedade se tornar oculta.
     * ```js
     * { enumerable: false }
     * ``` */
    static hide(object: object, property: string|symbol): void
    /** Faz uma propriedade ser listável.
     * ```js
     * { enumerable: true }
     * ``` */
    static show(object: object, property: string|symbol): void
    /** Faz uma propriedade não ser mais configurável.
     * ```js
     * { configurable: false }
     * ``` */
    static lock(object: object, property: string|symbol): void

    static set(object: object, property: string|symbol, ...manipulators: Manipulator[]): void

    /** Resgata um valor selecionado a algum atributo de uma propriedade. */
    static catch(object: object, property: string|symbol, search: "get"): (function(): T) | undefined
    /** Resgata um valor selecionado a algum atributo de uma propriedade. */
    static catch(object: object, property: string|symbol, search: "set"): (function(T): void) | undefined
    /** Resgata um valor selecionado a algum atributo de uma propriedade. */
    static catch(object: object, property: string|symbol, search: "value"): any | undefined
    /** Resgata um valor selecionado a algum atributo de uma propriedade. */
    static catch(object: object, property: string|symbol, search: "writable"): boolean | undefined
    /** Resgata um valor selecionado a algum atributo de uma propriedade. */
    static catch(object: object, property: string|symbol, search: "enumerable"): boolean | undefined
    /** Resgata um valor selecionado a algum atributo de uma propriedade. */
    static catch(object: object, property: string|symbol, search: "configurable"): boolean | undefined

    /** Atribui um valor selecionado a algum atributo de uma propriedade. */
    static assign(object: object, property: string|symbol, attribute: "get", value: (function(): T)): void
    /** Atribui um valor selecionado a algum atributo de uma propriedade. */
    static assign(object: object, property: string|symbol, attribute: "set", value: (function(T): void)): void
    /** Atribui um valor selecionado a algum atributo de uma propriedade. */
    static assign(object: object, property: string|symbol, attribute: "value", value: any): void
    /** Atribui um valor selecionado a algum atributo de uma propriedade. */
    static assign(object: object, property: string|symbol, attribute: "writable", value: boolean): void
    /** Atribui um valor selecionado a algum atributo de uma propriedade. */
    static assign(object: object, property: string|symbol, attribute: "enumerable", value: boolean): void
    /** Atribui um valor selecionado a algum atributo de uma propriedade. */
    static assign(object: object, property: string|symbol, attribute: "configurable", value: boolean): void
}

namespace Property {
    
}

export = Property