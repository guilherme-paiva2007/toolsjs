import { TypedCollection, TypeList } from "./typed";

/**
 * Array com tipagem controlada.
 */
class TypedArray<V> extends Array<V> implements TypedCollection<V> {
    /**
     * @param type Classe construtora que poderá ser armazenada.
     * @param includeAllInstances Permite incluir instâncias que herdem a classe.
     */
    constructor(type: (new (...args: any[]) => V), includeAllInstances: boolean)
    /**
     * @param type Lista de classes construtoras que poderão ser armazenadas.
     * @param includeAllInstances Permite incluir instâncias que herdem a classe.
     */
    constructor(type: (new (...args: any[]) => V)[], includeAllInstances: boolean)
    /**
     * @param type Instância de lista de tipos que poderão ser armazenados.
     * @param includeAllInstances Permite incluir instâncias que herdem a classe.
     */
    constructor(type: TypeList, includeAllInstances: boolean)

    readonly type: (new (...args: any[]) => V) | (new (...args: any[]) => V)[] | TypeList
    readonly includeAllInstances: boolean

    /**
     * Verifica se um valor condiz com o tipo do Array.
     * @param value 
     */
    checkType(value: any): boolean

    static private #globalProxyHandlerSet(target: this, property: string|symbol, value: V): boolean
}

export = TypedArray