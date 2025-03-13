// const { ServerManager, Page } = require("./src/node");

// const server = new ServerManager(8080, "localhost");

// server.pages.append(
//     new Page( "./index.html", "/", "hypertext", "text/html" ),
//     new Page( "./index.js", "/index.js", "hypertext", "text/javascript" )
// );

// server.listen();
const crypto = require("crypto");

const net = require("net");
const fs = require("fs");
const path = require("path");

const sockets = new Set();

const socketserver = net.createServer(socket => {
    socket.on("data", data => {
        console.log("< data", data.toString("utf-8"));

        fs.writeFile(path.resolve(__dirname, `./logs/${Date.now()}.log`), data, "utf-8", (err) => { if(err) console.error(err) });
    });

    socket.on("close", () => {
        console.log("< disconnected");
    });

    socket.on("error", (err) => {
        console.log("< error -> " + `${err}`);
    });

    // socket.write("Hello");

    

    const headers = [];

    sockets.add(socket);
});

socketserver.listen(8080, "localhost", () => {
    console.log("Listening at localhost:8080");
});

process.stdin.on("data", data => {
    data = data.toString().replace("\r\n", "").trim().split(" ");

    const command = data[0];
    const params = data.slice(1);

    switch (command) {
        case "stop":
        case "break":
            socketserver.close();
            process.exit();
        case "send":
        case "write":
            for (const socket of sockets.values()) {
                socket.write(params.join(" "));
            }
        default:
            break;
    }
});