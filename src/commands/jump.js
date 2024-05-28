module.exports = {
    name: 'jump',
    aliases: ['j'],
    description: `Seçilen şarkıya geç.`,
    usage: 'jump <Kuyruk sırası>',
    voiceChannel: true,
    options: [
        {
            name: "number",
            description: "Oynatmak istediğiniz kuyruk numarası",
            type: 4,
            required: true,
            min_value: 1
        }
    ],

    async execute(client, message, args) {
        const queue = client.player.nodes.get(message.guild.id);
        const tracks = queue.tracks.map((track, index) => `${++index}. ${track.title}`);

        if (!queue || !queue.isPlaying())
            return message.reply({ content: `❌ Şu anda hiçbir müzik çalmıyor.`, allowedMentions: { repliedUser: false } });

        if (!args[0])
            return message.reply({ content: `❌ Lütfen [1-10] arasında çalmak istediğiniz şarkı sırasını girin. ${tracks.length}`, allowedMentions: { repliedUser: false }});

        if (args[0] > tracks.length || args[0] < 1 || isNaN(args[0]))
            return message.reply({ content: `❌ Lütfen [1-10] arasında doğru takip sırasını girin. ${tracks.length}`, allowedMentions: { repliedUser: false }});

        const jumpLength = parseInt(args[0]) - 1;

        if (queue.repeatMode === 1) {
            queue.setRepeatMode(0);
            queue.node.jump(jumpLength);
            await wait(500);
            queue.setRepeatMode(1);
        } else {
            queue.node.jump(jumpLength);
        }

        return message.react('⏭️');
    },

    async slashExecute(client, interaction) {
        const queue = client.player.nodes.get(interaction.guild.id);
        const tracks = queue.tracks.map((track, index) => `${++index}. ${track.title}`);
        const index_number = interaction.options.getInteger('number');

        if (!queue || !queue.isPlaying())
            return interaction.reply({ content: `❌ Şu anda hiçbir müzik çalmıyor.`, allowedMentions: { repliedUser: false } });

        if (!index_number)
            return interaction.reply({ content: `❌ Lütfen [1-10] arasında çalmak istediğiniz şarkı sırasını girin. ${tracks.length}`, allowedMentions: { repliedUser: false }});

        if (index_number > queue.length || index_number < 1 || isNaN(index_number))
            return interaction.reply({ content: `❌ Lütfen [1-10] arasında doğru takip sırasını girin. ${tracks.length}`, allowedMentions: { repliedUser: false }});

        const jumpLength = parseInt(index_number) - 1;

        if (queue.repeatMode === 1) {
            queue.setRepeatMode(0);
            queue.node.jump(jumpLength);
            await wait(500);
            queue.setRepeatMode(1);
        } else {
            queue.node.jump(jumpLength);
        }

        return interaction.reply({ content: `⏭️ Şu anda ${index_number} numaralı parça çalıyor`, allowedMentions: { repliedUser: false }});
    },
};
