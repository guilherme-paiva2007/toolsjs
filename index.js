const fs = require("fs");
if (fs.existsSync("./assets/src/")) fs.rmSync("./assets/src/", { recursive: true, force: true });
require("./compile.js")({
    webmodules: "./assets/src/",
    webraw: "./assets/scripts.js"
});



module.exports = require("./src")