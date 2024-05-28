module.exports = {
    name: 'pause',
    aliases: ['pa'],
    description: 'Pause current song',
    usage: 'pause',
    voiceChannel: true,
    options: [],

    execute(client, message) {
        const queue = client.player.nodes.get(message.guild.id);

        if (!queue || !queue.isPlaying())
            return message.reply({ content: `❌ Şu anda hiç müzik çalmıyor.`, allowedMentions: { repliedUser: false } });

        const success = queue.node.pause();
        return success ? message.react('⏸️') : message.reply({ content: `❌ Bir şeyler ters gitti.`, allowedMentions: { repliedUser: false } });
    },

    slashExecute(client, interaction) {
        const queue = client.player.nodes.get(interaction.guild.id);

        if (!queue || !queue.isPlaying())
            return interaction.reply({ content: `❌ Şu anda hiç müzik çalmıyor.`, allowedMentions: { repliedUser: false } });

        const success = queue.node.pause();
        return success ? interaction.reply("⏸️ | Müzik durduruldu.") : interaction.reply({ content: `❌ Bir şeyler ters gitti.`, allowedMentions: { repliedUser: false } });
    },
};
