//NPM and such
const npm = require("./NPM.js");
npm.npm();

//Shit
const client = new Client();

//load Database
const dbinit = require("./dbinit.js");
dbinit.dbinit();

//Stolen console logger
const originalLog = console.log;
var logChannel = null;
console.log = function (str) {
  originalLog(str);
  if (str && logChannel) {
    logChannel.send(str, {split: true,});
  }
};

//reddit rss feed
const { FeedEmitter } = require("rss-emitter-ts");
const emitter = new FeedEmitter();

//command holder
client.commands = new Discord.Collection();

//command files open
const commandFiles = fs
  .readdirSync("./src/commands")
  .filter((file) => file.endsWith(".js"));

//loopdiloop commands and loads em
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  let usagecheck = getUsage.get(command.name);
  if (!usagecheck) {
    usagecheck = {
      command: command.name,
      number: `0`,
    };
    setUsage.run(usagecheck);
  }
  client.commands.set(command.name, command);
}

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
      `\nBot has started, with ${client.users.size} users.\nI am in ${client.guilds.size} guilds:\n` +
      client.guilds
        .filter((guild) => guild.owner !== undefined)
        .map(
          (guild) =>
            `${guild.id}/${guild.name}\nUsers: ${guild.memberCount}\nOwner: ${guild.owner.user.username}`
        )
        .join("\n\n")
  );

  //loop read
  // setInterval(() => {
  //   console.log('');
  // }, 1000);

  //change bot Status
  setInterval(() => {
    var RAN = [`https://artemisbot.eu`, `${client.guilds.size} servers`];
    client.user.setActivity(RAN[~~(Math.random() * RAN.length)], {
      type: "LISTENING",
    });
  }, 60000);

  //Wipe music
  const musicf = fs.readdirSync("../storage/music");
  for (const file of musicf) {
    fs.unlink("../storage/music/" + file, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  //Reminder run
  setInterval(() => {
    const remindersdb = db
      .prepare("SELECT * FROM remind ORDER BY time DESC;")
      .all();
    for (const data of remindersdb) {
      let timenow = moment().format("YYYYMMDDHHmmss");
      if (timenow > data.time) {
        let gettheguild = client.guilds.get(data.gid);
        let reminduser = gettheguild.members.get(data.uid);
        if (!reminduser) {
          return db
            .prepare(
              `DELETE FROM remind WHERE mid = ${data.mid} AND uid = ${data.uid}`
            )
            .run();
        }
        client.channels.get(data.cid).send("<@" + data.uid + "> PING!");
        const reminderemb2 = new Discord.RichEmbed()
          .setTitle("REMIND ALERT")
          .setAuthor(
            reminduser.user.username + "#" + reminduser.user.discriminator,
            reminduser.user.displayAvatarURL
          )
          .setDescription(reminduser)
          .addField("Reminder: ", data.reminder + "!")
          .setColor("RANDOM");
        client.channels.get(data.cid).send({
          embed: reminderemb2,
        });
        db.prepare(
          `DELETE FROM remind WHERE mid = ${data.mid} AND uid = ${data.uid}`
        ).run();
      }
    }
  }, 5000);

  //streamshit run
  setInterval(() => {
    const timerdb2 = db
      .prepare("SELECT * FROM timers ORDER BY time DESC;")
      .all();
    for (const data of timerdb2) {
      let timenow = moment().format("YYYYMMDDHHmmss");
      if (timenow > data.time) {
        if (data.bs !== "stream") return;
        return db
          .prepare(
            `DELETE FROM timers WHERE cid = ${data.cid} AND uid = ${data.uid}`
          )
          .run();
      }
    }
  }, 5000);

  //mutedshit run
  setInterval(() => {
    const timerdb = db
      .prepare("SELECT * FROM timers ORDER BY time DESC;")
      .all();
    for (const data of timerdb) {
      let timenow = moment().format("YYYYMMDDHHmmss");
      if (timenow > data.time) {
        let gettheguild = client.guilds.get(data.gid);
        let reminduser = gettheguild.members.get(data.uid);
        if (!reminduser) {
          return db
            .prepare(
              `DELETE FROM timers WHERE mid = ${data.mid} AND uid = ${data.uid}`
            )
            .run();
        }
        //try
        if (data.bs !== "mute") return;
        let userscore = getScore.get(data.uid, data.gid);
        if (userscore.muted == `0`)
          return db
            .prepare(
              `DELETE FROM timers WHERE mid = ${data.mid} AND uid = ${data.uid}`
            )
            .run();
        let memberrole = gettheguild.roles.find((r) => r.name === `~/Members`);
        reminduser.addRole(memberrole).catch(console.error);
        let array2 = [];
        client.channels
          .filter((channel) => channel.guild.id === data.gid)
          .map((channels) => array2.push(channels.id));
        for (let i of array2) {
          setTimeout(() => {
            let channel = client.channels.find((channel) => channel.id === i);
            if (channel) {
              if (channel.permissionOverwrites.get(data.uid)) {
                channel.permissionOverwrites.get(data.uid).delete();
              }
            }
          }, 200);
        }
        userscore.muted = `0`;
        userscore.warning = `0`;
        setScore.run(userscore);
        //
        client.channels
          .get(data.cid)
          .send("<@" + data.uid + "> has been unmuted!");
        db.prepare(
          `DELETE FROM remind WHERE mid = ${data.mid} AND uid = ${data.uid}`
        ).run();
      }
    }
  }, 5000);

  //preload messages on for teh reaction channel
  const fetch2 = db.prepare("SELECT * FROM guildhub").all();
  let array4 = [];
  for (const data of fetch2) {
    if (data.reactionChannel > 1) {
      array4.push(data.reactionChannel);
      if (client.channels.get(data.reactionChannel)) {
        client.channels.get(data.reactionChannel).fetchMessages();
      }
    }
  }

  //next
});

//Reconnect
client.once("reconnecting", () => {
  //Wipe music
  const musicf = fs.readdirSync("../storage/music");
  for (const file of musicf) {
    fs.unlink("../storage/music/" + file, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  //reconnect console message fuck you too
  console.log(
    moment().format("MMMM Do YYYY, HH:mm:ss") +
      "\n" +
      __filename +
      ":" +
      ln() +
      `\nBot has reconnected, with ${client.users.size} users.\nI am in ${client.guilds.size} guilds:\n` +
      client.guilds
        .filter((guild) => guild.owner !== undefined)
        .map(
          (guild) =>
            `${guild.id}/${guild.name}\nUsers: ${guild.memberCount}\nOwner: ${guild.owner.user.username}`
        )
        .join("\n\n")
  );

  //next
});

//new member
client.on("guildMemberAdd", async (guildMember) => {
  //load module
  const onGuildMemberAdd = require("./on_guildmemberadd.js");
  onGuildMemberAdd.onGuildMemberAdd(guildMember);

  //next
});

//member leaves
client.on("guildMemberRemove", async (guildMember) => {
  //load module
  const onGuildMemberRemove = require("./on_guildmemberremove.js");
  onGuildMemberRemove.onGuildMemberRemove(guildMember);

  //next
});

//new guild
client.on("guildCreate", (guild) => {
  //log it into the console
  console.log(
    "Joined a new guild: " +
      guild.name +
      " Users: " +
      guild.memberCount +
      " Owner: " +
      guild.owner.user.username
  );

  //Check if they have been sad returnees
  newGuild1 = getGuild.get(guild.id);
  if (!newGuild1) {
    newGuild = getGuild.get(guild.id);
    if (!newGuild) {
      if (!guild.roles.find((r) => r.name === `Muted`)) {
        guild.createRole({
          name: `Muted`,
        });
      }
      if (!guild.roles.find((r) => r.name === `~/Members`)) {
        guild.createRole({
          name: `~/Members`,
        });
      }
      newGuild = {
        guild: guild.id,
        generalChannel: `0`,
        highlightChannel: `0`,
        muteChannel: `0`,
        logsChannel: `0`,
        streamChannel: `0`,
        reactionChannel: `0`,
        streamHere: `0`,
        autoMod: `0`,
        prefix: `!`,
        leveling: `1`,
      };
      setGuild.run(newGuild);
    }
  }

  //next
});

//Fuck you too
client.on("guildDelete", (guild) => {
  //log the pitiful loser who left us
  console.log(
    "Left a guild: " +
      guild.name +
      " Users: " +
      guild.memberCount +
      " Owner: " +
      guild.owner.user.username
  );

  //next
});

//On member change
client.on("guildMemberUpdate", (oldMember, newMember) => {
  //load module
  const onMemberUpdate = require("./on_member_update.js");
  onMemberUpdate.onMemberUpdate(oldMember, newMember);

  //next
});

//presence updates
client.on("presenceUpdate", (oldMember, newMember) => {
  //load module
  const onMemberPrupdate = require("./on_member_prupdate.js");
  onMemberPrupdate.onMemberPrupdate(oldMember, newMember);

  //next
});

//reddit load rss
emitter.add({
  url: "https://www.reddit.com/r/linuxmint/new.rss",
  refresh: 10000,
  ignoreFirst: true,
});

//reddit found a new shit message
emitter.on("item:new", (item) => {
  //converting all that data because emmiter sucks
  const reddittext = htmlToText.fromString(item.description, {
    wordwrap: false,
    ignoreHref: true,
    noLinkBrackets: true,
    preserveNewlines: true,
  });
  let reddittext2 = reddittext.replace("[link]", "").replace("[comments]", "");
  let reddittext3 = reddittext2.substr(0, 1000);

  //welp let's send the shit
  try {
    const redditmessage = new Discord.RichEmbed()
      .setTitle(item.title.substr(0, 100))
      .setURL(item.link)
      .setColor("RANDOM")
      .setDescription(reddittext3)
      .addField(item.link + "\n", "https://www.reddit.com" + item.author, true)
      .setTimestamp();
    return client.channels.get("656194923107713024").send({
      embed: redditmessage,
    });
  } catch {
    //log JK fuck you
    console.log();
  }

  //next
});

//go fuck yourself
emitter.on("feed:error", (error) => {
  //console.error(error.message)
});

//Message delete
client.on("messageDelete", async (message) => {
  //load module
  const onMessageDelete = require("./on_message_delete.js");
  onMessageDelete.onMessageDelete(message);

  //next
});

//Banned fuckers
client.on("guildBanAdd", async (guild, user) => {
  //load module
  const onGuildBanAdd = require("./on_guildbanadd.js");
  onGuildBanAdd.onGuildBanAdd(guild, user);

  //next
});

//Editing your own message does things
client.on("messageUpdate", (oldMessage, newMessage) => {
  //load module
  const onMsgUpdate = require("./on_message_update.js");
  onMsgUpdate.onMsgUpdate(oldMessage, newMessage);

  //next
});

//the best thing here
client.on("message", async (message) => {
  //load module
  const onMessage = require("./on_message.js");
  onMessage.onMessage(message);

  //next
});

//reactionroles and stuff
client.on("messageReactionAdd", async (reaction, user) => {
  //load module
  const onReaction = require("./on_reaction.js");
  onReaction.onReaction(reaction, user);

  //end
});

//worthless errors, ignoring them fuck you
client.on("error", (e) => {console.log("ERROR: " + e)});
client.on("warn", (e) => {console.log("WARN: " + e)});
client.on("debug", (e) => {originalLog("DEBUG: " + e)});

//And login in the bot
client.login(configfile.token);
