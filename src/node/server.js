var ServerManager = ( function() {
    function useWebSocket() {
        try {
            require("ws");
        } catch {
            return null
        }
    }

    const ServerManager = class ServerManager {}
} )();

module.exports = ServerManager;