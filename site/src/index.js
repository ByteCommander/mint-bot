configfile = require("../../config.json");

Discord = require("discord.js");
Client = require("./Client.js");
const client = new Client();

ln = require("nodejs-linenumber");
moment = require("moment");

dashboard = require("./discord-bot-dashboard.js");

//Stolen console logger
const originalLog = console.log;
var logChannel = null;
console.log = function (str) {
  originalLog(str);
  if (str && logChannel) {
    logChannel.send(str, {split: true,});
  }
};

//Dashboard stuff
const oAuth = Discord.OAuth2Application;

//Bot ready
client.once("ready", () => {
  logChannel = client.channels.get(configfile.logchannel);

  //look at that a fucking welcome message to the console
  console.log(
    moment().format("MMMM Do YYYY, HH:mm:ss") +
      "\n" +
      __filename +
      ":" +
      ln() +
      `\nWebsite has started`
  );

  // start Website
  dashboard.run(
    client,
    {
      clientSecret: configfile.CLIENT_SECRET,
      redirectURI: configfile.REDIRECT_URI,
    },
    oAuth
  );

  //next
});

//Reconnect
client.once("reconnecting", () => {
  //reconnect console message fuck you too
  console.log(
    moment().format("MMMM Do YYYY, HH:mm:ss") +
      "\n" +
      __filename +
      ":" +
      ln() +
      "\nWebsite has reconnected"
  );

  //next
});

//worthless errors, ignoring them fuck you
client.on("error", (e) => {console.log("ERROR: " + e)});
client.on("warn", (e) => {console.log("WARN: " + e)});
client.on("debug", (e) => {originalLog("DEBUG: " + e)});

//And login in the bot
client.login(configfile.token);
