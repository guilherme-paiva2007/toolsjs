/**
 * Objetos de coleção com tipagem.
 */


namespace Typed {
    function checkType(value: any, type: Function|TypeList, includeAllInstances: boolean): boolean

    interface TypedCollection<T> {
        type: new (...args: any[]) => T
        includeAllInstances: boolean
        /**
         * Verifica se um valor condiz com o tipo de uma coleção.
         * @param value 
         */
        checkType(value: any, includeAllInstances: boolean): boolean
    }

    class TypeList {
        constructor(...types: Function[])

        private #types: TypeListArray

        *values(): ArrayIterator
        get length(): number
        get name(): string

        has(type: Function): boolean
    }

    /**
     * Cria uma classe completamente herdeira de Array, com seu nome sendo personalizado.
     * @param name 
     * @param suffix
     */
    function customNamedArray(name: string, suffix?: string): ArrayConstructor
}

private class TypeListArray extends Array {}

export = Typed