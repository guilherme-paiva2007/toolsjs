const http = require("http");
const net = require("net");
const os = require("os");
const crypto = require("crypto");

const client = net.connect({port: 8080, host: "localhost"}, () => {
    client.write("Hi!!!");
})

process.stdin.on("data", data => {
    data = data.toString().replace("\r\n", "").trim().split(" ");

    const command = data[0];
    const params = data.slice(1);

    switch (command) {
        case "close":
        case "break":
            client.destroy();
            process.exit();
        case "send":
        case "write":
            client.write(params.join(" "));
        default:
            break;
    }
});

client.on("data", data => {
    data = data.toString();
    console.log("<", data);
});

client.on("end", () => {
    console.log("< connection end");
});

// http.createServer((req, res) => {}).listen()