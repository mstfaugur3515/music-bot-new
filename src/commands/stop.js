module.exports = {
    name: 'stop',
    aliases: ['leave'],
    description: 'Müziği durdurur ve sohbet odasından çıkarır.',
    usage: 'stop',
    voiceChannel: true,
    options: [],

    execute(client, message) {
        const queue = client.player.nodes.get(message.guild.id);

        if (!queue || !queue.isPlaying())
            return message.reply({ content: `❌ Şu anda çalan şarkı yok.`, allowedMentions: { repliedUser: false } });

        if (!queue.deleted)
            queue.delete();

        return message.react('👍');
    },

    slashExecute(client, interaction) {
        const queue = client.player.nodes.get(interaction.guild.id);

        if (!queue || !queue.isPlaying())
            return interaction.reply({ content: `❌ Şu anda çalan şarkı yok.`, allowedMentions: { repliedUser: false } });

        if (!queue.deleted)
            queue.delete();

        return interaction.reply('✅ Bot sohbet odasından ayrıldı.');
    },
};