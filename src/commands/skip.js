module.exports = {
    name: 'skip',
    aliases: ['s'],
    description: 'Geçerli şarkıyı atla',
    usage: 'skip',
    voiceChannel: true,
    options: [
        {
            name: "number",
            description: "Atlamak istediğiniz şarkının sırası.",
            type: 4,
            required: false
        }
    ],

    async execute(client, message, args) {
        const queue = client.player.nodes.get(message.guild.id);
        const tracks = queue.tracks.map((track, index) => `${++index}. ${track.title}`);

        if (!queue || !queue.isPlaying())
            return message.reply({ content: `❌ Şu anda çalan şarkı yok.`, allowedMentions: { repliedUser: false } });

        if (!args[0] || args[0] === '1') {
            if (queue.repeatMode === 1) {
                queue.setRepeatMode(0);
                queue.node.skip();
                await wait(500);
                queue.setRepeatMode(1);
            }
            else {
                queue.node.skip();
            }
        }
        
        else {
            skipLength = parseInt(args[0]);

            if (!skipLength || skipLength < 1 || skipLength > tracks.length) {
                return message.reply({ content: `❌ Atlanacak şarkı yok veya kuyruk numarası yanlış.`, allowedMentions: { repliedUser: false } });
            } 
            else {
                if (queue.repeatMode === 1) {
                    queue.setRepeatMode(0);
                    queue.node.skipTo(skipLength - 1);
                    await wait(500);
                    queue.setRepeatMode(1);
                }
                else {
                    queue.node.skipTo(skipLength - 1);
                }
            }
        }

        return message.react('👍');
    },

    async slashExecute(client, interaction) {
        const queue = client.player.nodes.get(interaction.guild.id);
        const tracks = queue.tracks.map((track, index) => `${++index}. ${track.title}`);
        const number = interaction.options.getInteger('number');

        if (!queue || !queue.isPlaying())
            return interaction.reply({ content: `❌ Şu anda çalan şarkı yok.`, allowedMentions: { repliedUser: false } });

        if (!number || number === 1) {
            if (queue.repeatMode === 1) {
                queue.setRepeatMode(0);
                queue.node.skip();
                await wait(500);
                queue.setRepeatMode(1);
            }
            else {
                queue.node.skip();
            }
            return interaction.reply('✅ Geçerli şarkı atlandı.');
        }

        else {
            if (!number || number < 1 || number > tracks.length) {
                return interaction.reply({ content: `❌ Atlanacak şarkı yok veya kuyruk numarası yanlış.`, allowedMentions: { repliedUser: false } });
            } 
            else {
                if (queue.repeatMode === 1) {
                    queue.setRepeatMode(0);
                    queue.node.skipTo(number - 1);
                    await wait(500);
                    queue.setRepeatMode(1);
                }
                else {
                    queue.node.skipTo(number - 1);
                }
                return interaction.reply(`✅ ${number} Numaralı şarkıya atlandı.`);
            }
        }
    },
};


const wait = (ms) => {
    return new Promise((resolve) => setTimeout(() => resolve(), ms));
};