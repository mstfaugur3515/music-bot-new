const embed = require('../embeds/embeds');


module.exports = {
    name: 'queue',
    aliases: ['q', 'list'],
    description: 'Çalmakta olan kuyruğu göster',
    usage: 'queue',
    voiceChannel: true,
    options: [],

    execute(client, message) {
        const queue = client.player.nodes.get(message.guild.id);

        if (!queue || !queue.currentTrack)
            return message.reply({ content: `❌ Şu anda çalan şarkı yok.`, allowedMentions: { repliedUser: false } });


        const tracks = queue.tracks.map((track, index) => `${++index}. ${track.title}`);

        let nowplaying = `Şu anda çalan : ${queue.currentTrack.title}\n\n`;
        let tracksQueue = '';

        if (tracks.length < 1) {
            tracksQueue = '------------------------------';
        }
        else if (tracks.length > 29) {
            tracksQueue = tracks.slice(0, 30).join('\n');
            tracksQueue += `\ve diğer şarkılar ${tracks.length - 30} şarkı`;
        }
        else {
            tracksQueue = tracks.join('\n');
        }

        let loopStatus = queue.repeatMode ? (queue.repeatMode === 2 ? 'All' : 'One') : 'Off';
        return message.reply({ embeds: [embed.Embed_queue("Şarkı listesi", nowplaying, tracksQueue, loopStatus)], allowedMentions: { repliedUser: false } });
    },

    slashExecute(client, interaction) {
        const queue = client.player.nodes.get(interaction.guild.id);

        if (!queue || !queue.currentTrack)
            return interaction.reply({ content: `❌ Şu anda çalan şarkı yok.`, allowedMentions: { repliedUser: false } });


        const tracks = queue.tracks.map((track, index) => `${++index}. ${track.title}`);

        let nowplaying = `oynatılıyor : ${queue.currentTrack.title}\n\n`;
        let tracksQueue = '';

        if (tracks.length < 1) {
            tracksQueue = '------------------------------';
        }
        else if (tracks.length > 29) {
            tracksQueue = tracks.slice(0, 30).join('\n');
            tracksQueue += `\ve diğer şarkılar ${tracks.length - 30} şarkı`;
        }
        else {
            tracksQueue = tracks.join('\n');
        }

        let loopStatus = queue.repeatMode ? (queue.repeatMode === 2 ? 'All' : 'One') : 'Off';
        return interaction.reply({ embeds: [embed.Embed_queue("Şarkı listesi", nowplaying, tracksQueue, loopStatus)] });
    },
};