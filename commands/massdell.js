const Discord = module.require('discord.js');
const db = require('better-sqlite3')('./scores.sqlite');
module.exports = {
    name: 'massdell',
    description: '[admin] Mass dell a role',
    async execute(message) {
        const getGuild = db.prepare("SELECT * FROM guildhub WHERE guild = ?");
        const prefixstart = getGuild.get(message.guild.id);
        const prefix = prefixstart.prefix;
        if (message.member.hasPermission('KICK_MEMBERS')) {
            //
        let getUsage = db.prepare("SELECT * FROM usage WHERE command = ?");
        let setUsage = db.prepare("INSERT OR REPLACE INTO usage (command, number) VALUES (@command, @number);");
        usage = getUsage.get('massdell');
        usage.number++;
        setUsage.run(usage);
        //
            let array = await message.guild.members.map(m => m);
            let args = message.content.slice(10);
            let role = message.guild.roles.find(r => r.name === args);
            console.log(args);
            if (!role) {
                return message.channel.send(`${args} does not exist!!!!!!!`);
            }
            message.channel.send(`Deleting ${role} for everyone. This may take a while.`);
            let str = "";
            for (let i of array) {
                str += await i.removeRole(role).catch(console.error);
            }
            //LOGS
            const guildChannels = getGuild.get(message.guild.id);
            var logger = message.guild.channels.get(guildChannels.logsChannel);
            if (!logger) {
                var logger = '0';
            }
            if (logger == '0') {} else {
                const logsmessage = new Discord.RichEmbed()
                    .setTitle(prefix + 'massdel')
                    .setAuthor(message.author.username, message.author.avatarURL)
                    .setDescription("Used by: " + message.author)
                    .setURL(message.url)
                    .setColor('RANDOM')
                    .addField('Usage:\n', message.content, true)
                    .addField('Channel', message.channel, true)
                    .setFooter("Message ID: " + message.id)
                    .setTimestamp();
                logger.send({
                    embed: logsmessage
                }).catch(error =>
                    console.log(new Date() + '\n' + message.guild.id + ' ' + message.guild.owner.user.username + ': index.js:' + Math.floor(ln() - 4))
                );
            }
            //
            message.channel.send(`Done! deleted ${role}`);
            console.log("done");
        }
    },
};