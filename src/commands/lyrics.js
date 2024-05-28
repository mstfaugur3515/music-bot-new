const embed = require('../embeds/embeds');
const lyricsFinder = require('lyrics-finder');

module.exports = {
    name: 'lyrics',
    aliases: ['ly'],
    description: 'Şarkınının sözlerini görüntüler',
    usage: 'lyrics <song name>',
    voiceChannel: true,
    options: [
        {
            name: "search",
            description: "Aramak istediğiniz şarkının adı",
            type: 3,
            required: false,
        }
    ],

    async execute(client, message, args) {
        const queue = client.player.nodes.get(message.guild.id);

        if (!args[0]) {
            if (!queue || !queue.isPlaying()) 
                return message.reply('❌ Şu anda çalan şarkı yok.');
            
            try {
                const lyrics = await lyricsFinder(queue.current.title, '');
                if (lyrics.trim().length === 0) {
                    throw error;
                }
                return message.reply({ embeds: [embed.Embed_lyrics(queue.current.title, lyrics)] , allowedMentions: { repliedUser: false }});
            } catch (error) {
                return message.reply({ content: '❌ Şarkı sözleri bulunamadı', allowedMentions: { repliedUser: false }});
            }
        }

        try {
            const lyrics = await lyricsFinder(args, '');
            if (lyrics.trim().length === 0) {
                throw error;
            }
            Title = args.join(' ');
            return message.reply({ embeds: [embed.Embed_lyrics(Title, lyrics)] , allowedMentions: { repliedUser: false }});
        } catch (error) {
            return message.reply({ content: '❌ Şarkı sözleri bulunamadı', allowedMentions: { repliedUser: false }});
        }
    },

    async slashExecute(client, interaction) {
        const queue = client.player.nodes.get(interaction.guild.id);

        if (!interaction.options.getString('search')) {
            if (!queue || !queue.isPlaying()) 
                return interaction.reply('❌ Şu anda çalan şarkı yok.');
            
            try {
                await interaction.deferReply('🔍 Şarkı sözlerini aranıyor...');
                const lyrics = await lyricsFinder(queue.current.title, '');
                if (lyrics.trim().length === 0) {
                    throw error;
                }
                return interaction.editReply({ embeds: [embed.Embed_lyrics(queue.current.title, lyrics)] });
            } catch (error) {
                return interaction.editReply('❌ Şarkı sözleri bulunamadı');
            }
        }

        try {
            await interaction.deferReply('🔍 Şarkı sözlerini aranıyor...');
            const Title = interaction.options.getString('search');
            const lyrics = await lyricsFinder(Title, '');
            if (lyrics.trim().length === 0) {
                throw error;
            }
            return interaction.editReply({ embeds: [embed.Embed_lyrics(Title, lyrics)] });
        } catch (error) {
            return interaction.editReply('❌ Şarkı sözleri bulunamadı');
        }
    },
};