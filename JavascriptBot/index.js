const fs = require('fs')
const Discord = require('discord.js');
const Canvas = require('canvas');
const request = require("request");
const translate = require('translate-google');
const moment = require('moment');
const Client = require('./client/Client');
const {
    token,
    yandex,
    linuxhints
} = require('./config.json');
const SQLite = require("better-sqlite3");
const sql = new SQLite('./scores.sqlite');
const client = new Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const thankedRecently = new Set();
const welcomeRecently = new Set();
const streamedRecently = new Set();
const borgRecently = new Set();
const spamRecently = new Set();
const queue = new Map();
const ln = require('nodejs-linenumber');
const {
    FeedEmitter
} = require("rss-emitter-ts");
const emitter = new FeedEmitter();
const htmlToText = require('html-to-text');
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}
client.once('ready', () => {
    let nowtime = new Date();
    console.log(`${nowtime} \nBot has started, with ${client.users.size} users.\nI am in ${client.guilds.size} guilds:\n` + client.guilds.map(guild => guild.name + ' Users: ' + guild.memberCount + ' Owner: ' + guild.owner.user.username).join('\n') + '\n\n');
    //Level DB
    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'scores';").get();
    if (!table['count(*)']) {
        sql.prepare("CREATE TABLE scores (id TEXT PRIMARY KEY, user TEXT, guild TEXT, points INTEGER, level INTEGER, warning INTEGER, muted INTEGER, translate INTEGER, stream INTEGER, notes TEXT);").run();
        sql.prepare("CREATE UNIQUE INDEX idx_scores_id ON scores (id);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");
    }
    client.getScore = sql.prepare("SELECT * FROM scores WHERE user = ? AND guild = ?");
    client.setScore = sql.prepare("INSERT OR REPLACE INTO scores (id, user, guild, points, level, warning, muted, translate, stream, notes) VALUES (@id, @user, @guild, @points, @level, @warning, @muted, @translate, @stream, @notes);");
    //Guild Channel DB
    const table2 = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'guildhub';").get();
    if (!table2['count(*)']) {
        sql.prepare("CREATE TABLE guildhub (guild TEXT PRIMARY KEY, generalChannel TEXT, highlightChannel TEXT, muteChannel TEXT, logsChannel TEXT, streamChannel TEXT, reactionChannel TEXT, streamHere TEXT, autoMod TEXT, prefix TEXT);").run();
        sql.prepare("CREATE UNIQUE INDEX idx_guidhub_id ON guildhub (guild);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");
    }
    client.getGuild = sql.prepare("SELECT * FROM guildhub WHERE guild = ?");
    client.setGuild = sql.prepare("INSERT OR REPLACE INTO guildhub (guild, generalChannel, highlightChannel, muteChannel, logsChannel, streamChannel, reactionChannel, streamHere, autoMod, prefix) VALUES (@guild, @generalChannel, @highlightChannel, @muteChannel, @logsChannel, @streamChannel, @reactionChannel, @streamHere, @autoMod, @prefix);");
    //role DB
    const table3 = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'roles';").get();
    if (!table3['count(*)']) {
        sql.prepare("CREATE TABLE roles (guild TEXT, roles TEXT PRIMARY KEY);").run();
        sql.prepare("CREATE UNIQUE INDEX idx_roles_id ON roles (roles);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");
    }
    client.getRoles = sql.prepare("SELECT * FROM roles WHERE guild = ?");
    client.setRoles = sql.prepare("INSERT OR REPLACE INTO roles (guild, roles) VALUES (@guild, @roles);");
    //words DB
    const table5 = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'words';").get();
    if (!table5['count(*)']) {
        sql.prepare("CREATE TABLE words (guild TEXT, words TEXT, wordguild TEXT PRIMARY KEY);").run();
        sql.prepare("CREATE UNIQUE INDEX idx_wordguild_id ON words (wordguild);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");
    }
    client.getWords = sql.prepare("SELECT * FROM words WHERE guild = ?");
    client.setWords = sql.prepare("INSERT OR REPLACE INTO words (guild, words) VALUES (@guild, @words);");
    //levelup DB
    const table4 = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'level';").get();
    if (!table4['count(*)']) {
        sql.prepare("CREATE TABLE level (guild TEXT PRIMARY KEY, lvl5 TEXT, lvl10 TEXT, lvl15 TEXT, lvl20 TEXT, lvl30 TEXT, lvl50 TEXT, lvl85 TEXT);").run();
        sql.prepare("CREATE UNIQUE INDEX idx_level_id ON level (guild);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");
    }
    client.getLevel = sql.prepare("SELECT * FROM level WHERE guild = ?");
    client.setLevel = sql.prepare("INSERT OR REPLACE INTO level (guild, lvl5, lvl10, lvl15, lvl20, lvl30, lvl50, lvl85) VALUES (@guild, @lvl5, @lvl10, @lvl15, @lvl20, @lvl30, @lvl50, @lvl85);");
    //Linux tips, no longer dad jokes
    setInterval(() => {
        try {
            const linuxhint = new Discord.RichEmbed()
                .setTitle("Hint:")
                .setColor('RANDOM')
                .setDescription(linuxhints[~~(Math.random() * linuxhints.length)])
            client.channels.get('628984660298563584').send({
                embed: linuxhint
            });
        } catch {
            let nowtime = new Date();
            console.log(nowtime + '\n' + ': index.js:' + Math.floor(ln() - 4));
        }
    }, 21600000);
    //change bot Status
    setInterval(() => {
        var RAN = [
            `https://artemisbot.eu`,
            `${client.guilds.size} servers`
        ];
        client.user.setActivity(RAN[~~(Math.random() * RAN.length)], {
            type: 'LISTENING'
        });
    }, 60000);
    //preload messages on reconnect
    const fetch2 = sql.prepare("SELECT * FROM guildhub").all();
    let array4 = [];
    for (const data of fetch2) {
        if (data.reactionChannel > 1) {
            array4.push(data.reactionChannel);
            if (client.channels.get(data.reactionChannel)) {
                client.channels.get(data.reactionChannel).fetchMessages();
            }
        }
    }
    const fetch3 = sql.prepare("SELECT * FROM guildhub").all();
    let array5 = [];
    for (const data of fetch3) {
        if (data.generalChannel > 1) {
            array5.push(data.generalChannel);
            if (client.channels.get(data.generalChannel)) {
                client.channels.get(data.generalChannel).fetchMessages();
            }
        }
    }
});
client.once('reconnecting', () => {
    let nowtime = new Date();
    console.log(`${nowtime} \nBot has reconnected, with ${client.users.size} users.\nI am in ${client.guilds.size} guilds:\n` + client.guilds.map(guild => guild.name + ' Users: ' + guild.memberCount + ' Owner: ' + guild.owner.user.username).join('\n') + '\n\n');
});
client.once('disconnect', () => {
    console.log('Disconnect!');
});
client.on("guildMemberAdd", async (guildMember) => {
    //load shit
    let nowtime = new Date();
    const guildChannels = client.getGuild.get(guildMember.guild.id);
    if (guildChannels) {
        var thisguild = client.guilds.get(guildChannels.guild);
    }
    if (thisguild) {
        var generalChannel1 = client.channels.get(guildChannels.generalChannel);
        if (!generalChannel1) {
            var generalChannel1 = '0';
        }
        var muteChannel1 = client.channels.get(guildChannels.muteChannel);
        if (!muteChannel1) {
            var muteChannel1 = '0';
        }
        var logsChannel1 = client.channels.get(guildChannels.logsChannel);
        if (!logsChannel1) {
            var logsChannel1 = '0';
        }
    } else {
        var generalChannel1 = '0';
        var muteChannel1 = '0';
        var logsChannel1 = '0';
    }
    if (guildMember.guild.id == '628978428019736619') {
        rolearray = ['674208095626592266', '674208167437139979', '674207678347608064', '674207950822440970'];
        for (let i of rolearray) {
            let role = guildMember.guild.roles.find(r => r.id === `${i}`);
            guildMember.addRole(role);
        }
    }
    //account age check
    let roleadd1 = guildMember.guild.roles.find(r => r.name === "~/Members");
    let roledel1 = guildMember.guild.roles.find(r => r.name === "Muted");
    let user = guildMember.user;
    let userscore2 = client.getScore.get(user.id, guildMember.guild.id);
    if (!userscore2) {
        userscore2 = {
            id: `${guildMember.guild.id}-${user.id}`,
            user: user.id,
            guild: guildMember.guild.id,
            points: 0,
            level: 1,
            warning: 0,
            muted: 0,
            translate: 0,
            stream: 0,
            notes: 0
        };
        client.setScore.run(userscore2);
    } else {
        if (userscore2.muted == '1') {
            guildMember.addRole(roledel1);
            if (muteChannel1 == '0') {} else {
                return muteChannel1.send(user + ", You have been muted by our system due to breaking rules, trying to leave and rejoin will not work!");
            }
        }
    }
    var cdate = moment.utc(user.createdAt).format('YYYYMMDD');
    let ageS = moment(cdate, "YYYYMMDD").fromNow(true);
    let ageA = ageS.split(" ");
    //logs
    if (logsChannel1 == `0`) {} else {
        try {
            const embed = new Discord.RichEmbed()
                .setTitle(`User joined`)
                .setColor(`RANDOM`)
                .setDescription(guildMember.user)
                .addField(`This user has joined us.`, '\n' + guildMember.user.username + '\n' + guildMember.user.id + '\nAccount age: ' + ageA)
                .setTimestamp();
            logsChannel1.send({
                embed
            });
        } catch {
            let nowtime = new Date();
            console.log(nowtime + '\n' + guildMember.guild.id + ': index.js:' + Math.floor(ln() - 4));
        }
    }
    if (muteChannel1 == `0`) {} else {
        if (ageA[1] == "hours" || ageA[1] == "day" || ageA[1] == "days") {
            guildMember.addRole(roledel1);
            try {
                return muteChannel1.send(ageA + ' ' + guildMember.user + "\nYour account is younger than 30 days!\nTo prevent spammers and ban evaders we have temporarely muted you.\nWrite your own username with 1337 at the end to gain access.\nYour username is case sensitive\nExample UtopicUnicorn1337");
            } catch {
                let nowtime = new Date();
                console.log(nowtime + '\n' + guildMember.guild.id + ': index.js:' + Math.floor(ln() - 4));
            }
        }
    }
    //make nice image for welcoming
    guildMember.addRole(roleadd1).catch(error => {
        console.log(new Date() + '\n' + guildMember.guild.id + ': index.js:' + Math.floor(ln() - 4));
    });
    if (generalChannel1 == '0') {} else {
        try {
            var ReBeL = guildMember.user.username;
            var bel = ["\njust started brewing some minty tea!", "\nis using Arch BTW!", "\necho 'is here!'", "\nis sipping minty tea!", "\nuseradd -m -g users /bin/sh @"];
            var moon = bel[~~(Math.random() * bel.length)];
            moon = moon.replace('@', ReBeL)
            const canvas = Canvas.createCanvas(700, 250);
            const ctx = canvas.getContext('2d');
            const background = await Canvas.loadImage('./mintwelcome.png');
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
            ctx.font = '30px Zelda';
            ctx.shadowColor = "black";
            ctx.shadowBlur = 5;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(ReBeL, canvas.width / 3.0, canvas.height / 2.0);
            ctx.font = '21px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(moon, canvas.width / 3.0, canvas.height / 2.0);
            const avatar = await Canvas.loadImage(guildMember.user.displayAvatarURL);
            ctx.drawImage(avatar, 600, 25, 50, 50);
            ctx.beginPath();
            ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            const guildlogo = await Canvas.loadImage(guildMember.guild.iconURL);
            ctx.drawImage(guildlogo, 25, 25, 200, 200);
            const attachment = new Discord.Attachment(canvas.toBuffer(), 'welcome-image.png');
            await generalChannel1.send(attachment);
        } catch {
            let nowtime = new Date();
            console.log(nowtime + '\n' + guildMember.guild.id + ': index.js:' + Math.floor(ln() - 4));
        }
    }
});
client.on("guildMemberRemove", async (guildMember) => {
    //load shit
    const guildChannels = client.getGuild.get(guildMember.guild.id);
    if (guildChannels) {
        var thisguild = client.guilds.get(guildChannels.guild);
    }
    if (thisguild) {
        var logsChannel1 = client.channels.get(guildChannels.logsChannel);
    } else {
        var logsChannel1 = '0';
    }
    if (logsChannel1 == '0') {} else {
        try {
            const embed = new Discord.RichEmbed()
                .setTitle(`User Left The Building`)
                .setColor(`RANDOM`)
                .setDescription(guildMember.user)
                .addField(`This user has left us.`, '\n' + guildMember.user.username + '\n' + guildMember.user.id)
                .setTimestamp();
            return logsChannel1.send({
                embed
            });
        } catch {
            let nowtime = new Date();
            console.log(nowtime + '\n' + guildMember.guild.id + ': index.js:' + Math.floor(ln() - 4));
        }
    }
});
client.on("guildCreate", guild => {
    console.log("Joined a new guild: " + guild.name + " Users: " + guild.memberCount + ' Owner: ' + guild.owner.user.username);
    newGuild1 = client.getGuild.get(guild.id);
    if (!newGuild1) {
        newGuild = client.getGuild.get(guild.id);
        if (!newGuild) {
            if (!guild.roles.find(r => r.name === `Muted`)) {
                guild.createRole({
                    name: `Muted`
                });
            }
            if (!guild.roles.find(r => r.name === `~/Members`)) {
                guild.createRole({
                    name: `~/Members`
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
                prefix: `!`
            };
            client.setGuild.run(newGuild);
        }
    }
});
client.on("guildDelete", guild => {
    console.log("Left a guild: " + guild.name + " Users: " + guild.memberCount + ' Owner: ' + guild.owner.user.username);
    sql.prepare(`DELETE FROM guildhub WHERE guild = ${guild.id}`).run();
});
client.on("guildMemberUpdate", (oldMember, newMember) => {
    const guildChannels = client.getGuild.get(oldMember.guild.id);
    if (guildChannels) {
        var thisguild = client.guilds.get(guildChannels.guild);
    }
    if (thisguild) {
        var logsChannel1 = client.channels.get(guildChannels.logsChannel);
    } else {
        var logsChannel1 = '0';
    }
    if (logsChannel1 == '0') {} else {
        if (oldMember.nickname !== newMember.nickname) {
            if (!oldMember.nickname) {
                var oldname = 'Had no nickname!';
            } else {
                var oldname = oldMember.nickname;
            }
            if (!newMember.nickname) {
                var newname = 'No nickname set!';
            } else {
                var newname = newMember.nickname;
            }
            try {
                const embed = new Discord.RichEmbed()
                    .setTitle(`Nickname changed!`)
                    .setColor(`RANDOM`)
                    .setDescription(oldMember.user)
                    .addField(`Name changed: `, '\n' + 'Old nickname: ' + oldname + '\n' + 'New nickname: ' + newname)
                    .setFooter(newMember.user.id)
                    .setTimestamp();
                return logsChannel1.send({
                    embed
                });
            } catch {
                let nowtime = new Date();
                console.log(nowtime + '\n' + newMember.guild.id + ': index.js:' + Math.floor(ln() - 4));
            }
        }
    }

});
client.on("presenceUpdate", (oldMember, newMember) => {
    //Twitch notifications
    if (oldMember.presence.game !== newMember.presence.game) {
        if (!newMember.presence.game) {
            return;
        }
        if (!newMember.presence.game.url) {
            return;
        }
        if (newMember.presence.game.url.includes("twitch")) {
            //load shit
            const guildChannels = client.getGuild.get(newMember.guild.id);
            if (guildChannels) {
                var thisguild = client.guilds.get(guildChannels.guild);
            }
            if (thisguild) {
                var streamChannel1 = client.channels.get(guildChannels.streamChannel);
                var streamNotif = guildChannels.streamHere;
            } else {
                var streamChannel1 = '0';
                var streamNotif = '0';
            }
            if (streamChannel1 == '0') {} else {
                if (!streamChannel1) return;
                //check if user wants notifications
                let user = newMember.user;
                let streamcheck = client.getScore.get(user.id, newMember.guild.id);
                if (!streamcheck) {
                    streamcheck = {
                        id: `${newMember.guild.id}-${newMember.user.id}`,
                        user: newMember.user.id,
                        guild: newMember.guild.id,
                        points: 0,
                        level: 1,
                        warning: 0,
                        muted: 0,
                        translate: 0,
                        stream: 0,
                        notes: 0
                    };
                }
                client.setScore.run(streamcheck);
                if (streamcheck.stream == `2`) {} else {
                    //no double posts
                    if (streamedRecently.has(newMember.user.id + newMember.guild.id)) {

                    } else {
                        streamedRecently.add(newMember.user.id + newMember.guild.id);
                        setTimeout(() => {
                            streamedRecently.delete(newMember.user.id + newMember.guild.id);
                        }, 7200000);
                        request('https://api.rawg.io/api/games?page_size=5&search=' + newMember.presence.game.state, {
                            json: true
                        }, function (err, res, body) {
                            if (streamNotif == '2') {
                                try {
                                    streamChannel1.send("@here");
                                    if (!body.results[0].background_image) {
                                        const embed = new Discord.RichEmbed()
                                            .setTitle(newMember.presence.game.state)
                                            .setColor(`RANDOM`)
                                            .setURL(newMember.presence.game.url)
                                            .setDescription(newMember.user + ' went live!')
                                            .addField(newMember.presence.game.details, '\n' + newMember.presence.game.url)
                                            .setTimestamp();
                                        return streamChannel1.send({
                                            embed
                                        });
                                    }
                                    const embed = new Discord.RichEmbed()
                                        .setTitle(newMember.presence.game.state)
                                        .setColor(`RANDOM`)
                                        .setURL(newMember.presence.game.url)
                                        .setThumbnail(`${body.results[0].background_image}`)
                                        .setDescription(newMember.user + ' went live!')
                                        .addField(newMember.presence.game.details, '\n' + newMember.presence.game.url)
                                        .setTimestamp();
                                    return streamChannel1.send({
                                        embed
                                    });
                                } catch {
                                    let nowtime = new Date();
                                    console.log(nowtime + '\n' + newMember.guild.id + ': index.js:' + Math.floor(ln() - 4));
                                }
                            } else {
                                if (!body.results[0].background_image) {
                                    try {
                                        const embed = new Discord.RichEmbed()
                                            .setTitle(newMember.presence.game.state)
                                            .setColor(`RANDOM`)
                                            .setURL(newMember.presence.game.url)
                                            .setDescription(newMember.user + ' went live!')
                                            .addField(newMember.presence.game.details, '\n' + newMember.presence.game.url)
                                            .setTimestamp();
                                        return streamChannel1.send({
                                            embed
                                        });
                                    } catch {
                                        let nowtime = new Date();
                                        console.log(nowtime + '\n' + newMember.guild.id + ': index.js:' + Math.floor(ln() - 4));
                                    }
                                }
                                try {
                                    const embed = new Discord.RichEmbed()
                                        .setTitle(newMember.presence.game.state)
                                        .setColor(`RANDOM`)
                                        .setURL(newMember.presence.game.url)
                                        .setThumbnail(`${body.results[0].background_image}`)
                                        .setDescription(newMember.user + ' went live!')
                                        .addField(newMember.presence.game.details, '\n' + newMember.presence.game.url)
                                        .setTimestamp();
                                    return streamChannel1.send({
                                        embed
                                    });
                                } catch {
                                    let nowtime = new Date();
                                    console.log(nowtime + '\n' + newMember.guild.id + ': index.js:' + Math.floor(ln() - 4));
                                }
                            }
                        });
                    }
                }
            }
        }
    }
    const guildChannels = client.getGuild.get(oldMember.guild.id);
    if (guildChannels) {
        var thisguild = client.guilds.get(guildChannels.guild);
    }
    if (thisguild) {
        var logsChannel1 = client.channels.get(guildChannels.logsChannel);
    } else {
        var logsChannel1 = '0';
    }
    if (logsChannel1 == '0') {} else {
        if (oldMember.user.username !== newMember.user.username) {
            try {
                const embed = new Discord.RichEmbed()
                    .setTitle(`Username changed!`)
                    .setColor(`RANDOM`)
                    .setDescription(oldMember.user)
                    .addField(`Name changed: `, '\n' + oldMember.user.username + '\n' + newMember.user.username)
                    .setFooter(newMember.user.id)
                    .setTimestamp();
                return logsChannel1.send({
                    embed
                });
            } catch {
                let nowtime = new Date();
                console.log(nowtime + '\n' + newMember.guild.id + ': index.js:' + Math.floor(ln() - 4));
            }
        }
    }
    //Change topic based on user activity
    if (oldMember.presence.status !== newMember.presence.status) {
        if (`${newMember.user.username}` === "UtopicUnicorn") {
            if (`${newMember.presence.status}` === "dnd") {
                client.channels.get('628984660298563584').setTopic(`${newMember.user.username} has enlightened us with their presence!`);
            }
        }
        if (`${newMember.presence.status}` === "online") {
            client.channels.get('628984660298563584').setTopic(`${newMember.user.username} just came online!`);
        }
    }
});
//reddit
emitter.add({
    url: "https://www.reddit.com/r/linuxmint/new.rss",
    refresh: 10000,
    ignoreFirst: true
});
emitter.on("item:new", (item) => {
    const reddittext = htmlToText.fromString(item.description, {
        wordwrap: false,
        ignoreHref: true,
        noLinkBrackets: true,
        preserveNewlines: true
    });
    let reddittext2 = reddittext.replace('[link]', '').replace('[comments]', '');
    let reddittext3 = reddittext2.substr(0, 1000);
    try {
        const redditmessage = new Discord.RichEmbed()
            .setTitle(item.title.substr(0, 100))
            .setURL(item.link)
            .setColor('RANDOM')
            .setDescription(reddittext3)
            .addField(item.link + '\n', 'https://www.reddit.com' + item.author, true)
            .setTimestamp();
        return client.channels.get('656194923107713024').send({
            embed: redditmessage
        });
    } catch {
        if (spamRecently.has('REDDIT')) {} else {
            spamRecently.add('REDDIT');
            setTimeout(() => {
                spamRecently.delete('REDDIT');
            }, 1000);
            let nowtime = new Date();
            console.log(nowtime + '\n' + ': index.js:' + Math.floor(ln() - 4));
        }
    }
});
emitter.on("feed:error", (error) => {
    //console.error(error.message)
});
//On edit execute command
client.on('messageUpdate', (oldMessage, newMessage) => {
    if (newMessage.author.bot) return;
    const prefixstart = client.getGuild.get(newMessage.guild.id);
    const prefix = prefixstart.prefix;
    const commandName = newMessage.content.slice(prefix.length).toLowerCase().split(/ +/);
    const command = client.commands.get(commandName.shift());
    if (!newMessage.content.startsWith(prefix)) return;
    try {
        command.execute(newMessage);
    } catch (error) {
        console.error(error);
    }
});
client.on('message', async message => {
    if (message.author.id == `637408181315829770`) {
        if (borgRecently.has(message.author.id)) {

        } else {
            borgRecently.add(message.author.id);
            setTimeout(() => {
                borgRecently.delete(message.author.id);
            }, 3600000);
            message.react("❤️");
        }
    }
    //ignore bots
    if (message.author.bot) return;
    //Direct Message handle
    if (message.channel.type == "dm") {
        console.log(nowtime + '\n' + message.author.username + '\n' + message.content);
        const whoartemis = new Discord.RichEmbed()
            .setTitle('Artemis')
            .setColor('RANDOM')
            .setDescription('Hello, I am Artemis!\nMy master is UtopicUnicorn#0383\n\nI am open-source: https://github.com/UtopicUnicorns/mint-bot\nMy main discord server is: https://discord.gg/EVVtPpw\nInvite me to your server: https://discordapp.com/api/oauth2/authorize?client_id=440892659264126997&permissions=2147483127&scope=bot\nReport bugs and issues on Github or the main server. I also have a website: https://artemisbot.eu/')
            .setTimestamp()
        return message.channel.send({
            embed: whoartemis
        }).catch(error =>
            console.log(new Date() + '\n' + message.guild.id + ' ' + message.guild.owner.user.username + ': index.js:' + Math.floor(ln() - 4))
        );
    }
    //load shit
    const guildChannels = client.getGuild.get(message.guild.id);
    if (guildChannels) {
        var thisguild = client.guilds.get(guildChannels.guild);
    }
    if (thisguild) {
        var generalChannel1 = message.guild.channels.get(guildChannels.generalChannel);
        if (!generalChannel1) {
            var generalChannel1 = '0';
        }
        var muteChannel1 = message.guild.channels.get(guildChannels.muteChannel);
        if (!muteChannel1) {
            var muteChannel1 = '0';
        }
        var logsChannel1 = message.guild.channels.get(guildChannels.logsChannel);
        if (!logsChannel1) {
            var logsChannel1 = '0';
        }
    } else {
        var generalChannel1 = '0';
        var muteChannel1 = '0';
        var logsChannel1 = '0';
    }
    const prefixstart = client.getGuild.get(message.guild.id);
    const prefix = prefixstart.prefix;
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    //Reaction roles
    if (message.content.startsWith(prefix + "reaction")) {
        if (!message.channel.guild) return;
        message.channel.send("Available roles");
        const allroles2 = sql.prepare("SELECT * FROM roles WHERE guild = ?;").all(message.guild.id);
        let array3 = [];
        for (const data of allroles2) {
            array3.push(message.guild.roles.find(r => r.id == data.roles).name);
        }
        let channelstuff = client.channels.get(message.channel.id);
        channelstuff.fetchMessages({
                limit: 1
            }).then(messages => {
                for (let n in array3) {
                    if (n > 19) return;
                    var emoji3 = [message.guild.emojis.find(r => r.name == array3[n])];
                    for (let i in emoji3) {
                        let lastMessage = messages.first();
                        lastMessage.react(emoji3[i]);
                    }
                }
            })
            .catch(console.error);
    }
    //levelupstuff
    newLevel = client.getLevel.get(message.guild.id);
    if (!newLevel) {
        newLevel = {
            guild: message.guild.id,
            lvl5: `0`,
            lvl10: `0`,
            lvl15: `0`,
            lvl20: `0`,
            lvl30: `0`,
            lvl50: `0`,
            lvl85: `0`
        };
        client.setLevel.run(newLevel);
    }
    //autoMod START
    if (message.member.hasPermission('KICK_MEMBERS')) {} else {
        if (guildChannels.autoMod == '2') {
            //Word/sentence filter
            let allwords = sql.prepare("SELECT * FROM words WHERE guild = ?;").all(message.guild.id);
            let wargs = message.content.toLowerCase();
            for (const data of allwords) {
                if (wargs.includes(data.words)) {
                    return message.delete();
                }
            }
            //No Spam
            if (spamRecently.has(message.author.id + message.guild.id)) {
                message.delete();
                message.reply("Slow down there buddy!\nAnti-Spam is ON!");
            } else {
                spamRecently.add(message.author.id + message.guild.id);
                setTimeout(() => {
                    spamRecently.delete(message.author.id + message.guild.id);
                }, 1000);
            }
            //No discord invites
            if (message.content.toLowerCase().includes('discord.gg/') || message.content.toLowerCase().includes('discordapp.com/invite/')) {
                message.delete();
            }
            //Anti-mention
            if (message.mentions.users.size > 3) {
                message.delete();
                if (muteChannel1 == '0') return message.channel.send("You have not set up a mute channel!");
                const member = message.author;
                message.guild.channels.forEach(async (channel, id) => {
                    await channel.overwritePermissions(member, {
                        VIEW_CHANNEL: false,
                        READ_MESSAGES: false,
                        SEND_MESSAGES: false,
                        READ_MESSAGE_HISTORY: false,
                        ADD_REACTIONS: false
                    });
                })
                setTimeout(() => {
                    muteChannel1.overwritePermissions(member, {
                        VIEW_CHANNEL: true,
                        READ_MESSAGES: true,
                        SEND_MESSAGES: true,
                        READ_MESSAGE_HISTORY: true,
                        ATTACH_FILES: false
                    })
                }, 2000);
                const user = message.mentions.users.first();
                let userscore = client.getScore.get(user.id, message.guild.id);
                if (!userscore) {
                    userscore = {
                        id: `${message.guild.id}-${user.id}`,
                        user: user.id,
                        guild: message.guild.id,
                        points: 0,
                        level: 1,
                        warning: 0,
                        muted: 1,
                        translate: 0,
                        stream: 0,
                        notes: 0
                    }
                }
                userscore.muted = `1`;
                client.setScore.run(userscore);
                let mutedrole = message.guild.roles.find(r => r.name === `Muted`);
                let memberrole = message.guild.roles.find(r => r.name === `~/Members`);
                message.member.removeRole(memberrole).catch(console.error);
                message.member.addRole(mutedrole).catch(console.error);
                muteChannel1.send(member + `\nYou have tagged more than 3 users in the same message, for our safety,\nyou have been muted!\nYou may mention ONE Mod OR Admin to change their mind and unmute you.\n\nGoodluck!`).catch(error =>
                    console.log(new Date() + '\n' + message.guild.id + ' ' + message.guild.owner.user.username + ': index.js:' + Math.floor(ln() - 4))
                );

            }
        }
    }
    //AutoMod END
    //Mute filter
    if (muteChannel1 == '0') {} else {
        if (message.channel.id === muteChannel1.id) {
            if (message.content == message.author.username + "1337") {
                let userscore1 = client.getScore.get(message.author.id, message.guild.id);
                if (!userscore1) {

                } else {
                    if (userscore1.muted == '1') return message.reply("You have been muted by our system due to breaking rules, the verification system is not for you!");
                }
                let roleadd = message.guild.roles.find(r => r.name === "~/Members");
                let roledel = message.guild.roles.find(r => r.name === "Muted");
                let member = message.member;
                message.member.addRole(roleadd).catch(console.error);
                message.member.removeRole(roledel).catch(console.error);
                var ReBeL = member;
                var bel = ["\njust started brewing some minty tea!", "\nis using Arch BTW!", "\necho 'is here!'", "\nis sipping minty tea!", "\nuseradd -m -g users /bin/sh @"];
                var moon = bel[~~(Math.random() * bel.length)];
                moon = moon.replace('@', message.author.username)
                const canvas = Canvas.createCanvas(700, 250);
                const ctx = canvas.getContext('2d');
                const background = await Canvas.loadImage('./mintwelcome.png');
                ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                ctx.font = '30px Zelda';
                ctx.shadowColor = "black";
                ctx.shadowBlur = 5;
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(message.author.username, canvas.width / 3.0, canvas.height / 2.0);
                const avatar = await Canvas.loadImage(message.author.displayAvatarURL);
                ctx.drawImage(avatar, 600, 25, 50, 50);
                ctx.beginPath();
                ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();
                const guildlogo = await Canvas.loadImage(message.guild.iconURL);
                ctx.drawImage(guildlogo, 25, 25, 200, 200);
                ctx.font = '21px sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(moon, canvas.width / 3.0, canvas.height / 2.0);
                const attachment = new Discord.Attachment(canvas.toBuffer(), 'welcome-image.png');
                await generalChannel1.send(attachment).catch(error =>
                    console.log(new Date() + '\n' + message.guild.id + ' ' + message.guild.owner.user.username + ': index.js:' + Math.floor(ln() - 4))
                );
                return message.channel.send(`${member} has been approved.`);
            }
        }
    }
    //restart
    if (message.content === prefix + 'restart') {
        if (message.author.id !== '127708549118689280') return;
        message.channel.send('Restarting').then(() => {
            process.exit(1);
        })
    };
    //reload commands
    if (message.content === prefix + 'reload') {
        if (!message.member.hasPermission('KICK_MEMBERS')) return;
        let commandFiless = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
        for (let file of commandFiless) {
            delete require.cache[require.resolve(`./commands/${file}`)];
            try {
                let newCommand = require(`./commands/${file}`);
                message.client.commands.set(newCommand.name, newCommand);
            } catch (error) {
                console.log(error);
                message.channel.send(`${file}:\n${error.message}`);
            }
        }
        message.channel.send("Done");
    };
    //reloadprefix
    if (message.content === "forceprefix") {
        if (!message.member.hasPermission('KICK_MEMBERS')) return;
        fs.writeFile(`./set/prefix.txt`, '!', (error) => {
            if (error) throw error;
        })
        message.channel.send("Forced prefix back to !");
    }
    //update
    if (message.content.startsWith(prefix + "update")) {
        if (message.author.id !== '127708549118689280') return;
        const logslist = sql.prepare("SELECT * FROM guildhub").all();
        const logschannels = []
        for (const data of logslist) {
            logschannels.push(data.logsChannel);
        }
        for (let i of logschannels) {
            if (client.channels.get(`${i}`)) {
                try {
                    const updatetext = new Discord.RichEmbed()
                        .setTitle("Update")
                        .setAuthor(message.author.username, message.author.avatarURL)
                        .setDescription(message.author)
                        .setURL('https://discord.gg/EVVtPpw')
                        .setColor('RANDOM')
                        .addField('Update text:\n', message.content.slice(8))
                        .addField('Channel', message.channel, true)
                        .setFooter("Message ID: " + message.id)
                        .setTimestamp();
                    await client.channels.get(`${i}`).send({
                        embed: updatetext
                    });
                } catch {
                    let nowtime = new Date();
                    console.log(nowtime + '\n' + message.guild.id + ' ' + message.guild.owner.user.username + ': index.js:' + Math.floor(ln() - 4));
                }
            }
        }
    }
    //Logs
    const commandusage = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandusage) {
        const commandlogger = require(`./commands/${file}`);
        if (message.content.startsWith(prefix + commandlogger.name) && commandlogger.description.includes(`[mod]` || `[admin]`)) {
            if (logsChannel1 == '0') {} else {
                if (message.channel.id == '642882039372185609') {} else {
                    if (message.member.hasPermission('KICK_MEMBERS')) {
                        if (spamRecently.has(message.author.id + message.guild.id)) {} else {
                            spamRecently.add(message.author.id + message.guild.id);
                            setTimeout(() => {
                                spamRecently.delete(message.author.id + message.guild.id);
                            }, 1000);
                            const logsmessage = new Discord.RichEmbed()
                                .setTitle(commandlogger.name)
                                .setAuthor(message.author.username, message.author.avatarURL)
                                .setDescription("Used by: " + message.author)
                                .setURL(message.url)
                                .setColor('RANDOM')
                                .addField('Usage:\n', message.content, true)
                                .addField('Channel', message.channel, true)
                                .setFooter("Message ID: " + message.id)
                                .setTimestamp();
                            logsChannel1.send({
                                embed: logsmessage
                            }).catch(error =>
                                console.log(new Date() + '\n' + message.guild.id + ' ' + message.guild.owner.user.username + ': index.js:' + Math.floor(ln() - 4))
                            );
                        }
                    }
                }
            }
        }
    }
    //WhoIsArtemis?
    if (message.content.toLowerCase().includes("who is artemis")) {
        const whoartemis = new Discord.RichEmbed()
            .setTitle('Artemis')
            .setColor('RANDOM')
            .setDescription('Hello, I am Artemis!\nMy master is UtopicUnicorn#0383\n\nI am open-source: https://github.com/UtopicUnicorns/mint-bot\nMy main discord server is: https://discord.gg/EVVtPpw\nInvite me to your server: https://discordapp.com/api/oauth2/authorize?client_id=440892659264126997&permissions=2147483127&scope=bot\nReport bugs and issues on Github or the main server. I also have a website: https://artemisbot.eu/')
            .setTimestamp()
        return message.channel.send({
            embed: whoartemis
        }).catch(error =>
            console.log(new Date() + '\n' + message.guild.id + ' ' + message.guild.owner.user.username + ': index.js:' + Math.floor(ln() - 4))
        );
    }
    if (message.content === prefix + "ping") {
        const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
    }
    //Artemis Talk
    if (message.channel.id === '642882039372185609') {
        if (message.author.id !== "440892659264126997") {
            let cargs = message.content.slice(5);
            if (message.content.startsWith(prefix + "channel")) {
                let readname = fs.readFileSync('channelset.txt').toString().split("\n");
                let channelname = client.channels.get(`${readname}`);
                return message.channel.send(channelname.name);
            }
            if (message.content.startsWith(prefix + "set")) {
                fs.writeFile('channelset.txt', cargs, function (err) {
                    if (err) throw err;
                });
                return message.channel.send('Set channel id to: ' + client.channels.get(`${cargs}`));
            }
            let channelcheck = fs.readFileSync('channelset.txt').toString().split("\n");
            if (!client.channels.get(`${channelcheck}`)) {
                return message.channel.send("Enter a valid channel ID first!\n!set ChannelID");
            }
            try {
                client.channels.get(`${channelcheck}`).send(message.content);
            } catch {
                let nowtime = new Date();
                console.log(nowtime + '\n' + message.guild.id + ' ' + message.guild.owner.user.username + ': index.js:' + Math.floor(ln() - 4));
            }
            return;
        }
    }
    //guide channel
    if (message.channel.id === '648911771624538112') {
        message.delete();
    }
    //Simulate guild member join
    if (message.content === prefix + 'guildmemberadd') {
        if (message.author.id === "127708549118689280" || message.author.id == message.guild.owner.id) {
            client.emit('guildMemberAdd', message.member || await message.guild.fetchMember(message.author));
        }
    }
    //Simulate guild member leave
    if (message.content === prefix + 'guildmemberremove') {
        if (message.author.id === "127708549118689280" || message.author.id == message.guild.owner.id) {
            client.emit('guildMemberRemove', message.member || await message.guild.fetchMember(message.author));
        }
    }
    //bot reactions
    if (message.content.includes("Artemis")) {
        message.react("👀");
    }
    //translate
    //Start db for opt
    translateopt = client.getScore.get(message.author.id, message.guild.id);
    if (!translateopt) {
        translateopt = {
            id: `${message.guild.id}-${message.author.id}`,
            user: message.author.id,
            guild: message.guild.id,
            points: 0,
            level: 1,
            warning: 0,
            muted: 0,
            translate: 0,
            stream: 0,
            notes: 0
        };
    }
    client.setScore.run(translateopt);
    //check opt
    if (translateopt.translate == `2` || message.content.startsWith(prefix + "tr")) {
        //commence translate if opt
        let baseurl = "https://translate.yandex.net/api/v1.5/tr.json/translate";
        let key = yandex;
        if (message.content.startsWith(prefix + "tr")) {
            var text = message.content.slice(4);
        } else {
            var text = message.content;
        }
        let url = baseurl + "?key=" + key + "&hint=en,de,nl,fr,tr&lang=en" + "&text=" + encodeURIComponent(text) + "&format=plain";
        request(url, {
            json: true
        }, (err, res, body) => {
            if (!body.text) {
                return
            }
            if (message.content.startsWith(prefix + "tr")) {} else {
                if (JSON.stringify(body).startsWith('{"code":200,"lang":"en-en"')) {
                    return;
                }
            }
            translate(text, {
                to: 'en'
            }).then(res => {
                if (message.content.includes("ツ")) return;
                if (res == message.content) return;
                try {
                    const translationtext = new Discord.RichEmbed()
                        .setAuthor(message.author.username, message.author.avatarURL)
                        .setColor('RANDOM')
                        .setDescription(res)
                        .setFooter('Translated from: ' + body.lang)
                        .setTimestamp()
                    message.channel.send({
                        embed: translationtext
                    });
                } catch {
                    let nowtime = new Date();
                    console.log(nowtime + '\n' + message.guild.id + ' ' + message.guild.owner.user.username + ': index.js:' + Math.floor(ln() - 4));
                }
            }).catch(err => {
                console.error(err);
            });
            if (err) return message.channel.send(err);
        });
    }
    //agree
    if (message.content == "^") {
        message.channel.send("I agree!");
    }
    //set points
    let score;
    if (message.guild) {
        score = client.getScore.get(message.author.id, message.guild.id);
        if (!score) {
            score = {
                id: `${message.guild.id}-${message.author.id}`,
                user: message.author.id,
                guild: message.guild.id,
                points: 0,
                level: 1,
                warning: 0,
                muted: 0,
                translate: 0,
                stream: 0,
                notes: 0
            };
        }
        score.points++;
        const curLevel = Math.floor(0.5 * Math.sqrt(score.points));
        if (score.level < curLevel) {
            score.level++;
            message.react("⬆");
        }
        client.setScore.run(score);
    }
    //start level rewards
    const levelups = client.getLevel.get(message.guild.id);
    const lvl5 = message.guild.roles.find(r => r.id === levelups.lvl5);
    const lvl10 = message.guild.roles.find(r => r.id === levelups.lvl10);
    const lvl15 = message.guild.roles.find(r => r.id === levelups.lvl15);
    const lvl20 = message.guild.roles.find(r => r.id === levelups.lvl20);
    const lvl30 = message.guild.roles.find(r => r.id === levelups.lvl30);
    const lvl50 = message.guild.roles.find(r => r.id === levelups.lvl50);
    const lvl85 = message.guild.roles.find(r => r.id === levelups.lvl85);
    //lvl5
    if (score.level > 4 && score.level < 9) {
        if (lvl5) {
            let checking = message.member.roles.find(r => r.name === lvl5.name);
            if (!checking) {
                message.member.addRole(lvl5);
                message.reply("For reaching level 5\nYou earned the title " + lvl5);
            }
        }
    }
    //lvl10
    if (score.level > 9 && score.level < 14) {
        if (lvl10) {
            let checking = message.member.roles.find(r => r.name === lvl10.name);
            if (!checking) {
                message.member.addRole(lvl10);
                message.member.removeRole(lvl5);
                message.reply("For reaching level 10\nYou earned the title " + lvl10);
            }
        }
    }
    //lvl15
    if (score.level > 14 && score.level < 19) {
        if (lvl15) {
            let checking = message.member.roles.find(r => r.name === lvl15.name);
            if (!checking) {
                message.member.addRole(lvl15);
                message.member.removeRole(lvl10);
                message.reply("For reaching level 15\nYou earned the title " + lvl15);
            }
        }
    }
    //lvl20
    if (score.level > 19 && score.level < 29) {
        if (lvl20) {
            let checking = message.member.roles.find(r => r.name === lvl20.name);
            if (!checking) {
                message.member.addRole(lvl20);
                message.member.removeRole(lvl15);
                message.reply("For reaching level 20\nYou earned the title " + lvl20);
            }
        }
    }
    //lvl30
    if (score.level > 29 && score.level < 49) {
        if (lvl30) {
            let checking = message.member.roles.find(r => r.name === lvl30.name);
            if (!checking) {
                message.member.addRole(lvl30);
                message.member.removeRole(lvl20);
                message.reply("For reaching level 30\nYou earned the title " + lvl30);
            }
        }
    }
    //lvl50
    if (score.level > 49 && score.level < 84) {
        if (lvl50) {
            let checking = message.member.roles.find(r => r.name === lvl50.name);
            if (!checking) {
                message.member.addRole(lvl50);
                message.member.removeRole(lvl30);
                message.reply("For reaching level 50\nYou earned the title " + lvl50);
            }
        }
    }
    //lvl85
    if (score.level > 84 && score.level < 99) {
        if (lvl85) {
            let checking = message.member.roles.find(r => r.name === lvl85.name);
            if (!checking) {
                message.member.addRole(lvl85);
                message.member.removeRole(lvl50);
                message.reply("For reaching level 85\nYou earned the title " + lvl85);
            }
        }
    }
    //thanks
    if (message.content.toLowerCase().includes("thank")) {
        const user = message.mentions.users.first() || client.users.get(args[0]);
        if (!user) return;
        if (user == message.author) return;
        if (thankedRecently.has(message.author.id)) {
            return message.reply("You are thanking too much!");
        } else {
            thankedRecently.add(message.author.id);
            setTimeout(() => {
                thankedRecently.delete(message.author.id);
            }, 600000);
            const pointsToAdd = parseInt(20, 10);
            let userscore = client.getScore.get(user.id, message.guild.id);
            if (!userscore) return message.reply("This user does not have a database index yet.");
            userscore.points += pointsToAdd;
            let userLevel = Math.floor(0.5 * Math.sqrt(userscore.points));
            userscore.level = userLevel;
            client.setScore.run(userscore);
            return message.reply("thanked " + user.username + "\n" + user.username + " has gotten 20 points for their effort!");
        }
    }
    //Clean Database
    if (message.content.startsWith(prefix + "clean")) {
        if (message.author.id !== '127708549118689280') return;
        let guildlist = client.guilds.get("628978428019736619");
        let guildlistcollect = [];
        guildlist.members.forEach(member => guildlistcollect.push(member.user.id));
        let databaselist = sql.prepare("SELECT * FROM scores WHERE guild = ? ORDER BY points DESC ;").all(message.guild.id);
        let databaselistcollect = [];
        for (const data of databaselist) {
            databaselistcollect.push(data.user);
        }
        for (let i of databaselistcollect) {
            if (guildlistcollect.includes(i)) {} else {
                sql.prepare(`DELETE FROM scores WHERE user = ${i}`).run();
            }
        }
        message.channel.send("Done!");
    }
    //require prefix
    if (!message.content.startsWith(prefix)) return;
    try {
        command.execute(message);
    } catch (error) {
        //console.error(error);
    }
});
client.on("messageReactionAdd", async (reaction, user) => {
    //load shit
    const guildChannels = client.getGuild.get(reaction.message.guild.id);
    if (guildChannels) {
        var thisguild = client.guilds.get(guildChannels.guild);
    }
    if (thisguild) {
        var logsChannel1 = client.channels.get(guildChannels.logsChannel);
        var highlightChannel1 = client.channels.get(guildChannels.highlightChannel);
        var reactionChannel1 = client.channels.get(guildChannels.reactionChannel);
    } else {
        var logsChannel1 = '0';
        var highlightChannel1 = '0';
        var reactionChannel1 = '0';
    }
    if (!logsChannel1 == '0') {
        //report
        let limit1 = 1;
        if (reaction.emoji.name == '❌' && reaction.count == limit1) {
            if (reaction.message.author.id == '440892659264126997') return;
            if (reaction.users.first() == reaction.message.author) return reaction.remove(reaction.message.author.id);
            if (!reaction.message.attachments.size > 0) {
                try {
                    logsChannel1.send('<@&628980538274873345> <@&628980016813703178>');
                    const editmessage = new Discord.RichEmbed()
                        .setTitle("A message got reported!")
                        .setAuthor(reaction.message.author.username, reaction.message.author.avatarURL)
                        .setDescription("Message by: " + reaction.message.author)
                        .setURL(reaction.message.url)
                        .setColor('RANDOM')
                        .addField('Reported Message:\n', reaction.message.content, true)
                        .addField('Channel', reaction.message.channel, true)
                        .addField('Reported by: ', reaction.users.first())
                        .setFooter("Message ID: " + reaction.message.id)
                        .setTimestamp();
                    return logsChannel1.send({
                        embed: editmessage
                    });
                } catch {
                    let nowtime = new Date();
                    console.log(nowtime + '\n' + reaction.message.guild.id + ': index.js:' + Math.floor(ln() - 4));
                }
            }
            if (reaction.message.content === '') {
                try {
                    logsChannel1.send('<@&628980538274873345> <@&628980016813703178>');
                    const image = reaction.message.attachments.array()[0].url;
                    const editmessage = new Discord.RichEmbed()
                        .setTitle("A message got reported!")
                        .setAuthor(reaction.message.author.username, reaction.message.author.avatarURL)
                        .setDescription("Message by: " + reaction.message.author)
                        .setURL(reaction.message.url)
                        .setColor('RANDOM')
                        .addField('Channel', reaction.message.channel, true)
                        .addField('Reported by: ', reaction.users.first())
                        .setFooter("Message ID: " + reaction.message.id)
                        .setImage(image)
                        .setTimestamp();
                    return logsChannel1.send({
                        embed: editmessage
                    });
                } catch {
                    let nowtime = new Date();
                    console.log(nowtime + '\n' + reaction.message.guild.id + ': index.js:' + Math.floor(ln() - 4));
                }
            }
            try {
                logsChannel1.send('<@&628980538274873345> <@&628980016813703178>');
                const image = reaction.message.attachments.array()[0].url;
                const editmessage = new Discord.RichEmbed()
                    .setTitle("A message got reported!")
                    .setAuthor(reaction.message.author.username, reaction.message.author.avatarURL)
                    .setDescription("Message by: " + reaction.message.author)
                    .setURL(reaction.message.url)
                    .setColor('RANDOM')
                    .addField('Reported Message:\n', reaction.message.content, true)
                    .addField('Reported by: ', reaction.users.first())
                    .addField('Channel', reaction.message.channel, true)
                    .setFooter("Message ID: " + reaction.message.id)
                    .setImage(image)
                    .setTimestamp();
                return logsChannel1.send({
                    embed: editmessage
                });
            } catch {
                let nowtime = new Date();
                console.log(nowtime + '\n' + reaction.message.guild.id + ': index.js:' + Math.floor(ln() - 4));
            }
        }
        //reportdelete
        let limit2 = 3;
        if (reaction.emoji.name == '❌' && reaction.count == limit2) {
            try {
                logsChannel1.send('<@&628980538274873345> <@&628980016813703178>');
                if (reaction.message.author.id == '440892659264126997') return;
                if (reaction.message.author.id == '127708549118689280') return;
                if (reaction.users.first() == reaction.message.author) return reaction.remove(reaction.message.author.id);
                reaction.message.delete();
                if (reaction.message.content === '') return;
                const editmessage = new Discord.RichEmbed()
                    .setTitle("A message that was reported got deleted!")
                    .setAuthor(reaction.message.author.username, reaction.message.author.avatarURL)
                    .setDescription("Message by: " + reaction.message.author)
                    .setColor('RANDOM')
                    .addField('Reported Message:\n', reaction.message.content, true)
                    .addField('Deleted by: ', reaction.users.last())
                    .addField('Channel', reaction.message.channel, true)
                    .setFooter("Message ID: " + reaction.message.id)
                    .setTimestamp();
                return logsChannel1.send({
                    embed: editmessage
                });
            } catch {
                let nowtime = new Date();
                console.log(nowtime + '\n' + reaction.message.guild.id + ': index.js:' + Math.floor(ln() - 4));
            }
        }
    }
    //Highlights
    let limit = 3;
    if (reaction.emoji.name == '🍵' && reaction.count == limit) {
        if (highlightChannel1 == '0') return reaction.message.channel.send("You did not set up a logs channel!");
        if (reaction.message.author.id == '440892659264126997') return;
        if (!reaction.message.attachments.size > 0) {
            try {
                const editmessage = new Discord.RichEmbed()
                    .setTitle("A message got highlighted!")
                    .setAuthor(reaction.message.author.username, reaction.message.author.avatarURL)
                    .setThumbnail(`https://raw.githubusercontent.com/UtopicUnicorns/mint-bot/master/tea.png`)
                    .setDescription("Message by: " + reaction.message.author)
                    .setURL(reaction.message.url)
                    .setColor('RANDOM')
                    .addField('Mintiest Message:\n', reaction.message.content, true)
                    .addField('Channel', reaction.message.channel, true)
                    .setFooter("Message ID: " + reaction.message.id)
                    .setTimestamp();
                return highlightChannel1.send({
                    embed: editmessage
                });
            } catch {
                let nowtime = new Date();
                console.log(nowtime + '\n' + reaction.message.guild.id + ': index.js:' + Math.floor(ln() - 4));
            }
        }
        if (reaction.message.content === '') {
            if (highlightChannel1 == '0') return reaction.message.channel.send("You did not set up a logs channel!");
            try {
                const image = reaction.message.attachments.array()[0].url;
                const editmessage = new Discord.RichEmbed()
                    .setTitle("A message got highlighted!")
                    .setAuthor(reaction.message.author.username, reaction.message.author.avatarURL)
                    .setThumbnail(`https://raw.githubusercontent.com/UtopicUnicorns/mint-bot/master/tea.png`)
                    .setDescription("Message by: " + reaction.message.author)
                    .setURL(reaction.message.url)
                    .setColor('RANDOM')
                    .addField('Channel', reaction.message.channel, true)
                    .setFooter("Message ID: " + reaction.message.id)
                    .setImage(image)
                    .setTimestamp();
                return highlightChannel1.send({
                    embed: editmessage
                });
            } catch {
                let nowtime = new Date();
                console.log(nowtime + '\n' + reaction.message.guild.id + ': index.js:' + Math.floor(ln() - 4));
            }
        }
        if (highlightChannel1 == '0') return reaction.message.channel.send("You did not set up a logs channel!");
        try {
            const image = reaction.message.attachments.array()[0].url;
            const editmessage = new Discord.RichEmbed()
                .setTitle("A message got highlighted!")
                .setAuthor(reaction.message.author.username, reaction.message.author.avatarURL)
                .setThumbnail(`https://raw.githubusercontent.com/UtopicUnicorns/mint-bot/master/tea.png`)
                .setDescription("Message by: " + reaction.message.author)
                .setURL(reaction.message.url)
                .setColor('RANDOM')
                .addField('Mintiest Message:\n', reaction.message.content, true)
                .addField('Channel', reaction.message.channel, true)
                .setFooter("Message ID: " + reaction.message.id)
                .setImage(image)
                .setTimestamp();
            return highlightChannel1.send({
                embed: editmessage
            });
        } catch {
            let nowtime = new Date();
            console.log(nowtime + '\n' + reaction.message.guild.id + ': index.js:' + Math.floor(ln() - 4));
        }
    }
    //reaction roles
    if (!reactionChannel1 == '0') {
        if (reaction.message.channel.id === reactionChannel1.id) {
            if (!user) return;
            if (user.bot) return;
            if (!reaction.message.channel.guild) return;
            const allroles = sql.prepare("SELECT * FROM roles WHERE guild = ?;").all(reaction.message.guild.id);
            let array2 = [];
            for (const data of allroles) {
                try {
                    array2.push(reaction.message.guild.roles.find(r => r.id == data.roles).name);
                } catch {
                    let nowtime = new Date();
                    console.log(nowtime + '\n' + reaction.message.guild.id + ': index.js:' + Math.floor(ln() - 4));
                }
            }
            for (let n in array2) {
                if (reaction.emoji.name == array2[n]) {
                    const role = reaction.message.guild.roles.find(r => r.name == array2[n]);
                    const guildMember = reaction.message.guild.members.get(user.id);
                    let haverole = guildMember.roles.has(role.id);
                    if (!haverole) {
                        guildMember.addRole(role).catch(console.error);
                        reaction.remove(user.id);
                        client.channels.get(reactionChannel1.id).send(user + " Joined " + role.name)
                            .then(message => {
                                message.delete(5000)
                            });
                    } else {
                        guildMember.removeRole(role).catch(console.error);
                        reaction.remove(user.id);
                        client.channels.get(reactionChannel1.id).send(user + " Left " + role.name)
                            .then(message => {
                                message.delete(5000)
                            });
                    }
                }
            }
        }
    }
});
client.on("error", (e) => {});
client.on("warn", (e) => {});
client.on("debug", (e) => {});
client.login(token);