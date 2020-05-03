const configfile = require("../config");
const app = require("./app");

module.exports.run = (client, config, oAuth) => {

    config = {
        maintenanceNotification: config.maintenanceNotification || false,

        baseGame: config.baseGame || "!help | v0.0.6.3",
        baseBot_status: config.baseBot_status || "online",

        maintenanceGame: config.maintenanceGame || "Bot is in maintenance",
        maintenanceBot_status: config.maintenanceBot_status || "dnd",

        clientSecret: oAuth.secret || config.clientSecret,
        redirectURI: config.redirectURI || `http://localhost:${configfile.port_http}/auth/discord/callback`
    };

    app.run(client, config);

};