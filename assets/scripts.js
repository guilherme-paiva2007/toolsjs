/**
 * Verifica se uma string está vazia.
 * @param {string} string 
 */
function emptystr(string) {
    return string.replaceAll("\n","").trim().length == 0;
}



var validstr = (function (){
    const nonToStringObject = /\[object (.+)\]/;

    const alphaNumericRegExp = /^[a-zA-Z0-9_]*$/;

    /**
     * Verifica se um valor é válido à ser string.
     * @param {any} string 
     * @param {..."blockEmpty"|"blockArrays"|"blockBooleans"|"blockNumbers"|"onlyAlphaNumeric"} filters 
     * @param {boolean}
     */
    function validstr(value, ...filters) {
        if (typeof value == "undefined" || value == null) return false;
        if ((typeof value == "number" || typeof value == "bigint") && filters.includes("blockNumbers")) return false;
        if (typeof value == "boolean" && filters.includes("blockBooleans")) return false;
        if (filters.includes("onlyAlphaNumeric") && !alphaNumericRegExp.test(value)) return false;
        if (value instanceof Array && filters.includes("blockArrays")) return false;
        if (typeof value.toString != "function") return false;

        try {
            value = String(value);
        } catch(err) {
            console.error(`Error at converting object into string: ${err.message}`);
            return false;
        }

        if (nonToStringObject.test(value)) return false;
        if (filters.includes("blockEmpty") && require("./string_empty")(value)) return false;

        return true;
    }
    return validstr;
})()



var timestamp = ( function() {
    function toRawObject(date, fixedDateLength) {
        fixedDateLength = fixedDateLength ? 1 : 0;
        return [
            [ "Y", date.getFullYear().toString().padStart(4 * fixedDateLength, "0") ],
            [ "M", (date.getMonth() + 1).toString().padStart(2 * fixedDateLength, "0") ],
            [ "D", date.getDate().toString().padStart(2 * fixedDateLength, "0") ],
            [ "h", date.getHours().toString().padStart(2 * fixedDateLength, "0") ],
            [ "m", date.getMinutes().toString().padStart(2 * fixedDateLength, "0") ],
            [ "s", date.getSeconds().toString().padStart(2 * fixedDateLength, "0") ],
            [ "ms", date.getMilliseconds().toString().padStart(3 * fixedDateLength, "0") ]
        ].reduce((obj, darr) => { obj[darr[0]] = darr[1]; return obj }, {});
    }

    const timestamp = function timestamp(date = new Date, { mainjoin = "-", subjoin = ".", datejoin, hourjoin, fixedDateLength = false } = {}) {
        if (!(date instanceof Date)) date = new Date(date);
        date = toRawObject(date, fixedDateLength);

        return [
            [ date.Y, date.M, date.D ].join(datejoin ?? subjoin),
            [ date.h, date.m, date.s, date.ms ].join(hourjoin ?? subjoin)
        ].join(mainjoin);
    }

    timestamp.template = function template(date = new Date, template, fixedDateLength = false) {
        if (!(date instanceof Date)) date = new Date(date);
        if (typeof template !== "string") throw new TypeError("template must be a string");
        date = toRawObject(date, fixedDateLength);

        return template
            .replace("Y", date.Y)
            .replace("M", date.M)
            .replace("D", date.D)
            .replace("h", date.h)
            .replace("m", date.m)
            .replace("s", date.s)
            .replace("ms", date.ms);
    }

    return timestamp;
} )();





var Namespace = ( function() {
    const namespaceSymbol = Symbol.for("NamespaceIdentifier");

    Symbol.NamespaceIdentifier = namespaceSymbol;

    const localNamespaceOperationIdentifier = Symbol("NamespaceIdentifier.Local");

    const availableNamespaces = new Proxy({}, {
        set(target, property, newValue) {
            if (
                newValue instanceof Array &&
                newValue.length === 2 &&
                newValue[1] === localNamespaceOperationIdentifier
            ) {
                target[property] = newValue[0];
                return true;
            } else {
                throw new Error("Operação em objeto não permitida");
            }
        }
    });

    function isNamespace(object) {
        try {
            return Boolean(object[namespaceSymbol]);
        } catch {
            return false;
        }
    }

    function Namespace(object, name) {
        if(
            ( typeof object !== "object" && typeof object !== "function" ) ||
            ( object instanceof Array ) || ( object instanceof Date ) ||
            ( object instanceof Map ) || ( object instanceof Set ) ||
            [ Array, Object, String, Number, BigInt, Symbol, Boolean ].includes( object )
        ) throw new TypeError("O objeto Namespace precisa ser um objeto ou função e não padrão de JavaScript");

        if(!validstr(name)) throw new TypeError("Nome inválido para nome de Namespace");
        if (isNamespace(object)) throw new TypeError("O objeto já é um Namespace");
        Object.defineProperties( object, {
            [ Symbol.toStringTag ]: {
                value: String( name ),
                enumerable: false,
                writable: false,
                configurable: false
            },
            [ namespaceSymbol ]: {
                value: true,
                enumerable: false,
                writable: false,
                configurable: false
            }
        } );
        availableNamespaces[name] = [ object, localNamespaceOperationIdentifier ];
        return object;
    }

    Namespace.availableNamespaces = availableNamespaces;

    Namespace(Namespace, "Namespace");

    Namespace.isNamespace = isNamespace;

    return Namespace;
} )()





/**
 * Controlador e analisador de propriedades de objetos.
 */
class Property {
    /**
     * Obtém informações sobre uma propriedade de um objeto.
     * @param {Object} object Qualquer objeto que não seja `null` ou `undefined`.
     * @param {string|symbol} property Chave da propriedade a ser procurada.
     * @param  {..."freeze"|"unfreeze"|"hide"|"show"|"lock"} manipulators Manipula a propriedade antes de a obtê-la.
     */
    constructor(object, property, ...manipulators) {
        if (typeof property !== "string" && typeof property !== "symbol") throw new TypeError("nome de propriedade inválida");
        if (typeof object !== "object" && typeof object !== "function") throw new TypeError("impossível manipular fora de objeto");

        Property.set(object, property, ...manipulators);

        this.object = object;
        this.property = property;

        const properties = Object.getOwnPropertyDescriptor(object, property);
        if (typeof properties !== "undefined") {
            this.get = properties.get;
            this.set = properties.set;
            this.value = properties.value;
            this.writable = properties.writable;
            this.enumerable = properties.enumerable;
            this.configurable = properties.configurable;
        }
    }

    /** Objeto de busca. @type {Object} */
    object;
    /** Propriedade buscada. @type {string|symbol} */
    property;

    /** Método getter da propriedade. @type {Function|undefined} */
    get;
    /** Método setter da propriedade. @type {Function|undefined} */
    set;
    /** Valor bruto da propriedade. @type {any} */
    value;
    /** Permissão de escrita da propriedade. @type {boolean} */
    writable;
    /** Enumeração da propriedade. @type {boolean} */
    enumerable;
    /** Permissão de reconfiguração da propriedade. @type {boolean} */
    configurable;

    static validateObjProperty(object, property) {
        if (typeof property !== "string" && typeof property !== "symbol") throw new TypeError("nome de propriedade inválida");
        if (typeof object !== "object" && typeof object !== "function") throw new TypeError("impossível manipular fora de objeto");
    }

    /**
     * Congela a escrita da propriedade.
     * 
     * Define `writable` como `false`.
     * 
     * @param {Object} object 
     * @param {string|symbol} property 
     */
    static freeze(object, property) {
        this.validateObjProperty(object, property);

        let prop = Object.getOwnPropertyDescriptor(object, property);
        if (prop === undefined) throw new Error("propriedade inexistente");

        prop.writable = false;
        Object.defineProperty(object, property, prop);
    }

    /**
     * Descongela a escrita da propriedade.
     * 
     * Define `writable` como `true`.
     * 
     * @param {Object} object 
     * @param {string|symbol} property 
     */
    static unfreeze(object, property) {
        this.validateObjProperty(object, property);

        let prop = Object.getOwnPropertyDescriptor(object, property);
        if (prop === undefined) throw new Error("propriedade inexistente");

        prop.writable = true;
        Object.defineProperty(object, property, prop);
    }

    /**
     * Esconde a enumeração da propriedade.
     * 
     * Define `enumerable` como `false`.
     * 
     * @param {Object} object 
     * @param {string|symbol} property 
     */
    static hide(object, property) {
        this.validateObjProperty(object, property);

        let prop = Object.getOwnPropertyDescriptor(object, property);
        if (prop === undefined) throw new Error("propriedade inexistente");

        prop.enumerable = false;
        Object.defineProperty(object, property, prop);
    }

    /**
     * Revela a enumeração da propriedade.
     * 
     * Define `enumerable` como `true`.
     * 
     * @param {Object} object 
     * @param {string|symbol} property 
     */
    static show(object, property) {
        this.validateObjProperty(object, property);

        let prop = Object.getOwnPropertyDescriptor(object, property);
        if (prop === undefined) throw new Error("propriedade inexistente");

        prop.enumerable = true;
        Object.defineProperty(object, property, prop);
    }

    /**
     * Desativa a configuração posterior da propriedade.
     * 
     * Define `configurable` como `false`.
     * 
     * @param {Object} object 
     * @param {string|symbol} property 
     */
    static lock(object, property) {
        this.validateObjProperty(object, property);

        let prop = Object.getOwnPropertyDescriptor(object, property);
        if (prop === undefined) throw new Error("propriedade inexistente");

        prop.configurable = false;
        Object.defineProperty(object, property, prop);
    }

    /**
     * Passa pelos manipuladores de propriedade existentes, aplicando-os a propriedade.
     * @param {Object} object 
     * @param {string|symbol} property 
     * @param  {..."freeze"|"unfreeze"|"hide"|"show"|"lock"} manipulators 
     */
    static set(object, property, ...manipulators) {
        this.validateObjProperty(object, property);

        if (manipulators.includes('lock')) {
            let newmanipulators = [];
            manipulators.forEach(manipulator => {
                if (manipulator === "lock") return;
                newmanipulators.push(manipulator);
            });
            newmanipulators.push('lock');
            manipulators = newmanipulators;
        }

        manipulators.forEach(manipulator => {
            if (!Property.#methods.includes(manipulator)) throw new Error("método de manipulação inválido");

            this[manipulator](object, property);
        });
    }

    /**
     * Procura por uma configuração específica de uma propriedade.
     * @param {Object} object 
     * @param {string|symbol} property 
     * @param {"get"|"set"|"value"|"writable"|"enumerable"|"configurable"} search 
     * @returns 
     */
    static catch(object, property, search = "value") {
        if (typeof property !== "string" && typeof property !== "symbol") throw new TypeError("nome de propriedade inválida");
        if (object === null || object === undefined) throw new TypeError("objeto de busca inválido");
        if (!this.#attributes.includes(search)) throw new Error("atributo de busca inválido");

        let properties = Object.getOwnPropertyDescriptor(object, property);
        if (!properties) properties = {};

        return properties[search];
    }

    static assign(object, property, attribute, value) {
        if (typeof property !== "string" && typeof property !== "symbol") throw new TypeError("nome de propriedade inválida");
        if (object === null || object === undefined) throw new TypeError("objeto de busca inválido");
        switch (attribute) {
            case "get":
                if (typeof value !== "function") throw new TypeError("getter deve ser uma função");
                if (value.length !== 0) throw new TypeError("getter não pode ter argumentos");
                Object.defineProperty(object, property, { get: value });
                break;
            case "set":
                if (typeof value !== "function") throw new TypeError("setter deve ser uma função");
                if (value.length !== 1) throw new TypeError("setter deve ter um argumento");
                Object.defineProperty(object, property, { set: value });
                break;
            case "value":
                Object.defineProperty(object, property, { value });
                break;
            case "writable":
                if (typeof value !== "boolean") throw new TypeError("writable deve ser um booleano");
                Object.defineProperty(object, property, { writable: value });
                break;
            case "enumerable":
                if (typeof value !== "boolean") throw new TypeError("enumerable deve ser um booleano");
                Object.defineProperty(object, property, { enumerable: value });
                break;
            case "configurable":
                if (typeof value !== "boolean") throw new TypeError("configurable deve ser um booleano");
                Object.defineProperty(object, property, { configurable: value });
                break;
            default:
                throw new TypeError("atributo desconhecido");
        }
    }

    static #methods = [ "freeze", "unfreeze", "hide", "show", "lock" ];
    static #attributes = [ "get", "set", "value", "writable", "enumerable", "configurable" ];

    static {
        // Object.freeze(this);
        Object.freeze(this.prototype);
    }
}

Namespace(Property, "Property");






var LinkedList = ( function() {
    const Node = class Node {
        constructor(value, { next, last } = {}) {
            this.value = value;
            this.next = next ?? null;
            this.last = last ?? null;

            if (next && last) {
                if (!(next instanceof Node) || !(last instanceof Node)) throw new TypeError("Nodes só podem ser colocados entre outros Nodes.");
                if (next.last !== last || last.next !== next) throw new Error("Passado next e last Nodes para um novo Node, porém não estão conectados entre si de forma correta.");

                next.last = this;
                last.next = this;
            } else if (next) {
                if (!(next instanceof Node)) throw new TypeError("next precisa ser um Node");
                if (next.last) {
                    this.last = next.last;
                }
                this.next = next;
                next.last = this;
            } else if (last) {
                if (!(last instanceof Node)) throw new TypeError("last precisa ser um Node");
                if (last.next) {
                    this.next = last.next;
                }
                this.last = last;
                last.next = this;
            }
        }

        value;
        next;
        last;

    }

    const customNodes = new Map();

    function createCustomNode(name) {
        let NodeConstructor = customNodes.get(name);
        if (NodeConstructor) return NodeConstructor;

        if (!validstr(name, "onlyAlphaNumeric","blockNumbers","blockBooleans","blockEmpty")) throw new TypeError("Nome de classe inválida");
        name = String(name).trim().replace("LinkedList", "");
        NodeConstructor = customNodes.get(name);
        if (!NodeConstructor) {
            NodeConstructor = new Function("Node", `return class ${name}LinkedListNode extends Node {}`)(Node);
            customNodes.set(name, NodeConstructor);
        }
        return NodeConstructor;
    }

    function tryPropertyToNumber(property) {
        try {
            return Number(property);
        } catch {
            return property;
        }
    }

    /** @type {ProxyHandler} */
    const proxyHandler = {
        get(target, property) {
            if (typeof property === "symbol") return target[property];
            const toNumberProperty = tryPropertyToNumber(property);
            if (Number.isInteger(toNumberProperty) && toNumberProperty >= 0) {
                return target.at(toNumberProperty);
            }
            return target[property];
        },
        set(target, property, newValue) {
            const toNumberProperty = tryPropertyToNumber(property);
            if (Number.isInteger(toNumberProperty) && toNumberProperty >= 0) {
                target.set(toNumberProperty, newValue);
            } else {
                target[property] = newValue;
            }
            return true;
        },
        deleteProperty(target, property) {
            const toNumberProperty = tryPropertyToNumber(property);
            if (Number.isInteger(toNumberProperty) && toNumberProperty >= 0) {
                target.remove(toNumberProperty);
            }
            return true;
        }
    };

    Object.freeze(proxyHandler);

    /**
     * @type {WeakMap<LinkedList, { first: Node | null, last: Node | null }>}
     */
    const LinkedListPrivateFields = new WeakMap();

    const LinkedList = class LinkedList {
        constructor(...values) {
            const proxy = new Proxy(this, proxyHandler);
            const fields = { first: null, last: null };
            
            LinkedListPrivateFields.set(this, fields);
            LinkedListPrivateFields.set(proxy, fields);

            if (values.length > 0) this.append(...values);
            return proxy;
        }
        
        at(index) {
            return getNodeAt(this, index)?.value;
        }

        set(index, value) {
            const nodeAtIndex = getNodeAt(this, index);

            nodeAtIndex.value = value;
        }

        insert(index, ...values) {
            const privateFields = LinkedListPrivateFields.get(this);
            const nodeBeforeIndex = getNodeAt(this, index)?.last ?? privateFields.last;

            let last = nodeBeforeIndex;
            let nextNode = nodeBeforeIndex?.next;
            let thisNodeType = (createCustomNode(this.constructor.name));
            for (const value of values) {
                const node = new thisNodeType(value, { next: nextNode, last: last });
                if (!last) privateFields.first = node;
                last = node;
            }

            if (!last.next) privateFields.last = last;
        }

        remove(index) {
            const nodeAtIndex = getNodeAt(this, index);
            const privateFields = LinkedListPrivateFields.get(this);

            const last = nodeAtIndex?.last;
            const next = nodeAtIndex?.next;

            if (next && last) {
                next.last = last;
                last.next = next;
            } else if (next) {
                next.last = null;
                privateFields.first = next;
            } else if (last) {
                last.next = null;
                privateFields.last = last;
            }

            return nodeAtIndex?.value;
        }

        append(...values) { this.insert("last", ...values) }

        unshift(...values) { this.insert(0, ...values) }

        pop() { return this.remove("last") }

        shift() { return this.remove(0) }

        get length() {
            let length = 0;

            let current = LinkedListPrivateFields.get(this).first;
            while (current) {
                length++;
                current = current.next;
            }

            return length;
        }

        get first() {
            return LinkedListPrivateFields.get(this).first?.value;
        }

        get last() {
            return LinkedListPrivateFields.get(this).last?.value;
        }
        
        // toString() {}

        // join() {}

        // forEach() {}

        // map() {}

        // fill() {}

        // filter() {}

        // find() {}

        // findLast() {}

        has(value) {
            for (const nodeValue of this.values()) {
                if (nodeValue === value) return true;
            }
            return false;
        }

        clear() {
            const privateFields = LinkedListPrivateFields.get(this);
            privateFields.first = null;
            privateFields.last = null;
        }

        // reduce() {}

        // reduceRight() {}

        *values() {
            let current = LinkedListPrivateFields.get(this).first;
            
            while (current) {
                yield current.value;
                current = current?.next;
            }
        }

        *[Symbol.iterator]() { yield* this.values(); }

        [Symbol.for("nodejs.util.inspect.custom")](depth, options) {
            const array = new (customNamedArray(this.constructor.name, ""));
            array.push(...this.values());
            return array;
        }

        toJSON() {
            return [...this.values()];
        }
    }

    function getNodeAt(list, index) {
        if (index === "last") return LinkedListPrivateFields.get(list).last;
        if (typeof index !== "number") throw new TypeError("Índice precisa ser um número");
        if (!Number.isInteger(index) || index < 0) throw new RangeError("Índice precisa ser um número inteiro positivo");

        let currentIndex = 0;
        let current = LinkedListPrivateFields.get(list).first;

        while(currentIndex < index) {
            if (!current) break;
            current = current?.next;
            currentIndex++;
        }

        return current;
    }

    LinkedList.proxyHandler = proxyHandler;

    return LinkedList;
} )();





var Queue = ( function (){
    const LinkedList = class QueueLinkedList extends DefaultLinkedList {}

    function tryPropertyToNumber(property) {
        try {
            return Number(property);
        } catch {
            return property;
        }
    }

    /** @type {ProxyHandler} */
    const proxyHandler = {
        get: DefaultLinkedList.proxyHandler.get,
        set(target, property, newValue) {
            const toNumberProperty = tryPropertyToNumber(property);
            if (Number.isInteger(toNumberProperty) && toNumberProperty >= 0) {
                throw new Error("Não é possível definir manualmente propriedades de uma Queue");
            } else {
                target[property] = newValue;
            }
        }
    }

    /**
     * @type {WeakMap<Queue, DefaultLinkedList>}
     */
    const privateLists = new WeakMap();

    const Queue = class Queue {
        constructor(...values) {
            const list = new LinkedList(...values);
            const proxy = new Proxy(this, proxyHandler);
            
            privateLists.set(this, list);
            privateLists.set(proxy, list);

            return proxy;
        }

        at(index) {
            return privateLists.get(this).at(index);
        }

        append(...values) {
            privateLists.get(this).append(...values);
        }

        shift() {
            return privateLists.get(this).shift();
        }

        has(value) {
            return privateLists.get(this).has(value);
        }

        clear() {
            privateLists.get(this).clear();
        }

        get first() {
            return this.at(0);
        }

        get length() {
            return privateLists.get(this).length;
        }

        *values() {
            yield* privateLists.get(this).values();
        }

        *[Symbol.iterator]() { yield* this.values() }

        [Symbol.for("nodejs.util.inspect.custom")]() {
            return privateLists.get(this);
        }

        toJSON() {
            return privateLists.get(this).toJSON();
        }
    }

    return Queue;
} )();





var Stack = ( function() {
    const LinkedList = class StackLinkedList extends DefaultLinkedList {}

    function tryPropertyToNumber(property) {
        try {
            return Number(property);
        } catch {
            return property;
        }
    }

    /** @type {ProxyHandler} */
    /** @type {ProxyHandler} */
    const proxyHandler = {
        get: DefaultLinkedList.proxyHandler.get,
        set(target, property, newValue) {
            const toNumberProperty = tryPropertyToNumber(property);
            if (Number.isInteger(toNumberProperty) && toNumberProperty >= 0) {
                throw new Error("Não é possível definir manualmente propriedades de um Stack");
            } else {
                target[property] = newValue;
            }
        }
    }

    /** @type {WeakMap<Stack, DefaultLinkedList>} */
    const privateLists = new WeakMap();

    const Stack = class Stack {
        constructor(...values) {
            const proxy = new Proxy(this, proxyHandler);
            const list = new LinkedList(...values);

            privateLists.set(this, list);
            privateLists.set(proxy, list);

            return proxy;
        }

        at(index) {
            return privateLists.get(this).at(index);
        }

        append(...values) {
            privateLists.get(this).append(...values);
        }

        pop() {
            return privateLists.get(this).pop();
        }

        clear() {
            privateLists.get(this).clear();
        }

        has(value) {
            return privateLists.get(this).has(value);
        }

        *values() {}

        get top() {
            return this.at("last");
        }
        get length() {
            return privateLists.get(this).length;
        }

        *[Symbol.iterator]() { yield* this.values() }

        [Symbol.for("nodejs.util.inspect.custom")]() {
            return privateLists.get(this);
        }

        toJSON() {
            return privateLists.get(this).toJSON();
        }
    }

    return Stack;
} )();







var Typed = ( function () {
    const Typed = {};
    Namespace(Typed, "Typed");
    
    Typed.checkType = function checkType(value, type, includeAllInstances = false) {
        if (value === null || value === undefined) return false;
        if (typeof type === "function") {
            if (includeAllInstances) {
                if (value instanceof type) return true;
            }
            if (value.constructor === type) return true;
            return false;
        }
        
        if (!(type instanceof Typed.TypeList)) throw new TypeError("type precisa ser uma função construtora ou uma lista iterável de tipos");
    
        for (const typel of type.values()) {
            if (includeAllInstances && value instanceof typel) return true;
            if (value.constructor === typel) return true;
        }
    
        return false;
    }

    const customNamedArrays = new Map();

    Typed.customNamedArray = function customNamedArray(name, suffix) {
        if (!validstr(name, "blockEmpty", "blockBooleans", "blockArrays", "onlyAlphaNumeric")) throw new TypeError("Nome de Array inválido");
        if (suffix && !validstr(suffix, "blockEmpty", "blockBooleans", "blockArrays", "onlyAlphaNumeric")) throw new TypeError("Sufixo de Array inválido");
        name = String(name).trim();
        suffix = suffix ? String(suffix).trim() : "";
        let NamedArrayConstructor = customNamedArrays.get(name);
        if (!NamedArrayConstructor) {
            NamedArrayConstructor = (new Function(`return class ${name}Array${suffix} extends Array {}`))();
            customNamedArrays.set(name, NamedArrayConstructor);
        }
        return NamedArrayConstructor;
    }

    const TypeListArray = Typed.customNamedArray("TypeList");
    
    Typed.TypeList = class TypeList {
        constructor(...types) {
            for (const type of types) {
                if (typeof type === "function") {
                    if (!this.list.includes(type)) this.list.push(type);
                } else {
                    throw new TypeError("type precisa ser uma função construtora");
                }
            }
    
            Object.freeze(this.list);
            Property.set(this, "list", "freeze", "hide", "lock");
        }
    
        list = new TypeListArray;
    
        *values() {
            yield* this.list.values();
        }
    
        get length() { return this.list.length }
    
        get name() { return this.toString() }
    
        has(type) {
            return this.list.includes(type);
        }
    
        toString() {
            return `(${this.list.map(t => t.name).join(", ")})`;
        }
    
        [Symbol.for("nodejs.util.inspect.custom")](depth, options) {
            return this.list;
        }
    }

    return Typed;
} )()






var TypedArray = ( function() {
    function tryPropertyToNumber(property) {
        try {
            return Number(property);
        } catch {
            return property;
        }
    }

    const proxyHandler = {
        set(target, property, newValue) {
            const toNumberProperty = tryPropertyToNumber(property);
            if (Number.isInteger(toNumberProperty) && toNumberProperty >= 0) {
                if (!target.checkType(newValue)) throw new TypeError(`valor inválido para coleção Array de tipo ${this.type.name}`);
                target[property] = newValue;
                return true;
            } else {
                target[property] = newValue;
                return true;
            }
        }
    }

    const TypedArray = class TypedArray extends Array {
        constructor(type, includeAllInstances = false) {
            super();
            if (type instanceof Array) type = new Typed.TypeList(...type);
            if (typeof type !== "function" && !(type instanceof Typed.TypeList)) throw new TypeError("Tipo de valor de TypedArray precisa ser uma função construtora ou TypeList");
            this.type = type;
            this.includeAllInstances = Boolean(includeAllInstances);
    
            Property.set(this, "type", "freeze", "hide", "lock");
            Property.set(this, "includeAllInstances", "freeze", "hide", "lock");
    
            return new Proxy(this, proxyHandler);
        }

        type;
        includeAllInstances;

        checkType(value) {
            return Typed.checkType(value, this.type, this.includeAllInstances);
        }

        get [Symbol.toStringTag]() {
            return `${this.type.name}`;
        }

        map(callback, thisArg) {
            const result = super.map(callback, thisArg);
            const typedArray = new TypedArray(this.type, this.includeAllInstances);
            typedArray.push(...result);
            return typedArray;
        }

        filter(callback, thisArg) {
            const result = super.filter(callback, thisArg);
            const typedArray = new TypedArray(this.type, this.includeAllInstances);
            typedArray.push(...result);
            return typedArray;
        }

        slice(begin, end) {
            const result = super.slice(begin, end);
            const typedArray = new TypedArray(this.type, this.includeAllInstances);
            typedArray.push(...result);
            return typedArray;
        }

        splice(start, deleteCount, ...items) {
            const result = super.splice(start, deleteCount, ...items);
            const typedArray = new TypedArray(this.type, this.includeAllInstances);
            typedArray.push(...result);
            return typedArray;
        }

        concat(...values) {
            const result = super.concat(...values);
            const typedArray = new TypedArray(this.type, this.includeAllInstances);
            typedArray.push(...result);
            return typedArray;
        }

        flatMap(callback, thisArg) {
            const result = super.flatMap(callback, thisArg);
            const typedArray = new TypedArray(this.type, this.includeAllInstances);
            typedArray.push(...result);
            return typedArray;
        }

        reduce(callback, initialValue) {
            const result = super.reduce(callback, initialValue);
            if (Array.isArray(result)) {
            const typedArray = new TypedArray(this.type, this.includeAllInstances);
            typedArray.push(...result);
            return typedArray;
            }
            return result;
        }

        reduceRight(callback, initialValue) {
            const result = super.reduceRight(callback, initialValue);
            if (Array.isArray(result)) {
            const typedArray = new TypedArray(this.type, this.includeAllInstances);
            typedArray.push(...result);
            return typedArray;
            }
            return result;
        }

        flat(depth = 1) {
            const result = super.flat(depth);
            const typedArray = new TypedArray(this.type, this.includeAllInstances);
            typedArray.push(...result);
            return typedArray;
        }
    }

    return TypedArray;
} )();






class TypedMap extends Map {
    constructor(type, keytype = undefined, includeAllInstances = false) {
        super();
        if (type instanceof Array) type = new Typed.TypeList(...type);
        if (typeof type !== "function" && !(type instanceof Typed.TypeList)) throw new TypeError("Tipo de valor de um TypedMap precisa ser uma função construtura ou TypeList");
        this.type = type;
        if (keytype instanceof Array) keytype = new Typed.TypeList(...keytype);
        if (typeof keytype !== "function" && !(keytype instanceof Typed.TypeList) && keytype !== undefined) throw new TypeError("Tipo de chave de um TypedMap precisa ser uma função construtora ou TypeList");
        if (keytype) this.keytype = keytype;
        this.includeAllInstances = Boolean(includeAllInstances);

        Property.set(this, "type", "freeze", "lock");
        Property.set(this, "keytype", "freeze", "lock");
        Property.set(this, "includeAllInstances", "freeze", "lock");
    }

    type;
    keytype = undefined;
    includeAllInstances = false;

    checkType(value, type) {
        if (type == "key" && this.keytype == undefined) return true;
        switch (type) {
            default:
            case "value":
                return Typed.checkType(value, this.type, this.includeAllInstances);
            case "key":
                return Typed.checkType(value, this.keytype, this.includeAllInstances);
        }
    }

    set(key, value) {
        if (!this.checkType(key, "key")) throw new TypeError(`Chave inválida para coleção Map de tipo ${this.keytype.name}`);
        if (!this.checkType(value, "value")) throw new TypeError(`Valor inválido para coleção Map de tipo ${this.type.name}`);

        return super.set(key, value);
    }

    get [Symbol.toStringTag]() {
        return `${this.type.name}`;
    }

    static {
        Object.freeze(this);
        Object.freeze(this.prototype);
    }
}






class TypedSet extends Set {
    constructor(type, includeAllInstances = false) {
        super();
        if (type instanceof Array) type = new Typed.TypeList(...type);
        if (typeof type !== "function" && !(type instanceof Typed.TypeList)) throw new TypeError("Tipo de valor de TypedSet precisa ser uma função construtora ou TypeList");
        this.type = type;
        this.includeAllInstances = Boolean(includeAllInstances);

        Property.set(this, "type", "freeze", "lock");
        Property.set(this, "includeAllInstances", "freeze", "lock");
    }

    /** @type {Function} */
    type;
    includeAllInstances = false;
    
    checkType(value) {
        return Typed.checkType(value, this.type, this.includeAllInstances);
    }

    add(value) {
        if (!this.checkType(value)) throw new TypeError(`Valor inválido para coleção Set de tipo ${this.type.name}`);

        return super.add(value);
    }

    get [Symbol.toStringTag]() {
        return `${this.type.name}`;
    }

    static {
        Object.freeze(this);
        Object.freeze(this.prototype);
    }
}







class TypedStack extends Stack {
    constructor(type, includeAllInstances = false) {
        super();

        if (type instanceof Array) type = new Typed.TypeList(...type);
        if (typeof type !== "function" && !(type instanceof Typed.TypeList)) throw new TypeError("Tipo de valor de TypedStack precisa ser uma função construtora ou TypeList");
        this.type = type;
        this.includeAllInstances = Boolean(includeAllInstances);

        Property.set(this, "type", "freeze", "lock");
        Property.set(this, "includeAllInstances", "freeze", "lock");
    }

    type;
    includeAllInstances;

    checkType(value) {
        return Typed.checkType(value, this.type, this.includeAllInstances);
    }

    append(...values) {
        for (const value of values) {
            if (!this.checkType(value)) throw new TypeError(`Valor inválido para coleção Stack de tipo ${this.type.name}`);
    
            super.append(value);
        }
    }
}





/**
 * Erro de contexto de execução.
 */
class ContextError extends Error {
    constructor(message, options = undefined) {
        typeof options == "object" ? super(message, options) : super(message);
    }

    static {
        const prototype = this.prototype;
        prototype.name = "ContextError";
        Property.set(prototype, "name", "hide", "freeze", "lock");
    }
}





/**
 * Erro de formulação de expressões.
 */
class ExpressionError extends Error {
    constructor(message, options = undefined) {
        typeof options == "object" ? super(message, options) : super(message);
    }

    static {
        const prototype = this.prototype;
        prototype.name = "ExpressionError";
        Property.set(prototype, "name", "hide", "freeze", "lock");
    }
}





/**
 * Erro de instanciação de classes de interface.
 */
class InterfaceError extends Error {
    constructor(message = "Cannot instantiate interface", options = undefined) {
        typeof options == "object" ? super(message, options) : super(message);
    }

    static {
        const prototype = this.prototype;
        prototype.name = "InterfaceError";
        Property.set(prototype, "name", "hide", "freeze", "lock");
    }
}





/**
 * Erro de execução lógica.
 */
class LogicalError extends Error {
    constructor(message, options = undefined) {
        typeof options == "object" ? super(message, options) : super(message);
    }

    static {
        const prototype = this.prototype;
        prototype.name = "LogicalError";
        Property.set(prototype, 'name', "hide", "freeze", "lock");
    }
}





/**
 * Erro de seleção de opções.
 */
class OptionError extends Error {
    constructor(message, options = undefined) {
        typeof options == "object" ? super(message, options) : super(message);
    }

    static {
        const prototype = this.prototype;
        prototype.name = "OptionError";
        Property.set(prototype, 'name', "hide", "freeze", "lock");
    }
}



/**
 * @typedef {string[6]} HexColorString
 * @typedef {{
 *      red: number,
 *      green: number,
 *      blue: number
 * }} RGBColorObject
 * @typedef {{
 *      hue: number,
 *      lightness: number,
 *      saturation: number
 * }} HSLColorObject
 */




var Color = (function() {
    function hslToRGB(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }

    const validHexChars = "0123456789ABCDEFabcdef".split("");

    const Color = class Color {
        /**
         * @param {"rgb"|"hsl"|"hex"} format 
         * @param {RGBColorObject|HSLColorObject|HexColorString} values 
         * @param {number} alpha 
         */
        constructor(format, values, alpha = 1) {
            if (typeof alpha != "number" || !Number.isFinite(alpha)) throw new TypeError("Alpha de cor precisa ser um número");
            if (alpha > 1 || alpha < 0) throw new RangeError("Alpha precisa estar entre 0 e 1");
            this.alpha = alpha;

            values = Object.assign({}, values);

            let invalid = [];
            switch (format) {
                case "hex":
                    if (typeof values !== "string") throw new TypeError("Valores de cor HEX precisam ser uma string");
                    values.replace("#", "");
                    
                    for (const char of values) if (!validHexChars.includes(char)) throw new TypeError("Valores de cor HEX precisam ser alfanuméricos hexadecimais");

                    if (values.length != 6) throw new RangeError("Valores de cor HEX precisam ter 6 caracteres");

                    values = {
                        red: parseInt(values.substring(0, 2), 16),
                        green: parseInt(values.substring(2, 4), 16),
                        blue: parseInt(values.substring(4, 6), 16)
                    }
                case "rgb":
                    if (!values || typeof values != "object") throw new TypeError("Valores de cor RGB precisam ser um objeto");

                    if (typeof values.red == "undefined") values.red = 0;
                    if (typeof values.green == "undefined") values.green = 0;
                    if (typeof values.blue == "undefined") values.blue = 0;

                    if (typeof values.red !== "number") invalid.push("red");
                    if (typeof values.green !== "number") invalid.push("green");
                    if (typeof values.blue !== "number") invalid.push("blue");
                    if (invalid.length > 0) throw new TypeError(`Cores RGB precisam de [${invalid.join(", ")}] numéricos`);

                    if (values.red > 255 || values.red < 0) invalid.push("red");
                    if (values.green > 255 || values.green < 0) invalid.push("green");
                    if (values.blue > 255 || values.blue < 0) invalid.push("blue");
                    if (invalid.length > 0) throw new RangeError(`Cores RGB precisam de [${invalid.join(", ")}] entre 0 e 255`);

                    this.red = parseInt(values.red);
                    this.green = parseInt(values.green);
                    this.blue = parseInt(values.blue);

                    let red_rgb = this.red / 255;
                    let green_rgb = this.green / 255;
                    let blue_rgb = this.blue / 255;

                    let max = Math.max(red_rgb, green_rgb, blue_rgb);
                    let min = Math.min(red_rgb, green_rgb, blue_rgb);

                    let hue_rgb = 0;
                    let saturation_rgb = 0;
                    let lightness_rgb = (max + min) / 2;

                    if (max != min) {
                        let delta = max - min;
                        saturation_rgb = lightness_rgb > 0.5 ? delta / (2 - max - min) : delta / (max + min);

                        switch (max) {
                            case red_rgb:
                                hue_rgb = (green_rgb - blue_rgb) / delta + (green_rgb < blue_rgb ? 6 : 0);
                                break;
                            case green_rgb:
                                hue_rgb = (blue_rgb - red_rgb) / delta + 2;
                                break;
                            case blue_rgb:
                                hue_rgb = (red_rgb - green_rgb) / delta + 4;
                                break;
                        }

                        hue_rgb /= 6;
                    } else {
                        hue_rgb = saturation_rgb = 0;
                    }

                    this.hue = Math.round(hue_rgb * 360);
                    this.saturation = Math.round(saturation_rgb * 100);
                    this.lightness = Math.round(lightness_rgb * 100);
                    break;
            
                case "hsl":
                    if (!values || typeof values != "object") throw new TypeError("Valores de cor HSL precisam ser um objeto");

                    if (typeof values.hue == "undefined") values.hue = 0;
                    if (typeof values.saturation == "undefined") values.saturation = 100;
                    if (typeof values.lightness == "undefined") values.lightness = 50;

                    if (typeof values.hue !== "number") invalid.push("hue");
                    if (typeof values.saturation !== "number") invalid.push("saturation");
                    if (typeof values.lightness !== "number") invalid.push("lightness");
                    if (invalid.length > 0) throw new TypeError(`Cores HSL precisam de [${invalid.join(", ")}] numéricos`);

                    if (values.hue > 360 || values.hue < 0) throw new RangeError("Cores HSL precisam de [hue] entre 0 e 360");
                    if (values.saturation > 100 || values.saturation < 0) invalid.push("saturation");
                    if (values.lightness > 100 || values.lightness < 0) invalid.push("lightness");
                    if (invalid.length > 0) throw new RangeError(`Cores HSL precisam de [${invalid.join(", ")}] entre 0 e 100`);

                    this.hue = parseInt(values.hue);
                    this.saturation = parseInt(values.saturation);
                    this.lightness = parseInt(values.lightness);

                    let hue_hsl = values.hue / 360;
                    let saturation_hsl = values.saturation / 100;
                    let lightness_hsl = values.lightness / 100;

                    let r, g, b;

                    if (saturation_hsl === 0) {
                        r = g = b = lightness_hsl;
                    } else {
                        const q = lightness_hsl < 0.5 ? lightness_hsl * (1 + saturation_hsl) : lightness_hsl + saturation_hsl - lightness_hsl * saturation_hsl;
                        const p = 2 * lightness_hsl - q;

                        r = hslToRGB(p, q, hue_hsl + 1 / 3);
                        g = hslToRGB(p, q, hue_hsl);
                        b = hslToRGB(p, q, hue_hsl - 1 / 3);
                    }

                    this.red = Math.round(r * 255);
                    this.green = Math.round(g * 255);
                    this.blue = Math.round(b * 255);
                    break;

                default:
                    throw new TypeError("Formato de cor desconhecido");
            }

            Object.freeze(this);
        }

        get rgb() { return { red: this.red, green: this.green, blue: this.blue, alpha: this.alpha } }
        get hsl() { return { hue: this.hue, saturation: this.saturation, lightness: this.lightness, alpha: this.alpha } }
        get hex() { return `#${this.red.toString(16).padStart(2, "0")}${this.green.toString(16).padStart(2, "0")}${this.blue.toString(16).padStart(2, "0")}` }
        
        get css_rgb() { return `rgb(${this.red}, ${this.green}, ${this.blue});` }
        get css_hsl() { return `hsl(${this.hue}, ${this.saturation}, ${this.lightness});` }
        get css_rgba() { return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha});` }
        get css_hsla() { return `hsla(${this.hue}, ${this.saturation}, ${this.lightness}, ${this.alpha});` }

        red;
        green;
        blue;
        hue;
        saturation;
        lightness;

        alpha;

        /**
         * Mapeia valores de cor e instancia um objeto.
         * @param {RGBColorObject} values 
         * @param {number} alpha 
         * @returns {Color}
         */
        static rgb(values, alpha = 1) {
            return new Color("rgb", values, alpha);
        }

        /**
         * Mapeia valores de cor e instancia um objeto.
         * @param {HexColorString} string 
         * @param {number} alpha 
         * @returns {Color}
         */
        static hex(string, alpha = 1) {
            return new Color("hex", string, alpha);
        }

        /**
         * Mapeia valores de cor e instancia um objeto.
         * @param {HSLColorObject} values 
         * @param {number} alpha 
         * @returns {Color}
         */
        static hsl(values, alpha = 1) {
            return new Color("hsl", values, alpha);
        }

        /**
         * Verifica se uma string é uma cor hexadecimal válida.
         * @param {string} colorStr 
         * @returns {boolean}
         */
        static validhex(colorStr = "") {
            if (!validstr(colorStr)) return false;
            colorStr = String(colorStr);
            if (colorStr[0] == "#") colorStr = colorStr.replace("#", "");
            for (const char of colorStr) if (!validHexChars.includes(char)) return false;
            if (colorStr.length !== 6 && colorStr.length !== 8) return false;

            return true;
        }
    }

    Namespace(Color, "Color");

    return Color;
})();



class ConsoleStyle {
    constructor() { throw new TypeError("Illegal constructor") }

    static #ProcessedMessage = class StyleProcessedMessage {
        constructor(message = "") {
            message = String(message);
            this.original = message;
            this.escapeReplaced = message;

            let styleIndex = 0;

            while (ConsoleStyle.#ProcessedMessage.#styleBlockRegExp.test(message)) {
                let match = message.match(ConsoleStyle.#ProcessedMessage.#styleBlockRegExp)[1];
                let matchBlock = `{${match}}`;

                try {
                    let styles = match.replaceAll(";", ",").replaceAll(", ", ",").split(",");
                    let styleEscape = "";

                    styles.forEach(style => {
                        let stylecode = ConsoleStyle.#consts[style];

                        if (!stylecode && stylecode != 0) throw new Error("Código de estilo desconhecido");

                        styleEscape += `\x1b[${stylecode}m`;
                    });
                    
                    this.escapeReplaced = this.escapeReplaced.replace(matchBlock, styleEscape);
                    message = message.replace(matchBlock, "");
                } catch(err) {
                    console.error(`Estilo ${styleIndex} inválido: ${err}`);
                    this.escapeReplaced = this.escapeReplaced.replace(matchBlock, "");
                    message = message.replace(matchBlock, "");
                }

                
                styleIndex++;
            }

            this.escapeReplaced += "\x1b[0m";
            this.text = message;

            Object.freeze(this);
        }

        original;
        text;
        escapeReplaced;

        log() { ConsoleStyle.log(this.escapeReplaced) }
        warn() { ConsoleStyle.warn(this.escapeReplaced) }
        error() { ConsoleStyle.error(this.escapeReplaced) }

        static #styleBlockRegExp = /\{([a-z0-9_\,\:]+)\}/;
    }

    static #process(message) { return new ConsoleStyle.#ProcessedMessage(message) }

    static log(message) {
        const processed = ConsoleStyle.#process(message);
        console.log(processed.escapeReplaced);
        return processed;
    }

    static warn(message) {
        const processed = ConsoleStyle.#process(message);
        console.warn(processed.escapeReplaced);
        return processed;
    }

    static error(message) {
        const processed = ConsoleStyle.#process(message);
        console.error(processed.escapeReplaced);
        return processed;
    }

    static #consts = {
        reset: 0,
        bold: 1,
        italic: 3,
        underline: 4,
        default_color_codes: {
            black: [30, 40],
            red: [31, 41],
            green: [32, 42],
            yellow: [33, 43],
            blue: [34, 44],
            magenta: [35, 45],
            cyan: [36, 46],
            white: [37, 47],
            bright_black: [90, 100],
            bright_red: [91, 101],
            bright_green: [92, 102],
            bright_yellow: [93, 103],
            bright_blue: [94, 104],
            bright_magenta: [95, 105],
            bright_cyan: [96, 106],
            bright_white: [97, 107]
        },
        setup_colors: {
            aqua: "0;255;255",
            aliceblue: "240;248;255",
            antiquewhite: "250;235;215",
            aquamarine: "127;255;212",
            azure: "240;255;255",
            beige: "245;245;220",
            bisque: "255;228;196",
            blanchedalmond: "255;235;205",
            blueviolet: "138;43;226",
            brown: "165;42;42",
            burlywood: "222;184;135",
            cadetblue: "95;158;160",
            chartreuse: "127;255;0",
            chocolate: "210;105;30",
            coral: "255;127;80",
            cornflowerblue: "100;149;237",
            cornsilk: "255;248;220",
            crimson: "220;20;60",
            darkblue: "0;0;139",
            darkcyan: "0;139;139",
            darkgoldenrod: "184;134;11",
            darkgray: "169;169;169",
            darkgreen: "0;100;0",
            darkkhaki: "189;183;107",
            darkmagenta: "139;0;139",
            darkolivegreen: "85;107;47",
            darkorange: "255;140;0",
            darkorchid: "153;50;204",
            darkred: "139;0;0",
            darksalmon: "233;150;122",
            darkseagreen: "143;188;143",
            darkslateblue: "72;61;139",
            darkslategrey: "47;79;79",
            darkturquoise: "0;206;209",
            darkviolet: "148;0;211",
            deeppink: "255;20;147",
            deepskyblue: "0;191;255",
            dimgray: "105;105;105",
            dodgerblue: "30;144;255",
            firebrick: "178;34;34",
            floralwhite: "255;250;240",
            forestgreen: "34;139;34",
            fuchsia: "255;0;255",
            gainsboro: "220;220;220",
            ghostwhite: "248;248;255",
            gold: "255;215;0",
            goldenrod: "218;165;32",
            gray: "128;128;128",
            green: "0;128;0",
            greenyellow: "173;255;47",
            honeydew: "240;255;240",
            hotpink: "255;105;180",
            indianred: "205;92;92",
            indigo: "75;0;130",
            ivory: "255;255;240",
            khaki: "240;230;140",
            lavender: "230;230;250",
            lavenderblush: "255;240;245",
            lawngreen: "124;252;0",
            lemonchiffon: "255;250;205",
            lightblue: "173;216;230",
            lightcoral: "240;128;128",
            lightcyan: "224;255;255",
            lightgoldenrodyellow: "250;250;210",
            lightgray: "211;211;211",
            lightgreen: "144;238;144",
            lightpink: "255;182;193",
            lightsalmon: "255;160;122",
            lightseagreen: "32;178;170",
            lightskyblue: "135;206;250",
            lightslategrey: "119;136;153",
            lightsteelblue: "176;196;222",
            lightyellow: "255;255;224",
            lime: "0;255;0",
            limegreen: "50;205;50",
            linen: "250;240;230",
            magenta: "255;0;255",
            maroon: "128;0;0",
            mediumaquamarine: "102;205;170",
            mediumblue: "0;0;205",
            mediumorchid: "186;85;211",
            mediumpurple: "147;112;219",
            mediumseagreen: "60;179;113",
            mediumslateblue: "123;104;238",
            mediumspringgreen: "0;250;154",
            mediumturquoise: "72;209;204",
            mediumvioletred: "199;21;133",
            midnightblue: "25;25;112",
            mintcream: "245;255;250",
            mistyrose: "255;228;225",
            moccasin: "255;228;181",
            navajowhite: "255;222;173",
            navy: "0;0;128",
            oldlace: "253;245;230",
            olive: "128;128;0",
            olivedrab: "107;142;35",
            orange: "255;165;0",
            orangered: "255;69;0",
            orchid: "218;112;214",
            palegoldenrod: "238;232;170",
            palegreen: "152;251;152",
            paleturquoise: "175;238;238",
            palevioletred: "219;112;147",
            papayawhip: "255;239;213",
            peachpuff: "255;218;185",
            peru: "205;133;63",
            pink: "255;192;203",
            plum: "221;160;221",
            powderblue: "176;224;230",
            purple: "128;0;128",
            rebeccapurple: "102;51;153",
            rosybrown: "188;143;143",
            royalblue: "65;105;225",
            saddlebrown: "139;69;19",
            salmon: "250;128;114",
            sandybrown: "244;164;96",
            seagreen: "46;139;87",
            seashell: "255;245;238",
            sienna: "160;82;45",
            silver: "192;192;192",
            skyblue: "135;206;235",
            slateblue: "106;90;205",
            slategray: "112;128;144",
            snow: "255;250;250",
            springgreen: "0;255;127",
            steelblue: "70;130;180",
            tan: "210;180;140",
            teal: "0;128;128",
            thistle: "216;191;216",
            tomato: "255;99;71",
            turquoise: "64;224;208",
            violet: "238;130;238",
            wheat: "245;222;179",
            whitesmoke: "245;245;245",
            yellowgreen: "154;205;50"
        }
    }

    static #colorNames = [];

    static {
        const default_color_codes = ConsoleStyle.#consts.default_color_codes;
        delete ConsoleStyle.#consts.default_color_codes;

        for (const [ color, [ text, background ] ] of Object.entries(default_color_codes)) {
            ConsoleStyle.#consts[`${color}`] = text;
            ConsoleStyle.#consts[`color:${color}`] = text;
            ConsoleStyle.#consts[`background:${color}`] = background;

            ConsoleStyle.#colorNames.push(color);
        }

        const setup_colors = ConsoleStyle.#consts.setup_colors;
        delete ConsoleStyle.#consts.setup_colors;

        for (const [ color, code ] of Object.entries(setup_colors)) {
            ConsoleStyle.#consts[`${color}`] = `38;2;${code}`;
            ConsoleStyle.#consts[`color:${color}`] = `38;2;${code}`;
            ConsoleStyle.#consts[`background:${color}`] = `48;2;${code}`;

            ConsoleStyle.#colorNames.push(color);
        }
    }

    static colorshow() {
        for (const color of ConsoleStyle.#colorNames) {
            ConsoleStyle.log(`{${color}}${color}`)
        }
    }
}





var Cookie = ( function() {
    const Cookie = {};
    Namespace(Cookie, "Cookie");
    
    Cookie.parse = function parseCookie(cookieHeaderString) {
        cookieHeaderString = String(cookieHeaderString);
    
        const cookies = {};
    
        if (cookieHeaderString) {
            cookieHeaderString.split(";").forEach(cookieString => {
                const [ cookieName, cookieValue ] = cookieString.split('=');
                if (cookieName && cookieValue !== undefined) {
                    cookies[cookieName.trim()] = decodeURIComponent(cookieValue.trim());
                }
            });
        }
    
        return cookies;
    }
    
    Cookie.stringify = function stringifyCookie(cookieObject) {
        if (!(cookieObject instanceof Object) || typeof cookieObject !== "object") throw new TypeError("Não é possível compilar não-objetos");
    
        let cookie = [];
    
        for (const [key, value] of Object.entries(cookieObject)) {
            cookie.push(`${encodeURIComponent(key.trim())}=${encodeURIComponent(String(value).trim())}`);
        }
    
        return cookie.join(";");
    }

    return Cookie;
} )();






var Compatibility = ( function() {
    const Compatibility = {};
    Namespace(Compatibility, "Compabilitity");

    let privateFields = function privateFields() {
        try {
            new (class {
                #privateField;
            })()
        } catch (err) {
            console.error(err);
            return false;
        }
        return true;
    }
    Property.assign(Compatibility, "privateFields", "get", privateFields);

    return Compatibility;
} )();



// Search

/**
 * Procura por um elemento.
 * @param {string} target Alvo de busca.
 * @param {"id"|"class"|"tag"|"name"|"query"|"queryAll"} method Meio de busca.
 * @returns {HTMLElement|HTMLCollection|NodeList|null}
 * @throws {TypeError} Caso o alvo não seja uma string.
 * @throws {OptionError} Caso selecione métodos inválidos.
 */
function searchElement(target, method = 'id') {
    if (typeof window == "undefined") throw new ContextError("não é possível utilizar este método fora de um ambiente navegador");
    target = String(target);
    if (!['id', 'class', 'tag', 'name', 'query', 'queryAll'].includes(method)) throw new OptionError("método de busca precisa ser \"id\", \"class\", \"tag\", \"name\", \"query\" ou \"queryAll\"");

    switch (method) {
        case "id":
            return document.getElementById(target);
        case "class":
            return document.getElementsByClassName(target);
        case "tag":
            return document.getElementsByTagName(target);
        case "name":
            return document.getElementsByName(target);
        case "query":
            return document.querySelector(target);
        case "queryAll":
            return document.querySelectorAll(target);
    }
}

// Storage Management

class WebStorageManager {
    constructor(prefix, storage) {
        if (!String.testValidConversion(prefix)) throw new TypeError("prefixo com valor inválido para conversão em string");
        prefix = String(prefix);
        if (storage == "session") storage = window.sessionStorage;
        if (storage == "local") storage = window.localStorage;

        if (!prefix.length.isBetween(1, 50, true)) throw new RangeError("prefixo de tamanho inválido (entre 1 e 50)");
        if (!(storage instanceof Storage)) throw new TypeError("armazenamento não encontrado");

        this.#storage = storage;
        this.#prefix = prefix;
    }

    #prefix;
    #storage;
    #values = new TypedMap(WebStorageManager.#Data, String);
    #data_types = new TypedMap(String, String);

    get prefix() {
        return this.#prefix;
    }

    get storage() {
        return this.#storage;
    }

    key(key) {
        if (!String.testValidConversion(key)) throw new TypeError("chave inválida para conversão em string");
        return `${this.prefix}:${key}`;
    }

    unkey(key) {
        if (!String.testValidConversion(key)) throw new TypeError("chave inválida para conversão em string");
        key = String(key);
        let regexp = new RegExp(`${this.#prefix}:.+`);
        if (regexp.test(key)) {
            return key.slice((this.#prefix + ":").length);
        } else {
            return undefined;
        }
    }

    static #illegal_values = ["storage_data_types"];

    static #Data = class WebStorageManagerData {
        /**
         * 
         * @param {string} key
         * @param {any} value
         * @param {"string"|"number"|"boolean"|"json"|"raw"} type
         */
        constructor(key, value, type) {
            if (!String.testValidConversion(key)) throw new TypeError("chave inválida para conversão em string");
            key = String(key);
            const DataConstructor = WebStorageManager.#Data
            if (!DataConstructor.#dataTypes.includes(type)) throw new TypeError(`tipo de valor inválido (${DataConstructor.#dataTypes.join(', ')})`);

            let unmatchError = (type) => new TypeError(`valor inválido para ${type}`);

            this.set(value, type);

            this.#key = key;
        }

        #key;
        #value;
        #rawValue;
        #type;

        get key() {
            return this.#key;
        }

        get value() {
            return this.#value;
        }

        get rawValue() {
            return this.#rawValue;
        }

        set value(newValue) {
            this.set(newValue, this.#type);
        }

        get type() {
            return this.#type;
        }

        set(value, type) {
            switch (type) {
                case "boolean":
                    if (typeof value !== "boolean") throw unmatchError(type);
                    break;
                case "json":
                    if (typeof value !== "object" || value === null) throw unmatchError(type);
                    break;
                case "number":
                    if (typeof value !== "number") throw unmatchError(type);
                    break;
                case "string":
                    if (typeof value !== "string") throw unmatchError(type);
                    break;
            }

            if (type === "raw") {
                this.#value = String(value);
                this.#rawValue = String(value);
            } else {
                this.#value = value;
                this.#rawValue = JSON.stringify(value)
            }

            this.#type = type;
        }

        static #dataTypes = [ "string", "number", "boolean", "json", "raw" ];
    }

    get #dataTypesObject() {
        return JSON.stringify(Object.fromEntries(this.#data_types.entries()));
    }

    set(key, value, type = "raw") {
        if (WebStorageManager.#illegal_values.includes(key)) throw new TypeError("chave ilegal");
        if (!String.testValidConversion(key)) throw new TypeError("chave inválida para conversão em string");
        key = String(key);

        if (this.#values.has(key)) {
            const data = this.#values.get(key);
            data.set(value, type);
        } else {
            this.#values.set(key, new WebStorageManager.#Data(key, value, type));
        }

        const data = this.#values.get(key);
        let prefixKey = this.key(data.key);
        this.#storage.setItem(prefixKey, data.rawValue);
        this.#data_types.set(key, data.type);
        this.#storage.setItem(this.key('storage_data_types'), this.#dataTypesObject);
    }

    get(key) {
        if (this.#values.has(key)) {
            return this.#values.get(key).value;
        } else {
            return undefined;
        }
    }

    remove(key) {
        if (this.#values.has(key)) {
            this.#values.delete(key);
            this.#data_types.delete(key);
            let prefixKey = this.key(key);
            this.#storage.removeItem(prefixKey);
            this.#storage.setItem(this.key('storage_data_types'), this.#dataTypesObject);
        }
    }

    clear() {
        [...this.#values.keys()].forEach(key => {
            this.remove(key);
        });
    }

    *dataObjects() {
        for (const value of this.#values.values()) {
            yield {
                key: value.key,
                value: value.value,
                rawValue: value.rawValue,
                type: value.type
            };
        }
    }

    *values() {
        for (const value of this.#values.values()) {
            yield value.value;
        }
    }

    *keys() {
        for (const key of this.#values.keys()) {
            yield key;
        }
    }

    *entries(dataObjects = false) {
        dataObjects = Boolean(dataObjects);
        for (const [key, value] of this.#values.entries()) {
            if (dataObjects) {
                yield [
                    key,
                    {
                        key: value.key,
                        value: value.value,
                        rawValue: value.rawValue,
                        type: value.type
                    }
                ];
            } else {
                yield [
                    key,
                    value.value
                ];
            }
        }
    }

    *[Symbol.iterator]() {
        yield* this.entries(false);
    }

    #loaded = false;

    load() {
        if (this.#loaded) return;
        this.#loaded = true;

        let types = JSON.parse(this.#storage.getItem(this.key('storage_data_types')));
        if (!types) types = {};
        
        for (let i = 0; i < this.#storage.length; i++) {
            const key = this.#storage.key(i);
            const value = this.#storage.getItem(key);
            
            const unkey = this.unkey(key);
            const type = types[unkey];
            if (unkey) {
                if (WebStorageManager.#illegal_values.includes(unkey)) continue;
                if (type == undefined || type == "raw") {
                    this.set(unkey, value, type);
                } else {
                    this.set(unkey, JSON.parse(value), type);
                }
            }
        }
    }
}

// Visual Control

class ChromaticManager {
    constructor() {
        throw new TypeError("impossível utilizar este construtor");
    }

    static Theme = class ChromaticPackageTheme {
        constructor(name, base, vars, filters, reverse) {
            if (!String.testValidConversion(name)) throw new TypeError("nome inválido para conversão em string");
            if (!String.testValidConversion(base)) throw new TypeError("base inválida para conversão em string");
            if (!String.testValidConversion(reverse)) throw new TypeError("nome de tema inverso inválido para conversão em string");

            name = String(name);
            reverse = String(reverse);
            base = String(base);
            if (!isValidHexColor(base)) throw new TypeError("cor base não é uma cor hexadecimal");

            if (!(vars instanceof Array)) throw new TypeError("cores variantes precisam estar num array");
            if (vars.length == 0) throw new RangeError("não existem cores variantes");
            if (!(filters instanceof Array)) throw new TypeError("filtros precisam estar num array");
            if (filters.length == 0) throw new RangeError("não existem filtros");

            vars.forEach((varColor, index) => {
                if (!isValidHexColor(varColor)) throw new TypeError(`cor variante [${index}] não é uma cor hexadecimal`);
            });
            filters.forEach((filter, index) => {
                if (!isValidHexColor(filter)) throw new TypeError(`filtro [${index}] não é uma cor hexadecimal`);
            });

            this.#name = name;
            this.#base = base;
            this.#vars.push(...vars);
            this.#filters.push(...filters);
            this.#reverse = reverse;

            ChromaticManager.#themeList.set(name, this)
        }

        #name = "";
        #base = "";
        #vars = [];
        #filters = [];
        #reverse = "";

        get name() { return this.#name }
        get base() { return this.#base }
        get vars() { return [...this.#vars] }
        get filters() { return [...this.#filters] }
        get reverse() { return this.#reverse }
    }

    static Color = class ChromaticPackageColor {
        constructor(name) {
            if (!String.testValidConversion(name)) throw new TypeError("nome inválido para conversão em string");
            name = String(name);
            this.#name = name;

            ChromaticManager.#colorList.set(name, this);
        }

        setThemeColor(theme, color, vars, filters) {
            if (!String.testValidConversion(color)) throw new TypeError("cor inválida para conversão em string");
            if (!String.testValidConversion(theme)) throw new TypeError("tema inválido para conversão em string");
            color = String(color);
            theme = String(theme);
            if (!isValidHexColor(color)) throw new TypeError("cor inserida não é uma cor hexadecimal");
            if (![...ChromaticManager.#themeList.keys()].includes(theme)) throw new ReferenceError("tema selecionado não foi encontrado na lista de temas");
            if (!(vars instanceof Array)) throw new TypeError("cores variantes precisam estar num array");
            if (!(filters instanceof Array)) throw new TypeError("filtros precisam estar num array");

            vars.forEach((varColor, index) => {
                if (!isValidHexColor(varColor)) throw new TypeError(`cor variante [${index}] não é uma cor hexadecimal`);
            });

            filters.forEach((filter, index) => {
                if (!isValidHexColor(filter)) throw new TypeError(`filtro [${index}] não é uma cor hexadecimal`);
            });
            this.#colors.set(theme, new ChromaticManager.Color.#ThemeColor(theme, color, vars, filters));

            return this;
        }

        #name;
        #colors = new TypedMap(ChromaticManager.Color.#ThemeColor, String);

        get name() { return this.#name }
        get colors() {
            let returnObj = {};
            for (const [theme, color] of this.#colors.entries()) {
                returnObj[theme] = color;
            }
            return returnObj;
        }

        static #ThemeColor = class ChromaticPackageColorThemeInstance {
            constructor(theme, color, vars, filters) {
                this.theme = theme;
                this.color = color;
                this.#vars.push(...vars);
                this.#filters.push(...filters);
            }

            #vars = [];
            #filters = [];

            get vars() {
                return [...this.#vars];
            }

            get filters() {
                return [...this.#filters];
            }
        }
    }

    static #themeList = new TypedMap(ChromaticManager.Theme, String);
    static #colorList = new TypedMap(ChromaticManager.Color, String);

    static applyTheme(theme, target = searchElement('html', 'query')) {
        if (!(target instanceof HTMLElement)) throw new TypeError("não é possível aplicar tema fora de um elemento");

        if (theme instanceof ChromaticManager.Theme) {
            theme = theme.name;
        } else if (String.testValidConversion(theme)) {
            theme = String(theme);
        } else {
            throw new TypeError("tema inválido para ser aplicado");
        }

        let themes = [...ChromaticManager.#themeList.keys()];

        if (themes.includes(theme)) {
            themes.forEach(checkTheme => {
                if (checkTheme === theme) {
                    target.classList.add(`${checkTheme}Theme`);
                } else {
                    target.classList.remove(`${checkTheme}Theme`);
                }
            });
        } else {
            throw new ReferenceError("tema não encontrado na lista de temas");
        }
    }

    static applyColor(color, target = searchElement('html', 'query')) {
        if (!(target instanceof HTMLElement)) throw new TypeError("não é possível aplicar cor fora de um elemento");

        if (color instanceof ChromaticManager.Color) {
            color = color.name;
        } else if (String.testValidConversion(color)) {
            color = String(color);
        } else {
            throw new TypeError("cor inválida para ser aplicado");
        }

        let colors = [...ChromaticManager.#colorList.keys()];

        if (colors.includes(color)) {
            colors.forEach(checkColor => {
                if (checkColor === color) {
                    target.classList.add(`${checkColor}Main`);
                } else {
                    target.classList.remove(`${checkColor}Main`);
                }
            });
        } else {
            throw new ReferenceError("cor não encontrada na lista de cores");
        }
    }

    static apply(theme, color, target = searchElement('html', 'query')) {
        this.applyTheme(theme, target);
        this.applyColor(color, target);
    }

    static loadJSON = async function loadJSON(jsonlocation) {
        const json = await fetch(jsonlocation).then(resp => resp.json())
        
        Object.values(json).forEach(theme => {
            const name = theme.name;
            const reverse = theme.reverse;
            const base = theme.base;
            const vars = Object.values(theme.vars);
            const filters = Object.values(theme.filters);

            new ChromaticManager.Theme(name, base, vars, filters, reverse);

            Object.entries(theme.colors).forEach(colorDouble => {
                const [ name, color ] = colorDouble;

                const code = color.code;
                const vars = Object.values(color.vars);
                const filters = Object.values(color.filters);

                if (this.#colorList.has(name)) {
                    this.#colorList.get(name).setThemeColor(theme.name, code, vars, filters);
                } else {
                    new ChromaticManager.Color(name);
                    this.#colorList.get(name).setThemeColor(theme.name, code, vars, filters);
                }
            });
        });

        return json;
    }
}

// Interactive Elements

class InvisibleForm {
    constructor(destination = '', method = 'GET', target = '_self') {
        this.destination = destination;
        this.method = method;
        this.target = target;

        Property.set(this, 'form', "freeze", "lock");
        Object.preventExtensions(this);

        const form = this.#form;
        Property.set(form, 'submit', "hide", "freeze", "lock");
    }

    #form = document.createElement('form');
    #destination = '';
    #method = 'GET';
    #target = '_self';

    get destination() { return this.#destination; }
    get method() { return this.#method; }
    get target() { return this.#target; }

    set destination(value) {
        if (!String.testValidConversion(value)) throw new TypeError("destino inválido para conversão em string");
        this.#destination = String(value);
    }
    set method(value) {
        if (!String.testValidConversion(value)) throw new TypeError("método inválido para conversão em string");
        this.#method = String(value);
    }
    set target(value) {
        if (!String.testValidConversion(value)) throw new TypeError("alvo inválido para conversão em string");
        this.#target = String(value);
    }

    #values = new TypedMap(String, String);
    #inputs = new TypedMap(HTMLInputElement, String);

    set(name, value) {
        if (!String.testValidConversion(name)) throw new TypeError("nome inválido para conversão em string");
        if (!String.testValidConversion(value)) throw new TypeError("valor inválido para conversão em string");
        name = String(name);
        value = String(value);

        const input = document.createElement('input');

        input.name = name;
        input.value = value;

        this.#values.set(name, value);
        this.#inputs.set(name, input);

        this.#form.append(input);
    }

    remove(name) {
        if (!String.testValidConversion(name)) throw new TypeError("nome inválido para conversão em string");
        name = String(name);

        if (this.#values.has(name)) {
            const input = this.#inputs.get(name);
            this.#values.delete(name);
            this.#inputs.delete(name);
            input.remove();
        }
    }

    get(name, type = 'value') {
        if (!String.testValidConversion(name)) throw new TypeError("nome inválido para conversão em string");
        name = String(name);
        if (!['value', 'input'].includes(type)) throw new TypeError("tipo inválido");

        if (this.#values.has(name)) {
            switch (type) {
                case 'value':
                    return this.#values.get(name);
                case 'input':
                    return this.#inputs.get(name);
            }
        } else {
            return undefined;
        }
    }

    has(name) {
        if (!String.testValidConversion(name)) throw new TypeError("nome inválido para conversão em string");
        name = String(name);

        return this.#values.has(name);
    }

    submit() {
        this.#form.submit()
    }

    onsubmit(event) {
        if (typeof event !== "function") throw new TypeError("evento inválido");

        this.#form.addEventListener('submit', event);
    }
}

class Popup {
    constructor(link, popupconfig) {
        if (!String.testValidConversion(link)) throw new TypeError("link inválido para conversão em string");
        link = String(link);
        this.#link = link;

        String.testValidConversion(popupconfig) ? popupconfig = String(popupconfig) : popupconfig = Popup.popupConfig();
        this.#config = popupconfig;

        Object.defineProperty(this, 'storage', { writable: false, configurable: false });
        Object.preventExtensions(this);
    }

    static popupConfig(height = 800, width = 500) {
        const left = (screen.height / 2) - (width / 2);
        const top = (screen.width / 2) - (height / 2);

        return `height=${height}, width=${width}, top=${top}, left=${left}`;
    }

    #link;
    #config;

    storage = {};
    /** @type {null|Window} */
    window = null;

    open() {
        if (this.window !== null && !this.window.closed) return null;
        this.window = window.open(this.#link, "_blank", this.#config);
        if (this.window === null) return null;
        this.window.addEventListener('load', () => {
            this.window[Popup.IncomingStorageSymbol] = this.storage;
        });
        this.window.addEventListener('beforeunload', () => {
            this.window = null;
        });
        
        return this.window;
    }

    close() {
        if (this.window === null) return;
        this.window.close();
    }

    static #IncomingStorage = Symbol('IncomingPopupStorage');

    static get IncomingStorageSymbol() {
        if (window.opener === null) return this.#IncomingStorage;
        return window.opener.Symbol.incomingPopupStorage;
    }

    static get IncomingStorage() {
        if (window.opener === null) return null;
        return window[this.IncomingStorageSymbol];
    }

    static {
        Symbol.incomingPopupStorage = this.IncomingStorageSymbol;
        Property.set(Symbol, 'incomingPopupStorage', 'hide', 'lock', 'freeze');
    }
}