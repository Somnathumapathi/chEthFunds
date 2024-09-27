module.exports = {
    networks: {
        development: {
            host: "https://f596-14-195-8-78.ngrok-free.app",
            port: 7545,
            network_id: "*" // Match any network id
        }
    },
    compilers: {
        solc: {
            version: "^0.8.17"
        }
    }
};