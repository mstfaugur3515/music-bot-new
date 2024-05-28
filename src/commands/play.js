const { isValidUrl } = require(`../utils/functions/isValidUrl`);


module.exports = {
    name: 'play',
    aliases: ['p'],
    description: 'Çalmak istediğiniz şarkının adını veya linkini girin',
    usage: 'play <URL/şarkı>',
    voiceChannel: true,
    options: [
        {
            name: "search",
            description: "Çalmak istediğiniz şarkının adını veya linkini girin.",
            type: 3,
            required: true
        }
    ],

    async execute(client, message, args) {
        if (!args[0])
            return message.reply({ content: `❌ Bulmak istediğiniz şarkının adını yazın veya çalmak istediğiniz şarkının URL'sini yapıştırın.`, allowedMentions: { repliedUser: false } });

        const str = args.join(' ');
        let queryType = '';

        if (isValidUrl(str)) queryType = client.config.urlQuery;
        else queryType = client.config.textQuery;

        const results = await client.player.search(str, {
            requestedBy: message.member,
            searchEngine: queryType
        })
            .catch((error) => {
                console.log(error);
                return message.reply({ content: `❌ Bazı sorunlar oluştu.Lütfen daha sonra tekrar deneyiniz.`, allowedMentions: { repliedUser: false } });
            });

        if (!results || !results.hasTracks())
            return message.reply({ content: `❌ Sonuç bulunamadı.`, allowedMentions: { repliedUser: false } });


        /*
        const queue = await client.player.play(message.member.voice.channel.id, results, {
            nodeOptions: {
                metadata: {
                    channel: message.channel,
                    client: message.guild.members.me,
                    requestedBy: message.user
                },
                selfDeaf: true,
                leaveOnEmpty: client.config.autoLeave,
                leaveOnEnd: client.config.autoLeave,
                leaveOnEmptyCooldown: client.config.autoLeaveCooldown,
                leaveOnEndCooldown: client.config.autoLeaveCooldown,
                volume: client.config.defaultVolume,
            }
        }); // The two play methods are the same
        */
        const queue = await client.player.nodes.create(message.guild, {
            metadata: {
                channel: message.channel,
                client: message.guild.members.me,
                requestedBy: message.user
            },
            selfDeaf: true,
            leaveOnEmpty: client.config.autoLeave,
            leaveOnEnd: client.config.autoLeave,
            leaveOnEmptyCooldown: client.config.autoLeaveCooldown,
            leaveOnEndCooldown: client.config.autoLeaveCooldown,
            skipOnNoStream: true,
            volume: client.config.defaultVolume,
            connectionTimeout: 999_999_999
        });

        try {
            if (!queue.connection)
                await queue.connect(message.member.voice.channel);
        } catch (error) {
            console.log(error);
            if (!queue?.deleted) queue?.delete();
            return message.reply({ content: `❌ Bot sohbet odasına katılamıyor.`, allowedMentions: { repliedUser: false } });
        }

        results.playlist ? queue.addTrack(results.tracks) : queue.addTrack(results.tracks[0]);

        if (!queue.isPlaying()) {
            await queue.node.play()
                .catch((error) => {
                    console.log(error);
                    return message.reply({ content: `❌ Müzik çalınamıyor.Lütfen daha sonra tekrar deneyiniz.`, allowedMentions: { repliedUser: false } });
                });
        }

        return message.react('👍');
    },

    async slashExecute(client, interaction) {

        const str = interaction.options.getString("search");
        let queryType = '';

        if (isValidUrl(str)) queryType = client.config.urlQuery;
        else queryType = client.config.textQuery;

        const results = await client.player.search(str, {
            requestedBy: interaction.member,
            searchEngine: queryType
        })
            .catch((error) => {
                console.log(error);
                return interaction.reply({ content: `❌ Bazı sorunlar oluştu.Lütfen daha sonra tekrar deneyiniz.`, allowedMentions: { repliedUser: false } });
            });

        if (!results || !results.tracks.length)
            return interaction.reply({ content: `❌ Sonuç bulunamadı.`, allowedMentions: { repliedUser: false } });

        interaction.reply("✅ Şarkı oynatılıyor..");
		
        const queue = await client.player.nodes.create(interaction.guild, {
            metadata: {
                channel: interaction.channel,
                client: interaction.guild.members.me,
                requestedBy: interaction.user
            },
            selfDeaf: true,
            leaveOnEmpty: client.config.autoLeave,
            leaveOnEnd: client.config.autoLeave,
            leaveOnEmptyCooldown: client.config.autoLeaveCooldown,
            leaveOnEndCooldown: client.config.autoLeaveCooldown,
            skipOnNoStream: true,
            volume: client.config.defaultVolume,
            connectionTimeout: 999_999_999
        });

        try {
            if (!queue.connection)
                await queue.connect(interaction.member.voice.channel);
        } catch (error) {
            console.log(error);
            if (!queue?.deleted) queue?.delete();
            return interaction.reply({ content: `❌ Bot sohbet odasına katılamıyor.`, allowedMentions: { repliedUser: false } });
        }

        results.playlist ? queue.addTrack(results.tracks) : queue.addTrack(results.tracks[0]);

        if (!queue.isPlaying()) {
            await queue.node.play()
                .catch((error) => {
                    console.log(error);
                    return interaction.reply({ content: `❌ Müzik çalınamıyor.Lütfen daha sonra tekrar deneyiniz.`, allowedMentions: { repliedUser: false } });
                });
        }

    },
};