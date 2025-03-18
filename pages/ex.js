module.exports = function execute({ response, localhooks }) {
    response.statusCode = 201;
    return JSON.stringify(localhooks);
}