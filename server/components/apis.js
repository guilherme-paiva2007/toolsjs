module.exports = function execute({}, { apis }) {
    return `<ul>${Object.entries(apis).map(([key, value]) => "<li>" + key + ": " + value?.toString() + "</li>").join()}</ul>`;
}