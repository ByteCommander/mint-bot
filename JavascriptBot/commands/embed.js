const Discord = module.require('discord.js');
const db = require('better-sqlite3')('./scores.sqlite');
module.exports = {
    name: 'embed',
    description: '[mod] generate an embed',
    execute(message) {
        const getGuild = db.prepare("SELECT * FROM guildhub WHERE guild = ?");
        const prefixstart = getGuild.get(message.guild.id);
        const prefix = prefixstart.prefix;
        if (!message.member.hasPermission('KICK_MEMBERS')) return;
            let args = message.content.slice(prefix.length + 6).split('\n');
            message.delete();
            let embed = new Discord.RichEmbed()
                .setColor(`RANDOM`)
                .setTitle(args[0])
                .setDescription(args)
            return message.channel.send({
                embed
            });
    },
};