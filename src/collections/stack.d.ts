/**
 * Coleção de pilha de valores.
 */
class Stack<V> {
    /**
     * 
     * @param values Empilha estes valores junto da instanciação.
     */
    constructor(...values: V[])

    /**
     * Adiciona elementos na pilha.
     * @param values 
     */
    append(...values: V[]): void
    /**
     * Remove o último elemento da pilha e o retorna.
     */
    pop(): V|undefined
    /**
     * Limpa a pilha.
     */
    clear(): void
    /**
     * Testa se contém um valor na pilha.
     * @param value 
     */
    has(value: any): boolean
    
    *values(): StackIterator<V>
    *[Symbol.iterator](): StackIterator<V>

    /**
     * Retorna o elemento do topo da pilha.
     */
    get top(): V|undefined
    get length(): number
}

private class StackArray<V> extends Array<V> {}

export = Stack