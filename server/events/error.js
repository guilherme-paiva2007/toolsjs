/** @type {import("../../src/node/page").ExecutePageOnErrorCallback} */
module.exports = function onError({ content }, __, error) {
    console.log("EVENTO DE ERRO:", error);
    content.append("Um erro ocorreu...")
    return true;
}