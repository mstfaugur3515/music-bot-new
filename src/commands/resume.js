module.exports = {
    name: 'resume',
    aliases: [],
    description: 'Duraklatılan müziği devam ettir',
    usage: 'resume',
    voiceChannel: true,
    options: [],

    execute(client, message) {
        const queue = client.player.nodes.get(message.guild.id);

        if (!queue)
            return message.reply({ content: `❌ Şu anda çalan şarkı yok.`, allowedMentions: { repliedUser: false } });

        const success = queue.node.resume();
        return success ? message.react('▶️') : message.reply({ content: `❌ Bir şeyler ters gitti.`, allowedMentions: { repliedUser: false } });
    },

    slashExecute(client, interaction) {
        const queue = client.player.nodes.get(interaction.guild.id);

        if (!queue)
            return interaction.reply({ content: `❌ Şu anda çalan şarkı yok.`, allowedMentions: { repliedUser: false } });

        const success = queue.node.resume();
        return success ? interaction.reply("▶️ Şarkı oynatılmaya devam ediyor.") : interaction.reply({ content: `❌ Bir şeyler ters gitti.`, allowedMentions: { repliedUser: false } });
    },
};