const Discord = module.require('discord.js');
const db = require('better-sqlite3')('./scores.sqlite');
module.exports = {
    name: 'ban',
    description: '[mod] Ban a user',
    execute(message) {
        const getGuild = db.prepare("SELECT * FROM guildhub WHERE guild = ?");
        const prefixstart = getGuild.get(message.guild.id);
        const prefix = prefixstart.prefix;
        if (!message.member.hasPermission('KICK_MEMBERS')) return;
        const member = message.mentions.members.first();
        if (!member) {
            return message.reply('You need to mention the user you wish to ban!');
        }
        //LOGS
        const guildChannels = getGuild.get(message.guild.id);
        var logger = message.guild.channels.get(guildChannels.logsChannel);
        if (!logger) {
            var logger = '0';
        }
        if (logger == '0') {} else {
            const logsmessage = new Discord.RichEmbed()
                .setTitle(prefix + 'ban')
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
        return member
            .ban()
            .then(() => message.reply(`${member.user.tag} was banned.`))
            .catch(error => message.reply('Sorry, an error occured.'));
    },
};