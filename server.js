process.on("uncaughtException", exception => {
    console.error(exception);
});

require("./server/")