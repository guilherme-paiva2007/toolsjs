class Time {
    static #privateConstructorSymbol = Symbol("TimePrivateConstructorIdentifier")

    static #privateConstructor(timeobject, ms, { skipWeeks = true } = { }) {
        for (const [ unitValue, unitName, unitFullName ] of Time.#unitStack) {
            if (skipWeeks && unitName == "W") continue;
            let unitFromMs = Time.fromMs(ms, unitName);

            timeobject[unitFullName] = unitFromMs;
            ms -= unitFromMs * unitValue;
        }

        Object.freeze(this);
    }

    constructor(ms) {
        if (Object.values(arguments).includes(Time.#privateConstructorSymbol)) {
            Time.#privateConstructor(this, ms);
        } else {
            throw new TypeError("Illegal constructor");
        }
    }

    years;
    months;
    weeks;
    days;
    hours;
    minutes;
    seconds;
    milisseconds;

    static toMs(time, unit) {
        if (Time.#units[unit]) {
            return time * Time.#units[unit];
        } else throw new TypeError("Unidade de tempo desconhecida");
    }

    static fromMs(ms, unit) {
        switch (unit) {
            case "ms":
            case "milisseconds":
                return parseInt(ms);
            case "s":
            case "seconds":
                return Time.seconds(ms);
            case "m":
            case "minutes":
                return Time.minutes(ms);
            case "h":
            case "hours":
                return Time.hours(ms);
            case "D":
            case "days":
                return Time.days(ms);
            case "W":
            case "weeks":
                return Time.weeks(ms);
            case "M":
            case "months":
                return Time.months(ms);
            case "Y":
            case "years":
                return Time.years(ms);
            default:
                return 0;
        }
    }

    /**
     * Obtém a quantidade de segundos presentes em um intervalo de milissegundos.
     * @param {number} ms 
     * @returns {number}
     */
    static seconds(ms) { return Math.floor(ms / Time.#units["s"]) }
    /**
     * Obtém a quantidade de minutos presentes em um intervalo de milissegundos.
     * @param {number} ms 
     * @returns {number}
     */
    static minutes(ms) { return Math.floor(ms / Time.#units["m"]) }
    /**
     * Obtém a quantidade de horas presentes em um intervalo de milissegundos.
     * @param {number} ms 
     * @returns {number}
     */
    static hours(ms) { return Math.floor(ms / Time.#units["h"]) }
    /**
     * Obtém a quantidade de dias presentes em um intervalo de milissegundos.
     * @param {number} ms 
     * @returns {number}
     */
    static days(ms) { return Math.floor(ms / Time.#units["D"]) }
    /**
     * Obtém a quantidade de semanas presentes em um intervalo de milissegundos.
     * @param {number} ms 
     * @returns {number}
     */
    static weeks(ms) { return Math.floor(ms / Time.#units["W"]) }
    /**
     * Obtém a quantidade de meses presentes em um intervalo de milissegundos.
     * @param {number} ms 
     * @returns {number}
     */
    static months(ms) { return Math.floor(ms / Time.#units["M"]) }
    /**
     * Obtém a quantidade de anos presentes em um intervalo de milissegundos.
     * @param {number} ms 
     * @returns {number}
     */
    static years(ms) { return Math.floor(ms / Time.#units["Y"]) }

    static parse(ms) {
        return new Time(ms, Time.#privateConstructorSymbol);
    }

    static #units = {
        ms: 1,
        s: 1000,
        m: 1000 * 60,
        h: 1000 * 60 * 60,
        D: 1000 * 60 * 60 * 24,
        W: 1000 * 60 * 60 * 24 * 7,
        M: 1000 * 60 * 60 * 24 * 30,
        Y: 1000 * 60 * 60 * 24 * 365
    }

    static #unitStack = [
        [ this.#units.ms, "ms", "milisseconds" ],
        [ this.#units.s, "s", "seconds" ],
        [ this.#units.m, "m", "minutes" ],
        [ this.#units.h, "h", "hours" ],
        [ this.#units.D, "D", "days" ],
        [ this.#units.W, "W", "weeks" ],
        [ this.#units.M, "M", "months" ],
        [ this.#units.Y, "Y", "years" ]
    ].reverse();
}

module.exports = Time;