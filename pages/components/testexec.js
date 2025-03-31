module.exports = function execute({ text }) {
    return `<p>Text inserted: ${text?.toUpperCase() ?? ""}</p>`
}