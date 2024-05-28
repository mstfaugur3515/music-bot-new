const embed = require('../embeds/embeds');


module.exports = {
    name: 'save',
    aliases: [],
    description: 'Çalınan şarkıyı özel bir mesajla kaydedin.',
    usage: 'save',
    voiceChannel: true,
    options: [],

    async execute(client, message) {
        const queue = client.player.nodes.get(message.guild.id);

        if (!queue || !queue.isPlaying())
            return message.reply({ content: `❌ Şu anda çalan şarkı yok.`, allowedMentions: { repliedUser: false } });


        const track = queue.currentTrack;
        const timestamp = queue.node.getTimestamp();
        const trackDuration = timestamp.progress == 'Forever' ? 'Endless (Live)' : track.duration;
        let description = `Sanatçı : **${track.author}**\Süre Yok **${trackDuration}**`;

        message.author.send({ embeds: [embed.Embed_save(track.title, track.url, track.thumbnail, description)] })
            //message.author.send(`Registered track: **${track.title}** | ${track.author}, Saved server: **${message.guild.name}** ✅`)
            .then(() => {
                message.react('👍');
            })
            .catch(error => {
                console.log('error: ' + error);
                message.react('❌');
            });
    },

    async slashExecute(client, interaction) {
        const queue = client.player.nodes.get(interaction.guild.id);

        if (!queue || !queue.isPlaying())
            return interaction.reply({ content: `❌ Şu anda çalan şarkı yok.`, allowedMentions: { repliedUser: false } });


        const track = queue.currentTrack;
        const timestamp = queue.node.getTimestamp();
        const trackDuration = timestamp.progress == 'Forever' ? 'Endless (Live)' : track.duration;
        let description = `Sanatçı : **${track.author}**\Süre Yok **${trackDuration}**`;

        interaction.user.send({ embeds: [embed.Embed_save(track.title, track.url, track.thumbnail, description)] })
            .then(() => {
                interaction.reply("✅ Şarkı özel mesaj olarak gönderildi.")
            })
            .catch(error => {
                console.log('error: ' + error);
                interaction.reply("❌ Şarkı özel mesaj olarak gönderilemedi.")
            });
    },
};