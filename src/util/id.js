const { OptionError } = require("../errors");

/**
 * Identificador.
 */
class ID {
    /**
     * Identificar único.
     * @param {string} type 
     * @param {{
     *      description: string,
     *      symbol: symbol
     * }} configs 
     */
    constructor(type, configs = {}, ...params) {
        if (!ID.#types.includes(type)) throw new OptionError("tipo de ID inexistente");
        if (configs !== undefined) {
            if (typeof configs !== "object" || configs === null) throw new TypeError("configurações precisam estar em um objeto");
            typeof configs.description == "string" ? this.#description = configs.description : this.#description = "";
            typeof configs.symbol == "symbol" ? this.#symbol = configs.symbol : this.#symbol = Symbol();
        } else {
            this.#symbol = Symbol();
            this.#description = "";
        }

        this.#id = ID[type](...params)
    }

    #id;
    #symbol;
    #description;

    get id() {
        return this.#id;
    }

    get symbol() {
        return this.#symbol;
    }

    get description() {
        return this.#description;
    }

    /**
     * Cria um ID de string baseado em data.
     * @param {Date} date 
     * @returns {string}
     */
    static date(date, mainjoin = "-", subjoin = ".") {
        if (typeof mainjoin !== "string") mainjoin = "-";
        if (typeof subjoin !== "string") subjoin = ".";
        if (!(date instanceof Date)) date = new Date(date);
        if (isNaN(date.valueOf())) date = new Date();

        let fillNLength = (value, length = 2, fill = '0') => {
            return value.toString().padStart(length, fill).slice(0, length);
        }

        return [
            [
                fillNLength(date.getFullYear(), 4),
                fillNLength(date.getMonth() + 1),
                fillNLength(date.getDate())
            ],
            [
                fillNLength(date.getHours()),
                fillNLength(date.getMinutes()),
                fillNLength(date.getSeconds()),
                fillNLength(date.getMilliseconds(), 3)
            ]
        ].map(subarr => subarr.join(subjoin)).join(mainjoin);
    }

    toString() {
        return this.id;
    }

    static #types = [
        this.date.name
    ];
}

module.exports = ID;