// COMPILA src/ EM UM ÚNICO ARQUIVO PARA SER UTILIZADO POR WEB

// AVISO: UTILIZE SEMPRE A EXTENSÃO COMPLETA DO ARQUIVO AO IMPORTA-LO COM REQUIRE

/**
 * 
 * @param {{
 *      webmodules: string,
 *      webraw: string,
 *      nodeorigin: string
 * }} processArgs 
 */
function compile(processArgs = process.argv){
    const fs = require("fs");
    const path = require("path");
    const ConsoleStyle = require( "./src/util/consolestyle" );
    const argumentResolver = require( "./src/node/argument_resolver.js" );

    const processArguments = processArgs instanceof Array ? (argumentResolver(processArgs)) : processArgs;
    if (typeof processArguments !== "object") throw new TypeError("processArgs needs to be an object or an array");

    const nodeModulesOrigin = processArguments["nodeorigin"] ?? processArguments["origin"] ?? "src/";
    const webModuleExit = processArguments["webmodules"] ?? "web/";
    const webRawExit = processArguments["webraw"] ?? processArguments["webscripts"] ?? "scripts.js";

    if (typeof nodeModulesOrigin !== "string") throw new Error("nodeorigin argument needs a folder to read the modules");
    if (typeof webModuleExit !== "string") throw new Error("webmodules argument needs a folder to save the compiled modules");
    if (typeof webRawExit !== "string") throw new Error("webraw argument needs a file to save the compiled raw scripts");

    const CommonJSModExportExp = /module\.exports\s*=\s*(.+);?/g;
    const CommonJSExportExp = /exports\s*=\s*(.+);?/g;
    const CommonJSRequireExp = /const\s+(\{[^}]+\}|\w+)\s*=\s*require\(\s*(['"])(.+)\2\s*\);?/g;

    const jsChunksWebRaw = [];
    const jsChunksWebModules = {};
    const dirs = [];

    let fileCount = 0;

    function getJSContent(filepath, folderIndex = false, filename, savingFolder) {
        const file = fs.readFileSync(filepath).toString("utf-8");
        let raw, mod;
        raw = mod = file;

        fileCount++;

        if (!filename.endsWith(".js")) {
            jsChunksWebModules[path.join(savingFolder, filename)] = mod;
            return;
        }
        
        mod = mod.replace(CommonJSRequireExp, "import $1 from \"$3\";");
        mod = mod.replace(CommonJSModExportExp, "export default $1");
        mod = mod.replace(CommonJSExportExp, "export default $1");
        jsChunksWebModules[path.join(savingFolder, filename)] = mod;

        if (folderIndex) return;
        
        raw = raw.replace(CommonJSModExportExp, "");
        raw = raw.replace(CommonJSExportExp, "");
        raw = raw.replace(CommonJSRequireExp, "");
        jsChunksWebRaw.push(raw);

        return;
    }

    function mapFolder(folderpath, files, savingFolder) {
        const folder = files ? files : fs.readdirSync(folderpath);

        dirs.push(savingFolder);

        for (const readingName of folder) {
            let folderIndex = false;
            if (readingName === "node") continue;
            if (readingName === "index.js") folderIndex = true;
            if (readingName.startsWith("__")) continue;

            const readingPath = path.join(folderpath, readingName);
            const readingStat = fs.statSync(readingPath);

            if (readingStat.isFile()) getJSContent(readingPath, folderIndex, readingName, savingFolder);
            if (readingStat.isDirectory()) mapFolder(readingPath, undefined, path.join(savingFolder, readingName));
        }
    }

    const mainDir = [
        "base", // funções iniciais que namespace precisa
        "namespace.js",
        "property.js",
        "collections",
        "errors",
        "util",
        "client",
        "web.js"
    ];

    const mainPath = path.join(__dirname, nodeModulesOrigin);

    mapFolder(mainPath, mainDir, path.join(__dirname, webModuleExit));

    //

    const joinedWebRaw = jsChunksWebRaw.join("\n\n");

    fs.writeFile(path.join(__dirname, webRawExit), joinedWebRaw, "utf-8", (err) => {
        if (err) return ConsoleStyle.error(`{gray,bold}Error: {reset,crimson}${err}`);
        // ConsoleStyle.log(`\n{bold,deepskyblue}${fileCount}{reset,gray} scripts ({darkturquoise}${joinedWebRaw.length}{reset,gray} total characters) compiled in {underline,lightsalmon}${path.join(__dirname, "scripts.js")}\n`);
    });

    for (const d of dirs) if (!fs.existsSync(d)) fs.mkdirSync(d);

    const fileWriting = [];

    for (const [ filepath, content ] of Object.entries(jsChunksWebModules)) {
        const writing = new Promise((resolve, reject) => {
            fs.writeFile(filepath, content, "utf-8", (err) => {
                if (err) {
                    reject(err);
                    return ConsoleStyle.error(`{crimson}${err}`);
                }
                // resolve(`{gray}Written {darkturquoise}${content.length}{reset,gray} characters in {underline,navajowhite}${filepath}`);
                resolve([ content.length, content.filepath ]);
            });
        });

        fileWriting.push(writing);
    }

// Promise.all(fileWriting).then(values => {
//     for (const v of values) ConsoleStyle.log(v);
// }).then(() => console.log(""));
}

if(process.argv[1] === __filename) {
    compile(process.argv);
}

module.exports = compile;