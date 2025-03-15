const Namespace = require("../namespace.js");

/**
 * Identificador.
 */
var ID = (function() {
    const ID = {};
    Namespace(ID, "ID");

    /**
     * Cria um ID de string baseado em data.
     * @param {Date} date 
     * @returns {string}
     */
    ID.date = function date(date, mainjoin = "-", subjoin = ".") {
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

    return ID;
})();

module.exports = ID;