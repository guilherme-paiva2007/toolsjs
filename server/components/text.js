module.exports = function execute({ text }) {
    return `<p>${text ?? ""}</p>`;
}