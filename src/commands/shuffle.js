module.exports = {
    name: 'shuffle',
    aliases: ['sh', 'random'],
    description: 'Rastgele kuyruk sıralaması',
    usage: 'shuffle',
    voiceChannel: true,
    options: [],

    async execute(client, message) {
        const queue = client.player.nodes.get(message.guild.id);

        if (!queue || !queue.isPlaying())
            return message.reply({ content: `❌ Şu anda çalan şarkı yok.`, allowedMentions: { repliedUser: false } });

        queue.tracks.shuffle();
        return message.react('👍');
    },

    slashExecute(client, interaction) {
        const queue = client.player.nodes.get(interaction.guild.id);

        if (!queue || !queue.isPlaying())
            return interaction.reply({ content: `❌ Şu anda çalan şarkı yok.`, allowedMentions: { repliedUser: false } });

        queue.tracks.shuffle();
        return interaction.reply('✅ Sıradaki şarkılar artık rastgele sıralanıyor.');
    },
};