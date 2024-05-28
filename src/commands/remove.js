const embed = require('../embeds/embeds');


module.exports = {
    name: 'remove',
    aliases: ['rm'],
    description: 'Sıradan bir şarkıyı kaldırma',
    usage: 'remove <song index number>',
    voiceChannel: true,
    options: [
        {
            name: "number",
            description: "Sıradaki şarkıların sırası",
            type: 4,
            required: false
        }
    ],

    async execute(client, message, args) {
        const queue = client.player.nodes.get(message.guild.id);

        if (!queue || !queue.isPlaying())
            return message.reply({ content: `❌ Şu anda çalan şarkı yok.`, allowedMentions: { repliedUser: false } });


        const tracks = queue.tracks.map((track, index) => `${++index}. ${track.title}`);

        if (tracks.length < 1)
            return message.reply({ content: `❌ Sırada oynatılacak başka bir şarkı yok`, allowedMentions: { repliedUser: false } });

        if (!args[0]) {
            let nowplaying = `çalıyor : ${queue.currentTrack.title}\n\n`;
            let tracksQueue = '';

            if (tracks.length > 29) {
                tracksQueue = tracks.slice(0, 30).join('\n');
                tracksQueue += `\ndiğer şarkılar ${tracks.length - 30} şarkı`;
            }
            else {
                tracksQueue = tracks.join('\n');
            }

            const instruction = `**1**den **${tracks.length}**e kadar**kaldırmak** için bir dizi seçin veya**iptal** etmek için başka bir şey yazın ⬇️`;
            let loopStatus = queue.repeatMode ? (queue.repeatMode === 2 ? 'All' : 'ONE') : 'Off';
            await message.reply({ content: instruction, embeds: [embed.Embed_queue("Kaldırılan şarkılar", nowplaying, tracksQueue, loopStatus)], allowedMentions: { repliedUser: false } });


            const collector = message.channel.createMessageCollector({
                time: 30000, // 30s
                errors: ['time'],
                filter: m => m.author.id === message.author.id
            });

            collector.on('collect', async (query) => {

                const index = parseInt(query.content);

                if (!index || index <= 0 || index > tracks.length) {
                    return message.reply({ content: `✅ Kaldırma iptal edildi.`, allowedMentions: { repliedUser: false } })
                        && collector.stop();
                }

                collector.stop();
                await queue.node.remove(index - 1);

                query.reply({ content: `❌ ${tracks[index - 1]} kuyruktan kaldırıldı`, allowedMentions: { repliedUser: false }});
                //query.reply({ embeds: [embed.Embed_remove("Removed Music", tracks[index - 1])], allowedMentions: { repliedUser: false } });
                return query.react('👍');
            });

            collector.on('end', (msg, reason) => {
                if (reason === 'time')
                    return message.reply({ content: `❌ Kaldırma süresi doldu.`, allowedMentions: { repliedUser: false } });
            });
        } else {
            const index = parseInt(args[0]);

            if (!index || index <= 0 || index > tracks.length) {
                return message.reply({ content: `❌ Kaldırmak istediğiniz şarkı sırada değil veya numara hatalı.`, allowedMentions: { repliedUser: false } });
            }

            await queue.node.remove(index - 1);
            message.reply({ content: `❌ ${tracks[index - 1]} kuyruktan kaldırıldı`, allowedMentions: { repliedUser: false } });
            //return message.reply({ embeds: [embed.Embed_remove("Removed Music", tracks[index - 1])], allowedMentions: { repliedUser: false } });
            return message.react('👍');
        }
    },

    async slashExecute(client, interaction) {
        const queue = client.player.nodes.get(interaction.guild.id);
        const number = interaction.options.getInteger('number');

        if (!queue || !queue.isPlaying())
            return interaction.reply({ content: `❌ Şu anda çalan şarkı yok.`, allowedMentions: { repliedUser: false } });


        const tracks = queue.tracks.map((track, index) => `${++index}. ${track.title}`);

        if (tracks.length < 1)
            return interaction.reply({ content: `❌ Sırada oynatılacak başka bir şarkı yok`, allowedMentions: { repliedUser: false } });

        if (!number) {
            let nowplaying = `çalıyor : ${queue.currentTrack.title}\n\n`;
            let tracksQueue = '';

            if (tracks.length > 29) {
                tracksQueue = tracks.slice(0, 30).join('\n');
                tracksQueue += `\ndiğer şarkılar ${tracks.length - 30} şarkı`;
            }
            else {
                tracksQueue = tracks.join('\n');
            }

            const instruction = `**1**den **${tracks.length}**e kadar**kaldırmak** için bir dizi seçin veya**iptal** etmek için başka bir şey yazın ⬇️`;
            let loopStatus = queue.repeatMode ? (queue.repeatMode === 2 ? 'All' : 'ONE') : 'Off';
            await interaction.reply({ content: instruction, embeds: [embed.Embed_queue("Kaldırılan şarkılar", nowplaying, tracksQueue, loopStatus)], allowedMentions: { repliedUser: false } });


            const collector = interaction.channel.createMessageCollector({
                time: 30000, // 30s
                errors: ['time'],
                filter: m => m.author.id === interaction.user.id
            });

            collector.on('collect', async (query) => {
                const index = parseInt(query.content);

                if (!index || index <= 0 || index > tracks.length) {
                    return query.reply({ content: `✅ Kaldırma iptal edildi.`, allowedMentions: { repliedUser: false } })
                        && collector.stop();
                }

                collector.stop();
                await queue.node.remove(index - 1);

                query.reply({ content: `❌ ${tracks[index - 1]} kuyruktan kaldırıldı`, allowedMentions: { repliedUser: false }})
                //query.reply({ embeds: [embed.Embed_remove("Removed Music", tracks[index - 1])], allowedMentions: { repliedUser: false } });
                return query.react('👍');
            });

            collector.on('end', (msg, reason) => {
                if (reason === 'time')
                    return interaction.reply({ content: `❌ Kaldırma süresi doldu.`, allowedMentions: { repliedUser: false } });
            });
        } else {

            if (!number || number <= 0 || number > tracks.length) {
                return interaction.reply({ content: `❌ Kaldırmak istediğiniz şarkı sırada değil veya numara hatalı.`, allowedMentions: { repliedUser: false } });
            }

            await queue.node.remove(number - 1);
            return interaction.reply({ content: `❌ ${tracks[number - 1]} kuyruktan kaldırıldı`, allowedMentions: { repliedUser: false } });
            //return interaction.reply({ embeds: [embed.Embed_remove("Removed Music", tracks[number - 1])], allowedMentions: { repliedUser: false } });
        }
    },
};