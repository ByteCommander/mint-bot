const fs = require('fs')
const Discord = require('discord.js');
const Canvas = require('canvas');
const request = require("request");
const translate = require('translate-google');
const moment = require('moment');
const Client = require('./client/Client');
const {
    prefix,
    token,
    yandex,
    rolemoteconf,
    rolenameconf,
    dadjokes
} = require('./config.json');
const SQLite = require("better-sqlite3");
const sql = new SQLite('./scores.sqlite');
const client = new Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const queue = new Map();
let emojiname = rolemoteconf;
let rolename= rolenameconf;
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}
//console.log(client.commands);
client.once('ready', () => {
    let nowtime = new Date();
    console.log(`${nowtime} \nBot has started, with ${client.users.size} users.\n\n`);
    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'scores';").get();
    if (!table['count(*)']) {
        sql.prepare("CREATE TABLE scores (id TEXT PRIMARY KEY, user TEXT, guild TEXT, points INTEGER, level INTEGER);").run();
        sql.prepare("CREATE UNIQUE INDEX idx_scores_id ON scores (id);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");
    }
    client.getScore = sql.prepare("SELECT * FROM scores WHERE user = ? AND guild = ?");
    client.setScore = sql.prepare("INSERT OR REPLACE INTO scores (id, user, guild, points, level) VALUES (@id, @user, @guild, @points, @level);");
    setInterval(() => {
        const dadembed = new Discord.RichEmbed()
            .setTitle("Hint:")
            .setColor('RANDOM')
            .setDescription(dadjokes[~~(Math.random() * dadjokes.length)])
        client.channels.get('628984660298563584').send({embed: dadembed});
    }, 21600000);
    setInterval(() => {
        let today = new Date();
        let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        client.channels.get('640949324829818914').setTopic('Chatter and off-topic here | '+client.users.size+' users | '+date+' '+time);
            }, 10000);
            setInterval(() => {
                let totalSeconds = (client.uptime / 1000);
                let days = Math.floor(totalSeconds / 86400);
                let hours = Math.floor(totalSeconds / 3600);
                totalSeconds %= 3600;
                let minutes = Math.floor(totalSeconds / 60);
                let seconds = Math.ceil(totalSeconds % 60);
                client.channels.get('628992550836895744').setTopic(`${client.users.size} users | bot uptime | ${days} days | ${hours} hours, ${minutes} minutes and ${seconds} seconds`);
            }, 10000);
    setInterval(() => {
        var RAN = [
            `!help`,
            `!rank`,
            `!userinfo`,
            `!top`,
            `${client.users.size} total users`
        ];
        client.user.setActivity(RAN[~~(Math.random() * RAN.length)], {type: 'LISTENING'});
        
    }, 10000);
   let testchannel = client.channels.get('645033708860211206');
    testchannel.fetchMessage('645034653652090880');
    testchannel.fetchMessage('645035108306255883');
    testchannel.fetchMessage('645035668447297568');
});
client.once('reconnecting', () => {
    let nowtime = new Date();
    console.log(`${nowtime} \nBot has reconnected, with ${client.users.size} users.\n\n`);
});
client.once('disconnect', () => {
    console.log('Disconnect!');
});
client.on("guildMemberAdd", async (guildMember) => {
    let user = guildMember.user;
    var cdate = moment.utc(user.createdAt).format('YYYYMMDD');
    let ageS = moment(cdate, "YYYYMMDD").fromNow(true);
    let ageA = ageS.split(" ");
    //console.log(ageA);
    if (ageA[1] == "hours") {
        guildMember.addRole(guildMember.guild.roles.get("640535533457637386"));
        return client.channels.get('641301287144521728').send(guildMember.user+"\nYour account is younger than 30 days!\nTo prevent spammers and ban evaders we have temporarely muted you.\nSend at least one message in this channel, and we will get back to you.\n\nMods can use !approve @mention to approve this member.");
    }
    if (ageA[1] == "day") {
        guildMember.addRole(guildMember.guild.roles.get("640535533457637386"));
        return client.channels.get('641301287144521728').send(guildMember.user+"\nYour account is younger than 30 days!\nTo prevent spammers and ban evaders we have temporarely muted you.\nSend at least one message in this channel, and we will get back to you.\n\nMods can use !approve @mention to approve this member.");
    }
    if (ageA[1] == "days") {
        guildMember.addRole(guildMember.guild.roles.get("640535533457637386"));
        return client.channels.get('641301287144521728').send(guildMember.user+"\nYour account is younger than 30 days!\nTo prevent spammers and ban evaders we have temporarely muted you.\nSend at least one message in this channel, and we will get back to you.\n\nMods can use !approve @mention to approve this member.");
    }
    let muteevade = fs.readFileSync('mute.txt').toString().split("\n");
    if(muteevade.includes(guildMember.id)) {
        guildMember.addRole(guildMember.guild.roles.get("640535533457637386"));
      return client.channels.get('641301287144521728').send(guildMember.user+"\nYou succesfully evaded your mute!\nSYKE!\nMUTED!");
    }
    
        var ReBeL = guildMember.user.username;
        var bel = ["\njust started brewing some minty tea!", "\nis using Arch BTW!", "\necho 'is here!'", "\nis sipping minty tea!", "\nuseradd -m -g users /bin/sh @"];
        var moon = bel[~~(Math.random() * bel.length)];
        moon = moon.replace('@', ReBeL)
        const canvas = Canvas.createCanvas(700, 250);
	const ctx = canvas.getContext('2d');
	const background = await Canvas.loadImage('./mintwelcome.png');
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = '#74037b';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.font = '30px Zelda';
    ctx.shadowColor="black";
    ctx.shadowBlur=5;
	ctx.fillStyle = '#FFFFFF';
    ctx.fillText(ReBeL, canvas.width / 3.0, canvas.height / 2.0);
    ctx.font = '21px sans-serif';
	ctx.fillStyle = '#ffffff';
    ctx.fillText(moon, canvas.width / 3.0, canvas.height / 2.0);
    const avatar = await Canvas.loadImage(guildMember.user.displayAvatarURL);
	ctx.drawImage(avatar, 600, 25, 50, 50);
    const attachment = new Discord.Attachment(canvas.toBuffer(), 'welcome-image.png');
        client.channels.get('628984660298563584').send(attachment);
        guildMember.addRole(guildMember.guild.roles.get("628979872466993153"));
        });
client.on("presenceUpdate", (oldMember, newMember) => {
    if(oldMember.presence.game !== newMember.presence.game) {
            if(!newMember.presence.game) {
                return;
            }
            if(!newMember.presence.game.url) {
                return;
            }
            if(newMember.presence.game.url.includes("twitch")) {
                //elervated
                if(client.guilds.get('356642342184288258')) {
                    client.channels.get('356642342184288259').send(`@here` + " " + newMember.user.username + " just went live!" + "\n" + newMember.presence.game.name + "\n" + newMember.presence.game.url);
                }
                //mint
                if(client.guilds.get('628978428019736619')) {
                    client.channels.get('628992550836895744').send(` ` + " " + newMember.user.username + " just went live!" + "\n" + newMember.presence.game.name + "\n" + newMember.presence.game.url);
                }
            }
    }
    if(oldMember.presence.status !== newMember.presence.status){
        if(`${newMember.user.username}` === "UtopicUnicorn") {
            if(`${newMember.presence.status}` === "dnd") {
                client.channels.get('628984660298563584').setTopic(`${newMember.user.username} has enlightened us with their presence!`);
            }
        }
            if(`${newMember.presence.status}` === "online") {
                client.channels.get('628984660298563584').setTopic(`${newMember.user.username} has enlightened us with their presence!`);
            }
    }
});
client.on('message', async message => {
    const args = message.content.slice(1).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    //Reaction roles
    if(message.content.startsWith(prefix+"reaction")){
        if(!message.channel.guild) return;
        for(let n in emojiname){
        var emoji =[message.guild.emojis.find(r => r.name == emojiname[n])];
        for(let i in emoji){
         message.react(emoji[i]);
        }
       }
      }
    //Disboard watch
    if(message.author.username === "DISBOARD") {
        if(message.embeds[0].description.includes("Bump done")) {
    setTimeout(() => {
        client.channels.get('640949324829818914').send("You can !d bump in <#628992550836895744>");
    }, 7200000);
    return
        }
    }
    //
    if (message.author.bot) return;
    //Mute filter
    let filtermute = fs.readFileSync('mute.txt').toString().split("\n");
    if(filtermute.includes(message.author.id)) {
        if (message.channel.id === '641301287144521728') {
            return
        }
        let nowtime = new Date();    
        console.log(`${nowtime} \n`+message.author.username + '\n' + message.content+'\n\n');
        message.delete()
    return
    }
    //
    //Artemis Talk
   if (message.channel.id === '642882039372185609') {
    if(message.author.id === "127708549118689280") {
        client.channels.get('640949324829818914').send(message.content);
        return;
    }
}
    //
    //chatgiffilter
    if (message.channel.id === '640949324829818914') {
        if(message.content.includes("https://tenor.com")) {
            message.delete()
        }
    }
    if (message.channel.id === '628984660298563584') {
        if(message.content.includes("https://tenor.com")) {
            message.delete()
        }
    }
    if (message.channel.id === '628984660298563584') {
    if(message.content.includes(".gif")) {
        message.delete();
    }}
    if (message.channel.id === '640949324829818914') {
        if(message.content.includes(".gif")) {
            message.delete();
        }}
    //
    //Direct Message handle
    if (message.channel.type == "dm") {
        return
    }
    //
    //Simulate guild member join
    if (message.content === '!join') {
        if(message.author.id === "127708549118689280") {
		client.emit('guildMemberAdd', message.member || await message.guild.fetchMember(message.author));
        }
    }
    //
    //bot reactions
    if(message.content.includes("Stop it artemis")) {
        if(message.author.id === "127708549118689280") {
            message.channel.send(`THIS IS NOT A PHASE DAD, YOU DONT KNOW ME!`);
        }
    }
    goodnight = ['night', 'Night', 'Goodnight', 'goodnight', 'Sleep well'];
    if(goodnight.includes(message.content)) {
        message.reply("Have a good night :)");
    }
    goodmorning = ['Morning', 'morning', 'Goodmorning', 'goodmorning'];
    if(goodmorning.includes(message.content)) {
        message.reply("Hello you, hope you slept well!");
    }
    HELLNO = ['uwu', 'UWU', 'OWO', 'UwU', 'OwO'];
    if(HELLNO.includes(message.content)) {
        if(message.author.id === "606067073445003284") {
            client.channels.get('628984660298563584').setTopic(`LGB UwU'd again`);
        }
    }
    if(message.content.includes("Why artemis")) {
        if(message.author.id === "127708549118689280") {
            message.channel.send(`THIS IS THE REAL ME!`);
        }
    }
    if(message.content.includes("Artemis")) {
        message.react("👀");
    }
    //
    //translate
    let baseurl = "https://translate.yandex.net/api/v1.5/tr.json/translate";
    let key = yandex;
    let text = message.content;
    let url = baseurl + "?key=" + key + "&hint=en,de,nl,fr,tr&lang=en" + "&text=" + encodeURIComponent(text) + "&format=plain";
    request(url, { json: true }, (err, res, body) => {
        if(!body.text) {
            return
        }
        if(JSON.stringify(body).startsWith('{"code":200,"lang":"en-en"')) {
            return;
        }
        translate(text, {to: 'en'}).then(res => {
            message.channel.send(res);
        }).catch(err => {
            console.error(err);
        });
        if (err) return message.channel.send(err);
    });
    //
    if (message.author.bot) return;
    if(message.content.startsWith("^")) {
        message.channel.send("I agree!");
    }
    let score;
    if (message.guild) {
        score = client.getScore.get(message.author.id, message.guild.id);
        if (!score) {
            score = { id: `${message.guild.id}-${message.author.id}`, user: message.author.id, guild: message.guild.id, points: 0, level: 1 };
        }
        score.points++;
        const curLevel = Math.floor(0.5 * Math.sqrt(score.points));
        if(score.level < curLevel) {
            score.level++;
            message.react("⬆");
        }
        client.setScore.run(score);
    }
    if(message.content.startsWith("!give")) {
        if(message.author.username == "UtopicUnicorn") {
            const user = message.mentions.users.first() || client.users.get(args[0]);
            if (!user) return message.reply("You must mention someone or give their ID!");
            const pointsToAdd = parseInt(args[1], 10);
            if (!pointsToAdd) return message.reply("You didn't tell me how many points to give...")
            let userscore = client.getScore.get(user.id, message.guild.id);
            if (!userscore) {
                userscore = { id: `${message.guild.id}-${user.id}`, user: user.id, guild: message.guild.id, points: 0, level: 1 }
            }
            userscore.points += pointsToAdd;
            let userLevel = Math.floor(0.1 * Math.sqrt(score.points));
            userscore.level = userLevel;
            client.setScore.run(userscore);
            return message.channel.send(`${user.tag} has received ${pointsToAdd} points and now stands at ${userscore.points} points.`);
        }
    }
    //filter
    if(score.level < 2) {
           if(message.content.includes("http")) {
            message.reply("Users who are not level 2 may not post links.\nTo check your level use !points");
            message.delete();
    }
    }
    //5  
    if(score.level > 4 && score.level < 9) {
        let checking2 = message.member.roles.find(r => r.name === `Minty Messenger`);
        if (!checking2) {
            let freshnew = message.guild.roles.find(r => r.name === `Minty Messenger`);
            message.member.addRole(freshnew);
            message.reply("You earned the title " + freshnew);
        }
    }
    //10
    if(score.level > 9 && score.level < 14) {
        let checking3 = message.member.roles.find(r => r.name === `Ruler of Messages`);
        if (!checking3) {
            let freshnew = message.guild.roles.find(r => r.name === `Minty Messenger`);
            let rulerofmessages = message.guild.roles.find(r => r.name === `Ruler of Messages`);
            message.member.addRole(rulerofmessages);
            message.member.removeRole(freshnew);
            message.reply("You earned the title " + rulerofmessages);
        }
    }
    //15
    if(score.level > 14 && score.level < 19) {
        //console.log("HELLO");
        let checking4 = message.member.roles.find(r => r.name === `Fresh Messenger`);
        if (!checking4) {
            let freshmessenger = message.guild.roles.find(r => r.name === `Fresh Messenger`);
            let rulerofmessages = message.guild.roles.find(r => r.name === `Ruler of Messages`);
            message.member.addRole(freshmessenger);
            message.member.removeRole(rulerofmessages);
            message.reply("You earned the title " + freshmessenger);
        }
    }
    //20
    if(score.level > 19 && score.level < 29) {
        let checking5 = message.member.roles.find(r => r.name === `Red Hot Keyboard Warrior`);
        if (!checking5) {
            let freshmessenger = message.guild.roles.find(r => r.name === `Fresh Messenger`);
            let rhkw = message.guild.roles.find(r => r.name === `Red Hot Keyboard Warrior`);
            message.member.addRole(rhkw);
            message.member.removeRole(freshmessenger);
            message.reply("You earned the title " + rhkw);
        }
    }
    //30
    if(score.level > 29 && score.level < 49) {
        let checking6 = message.member.roles.find(r => r.name === `Basically a Cheater`);
        if (!checking6) {
            let rhkw = message.guild.roles.find(r => r.name === `Red Hot Keyboard Warrior`);
            let bac = message.guild.roles.find(r => r.name === `Basically a Cheater`);
            message.member.addRole(bac);
            message.member.removeRole(rhkw);
            message.reply("You earned the title " + bac);
        }
    }
    //50
    if(score.level > 49 && score.level < 99) {
        let checking7 = message.member.roles.find(r => r.name === `Sage of Messages`);
        if (!checking7) {
            let bac = message.guild.roles.find(r => r.name === `Basically a Cheater`);
            let sageom = message.guild.roles.find(r => r.name === `Sage of Messages`);
            message.member.addRole(sageom);
            message.member.removeRole(bac);
            message.reply("You earned the title " + sageom);
        }
    }
    if(message.content.startsWith("!points")) {
        message.reply(`You currently have ${score.points} points and are level ${score.level}!`);
    }
    if(message.content.startsWith("!top")) {
        const top10 = sql.prepare("SELECT * FROM scores WHERE guild = ? ORDER BY points DESC LIMIT 10;").all(message.guild.id);
        const embed = new Discord.RichEmbed()
            .setTitle("Leaderboard")
            .setAuthor(client.user.username, client.user.avatarURL)
            .setDescription("Our top 10 points leaders!")
            .setColor(0x00AE86);
        for(const data of top10) {
            embed.addField(client.users.get(data.user).tag, `${data.points} points (level ${data.level})`);
        }
        message.channel.send({embed});
    }
    if (!message.content.startsWith(prefix)) return;
    try {
        command.execute(message);
    } catch (error) {
        //console.error(error);
    }
});
//reaction roles
client.on("messageReactionAdd",(reaction,user)=>{
    if (reaction.message.channel.id === '645033708860211206') {
    if(!user) return;
    if(user.bot)return;
    if(!reaction.message.channel.guild) return;
    for(let n in emojiname){
    if(reaction.emoji.name == emojiname[n]){
      const role = reaction.message.guild.roles.find(r => r.name == rolename[n]);
      const guildMember = reaction.message.guild.members.get(user.id);
      let haverole = guildMember.roles.has(role.id);
       if (!haverole) {
        guildMember.addRole(role).catch(console.error);
        reaction.remove(user.id);
        client.channels.get('645033708860211206').send(user+" Joined "+role)
        .then(message => {
          message.delete(5000)
        });
      } 
      else {
        guildMember.removeRole(role).catch(console.error);
      reaction.remove(user.id);
         client.channels.get('645033708860211206').send(user+" Left "+role)
      .then(message => {
       message.delete(5000)
      });
      }      
    }}
  }
  });


client.login(token);