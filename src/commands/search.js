const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { isValidUrl } = require(`../utils/functions/isValidUrl`);


module.exports = {
    name: 'search',
    aliases: ['sr'],
    description: 'Çalmak istediğiniz müziği bulun',
    usage: 'search <URL/song name>',
    voiceChannel: true,
    options: [
        {
            name: "search",
            description: "Şarkının adı",
            type: 3,
            required: true
        }
    ],

    async execute(client, message, args) {
        if (!args[0])
            return message.reply({ content: `❌ Lütfen doğru şarkı adını girin.`, allowedMentions: { repliedUser: false } });

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
                return message.reply({ content: `❌ Bazı sorunlar oluştu. Lütfen daha sonra tekrar deneyiniz.`, allowedMentions: { repliedUser: false } });
            });

        if (!results || !results.hasTracks())
            return message.reply({ content: `❌ Sonuç bulunamadı.`, allowedMentions: { repliedUser: false } });


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
            return message.reply({ content: `❌ Sohbet odasına katılamıyor`, allowedMentions: { repliedUser: false } });
        }

        await message.react('👍');

        if (results.playlist || results.tracks.length == 1) {
            queue.addTrack(results.tracks);

            if (!queue.isPlaying()) {
                await queue.node.play()
                    .catch((error) => {
                        console.log(error);
                        return message.reply({ content: `❌ Müzik çalınamıyor Lütfen daha sonra tekrar deneyiniz.`, allowedMentions: { repliedUser: false } });
                    });
            }

            return message.reply({ content: "✅ Şarkı eklendi", allowedMentions: { repliedUser: false } });
        }
        else {
            let select = new StringSelectMenuBuilder()
                .setCustomId("musicSelect")
                .setPlaceholder("Çalmak istediğiniz şarkıyı seçin.")
                .setOptions(results.tracks.map(x => {
                    return {
                        label: x.title.length >= 25 ? x.title.substring(0, 22) + "..." : x.title,
                        description: x.title.length >= 25 ? `[${x.duration}] ${x.title}`.substring(0, 100) : `zaman: ${x.duration}`,
                        value: x.id
                    }
                }));
            let row = new ActionRowBuilder().addComponents(select);
            let msg = await message.reply({ components: [row] });

            const collector = msg.createMessageComponentCollector({
                time: 30000, // 30s
                filter: i => i.user.id === message.author.id
            });

            collector.on("collect", async i => {
                if (i.customId != "musicSelect") return;

                queue.addTrack(results.tracks.find(x => x.id == i.values[0]));

                if (!queue.isPlaying()) {
                    await queue.node.play()
                        .catch((error) => {
                            console.log(error);
                            return message.reply({ content: `❌ Müzik çalınamıyor Lütfen daha sonra tekrar deneyiniz.`, allowedMentions: { repliedUser: false } });
                        });
                }

                i.deferUpdate();
                return msg.edit({ content: "✅ Şarkı eklendi", components: [], allowedMentions: { repliedUser: false } });
            });

            collector.on("end", (collected, reason) => {
                if (reason == "time" && collected.size == 0) {
                    if (!queue?.deleted && !queue.isPlaying()) queue?.delete();
                    return msg.edit({ content: "❌ Zaman Aşımı", components: [], allowedMentions: { repliedUser: false } });
                }
            });
        }
    },

    async slashExecute(client, interaction) {
        await interaction.deferReply();

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
                return interaction.reply({ content: `❌ Bazı sorunlar oluştu. Lütfen daha sonra tekrar deneyiniz.`, allowedMentions: { repliedUser: false } });
            });

        if (!results || !results.hasTracks())
            return interaction.editReply({ content: `❌ Lütfen doğru şarkı adını girin.`, allowedMentions: { repliedUser: false } });


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
        } catch {
            await client.player.deleteQueue(interaction.guild.id);
            return interaction.editReply({ content: `❌ Sohbet odasına katılamıyor`, allowedMentions: { repliedUser: false } });
        }


        if (results.playlist || results.tracks.length == 1) {
            queue.addTrack(results.tracks);

            if (!queue.isPlaying()) {
                await queue.node.play()
                    .catch((error) => {
                        console.log(error);
                        return interaction.reply({ content: `❌ Müzik çalınamıyor Lütfen daha sonra tekrar deneyiniz.`, allowedMentions: { repliedUser: false } });
                    });
            }

            return interaction.editReply("✅ Şarkı eklendi");
        }
        else {
            let select = new StringSelectMenuBuilder()
                .setCustomId("musicSelect")
                .setPlaceholder("Çalmak istediğiniz şarkıyı seçin.")
                .setOptions(results.tracks.map(x => {
                    return {
                        label: x.title.length >= 25 ? x.title.substring(0, 22) + "..." : x.title,
                        description: x.title.length >= 25 ? `[${x.duration}] ${x.title}`.substring(0, 100) : `zaman: ${x.duration}`,
                        value: x.id
                    }
                }));
            let row = new ActionRowBuilder().addComponents(select);
            let msg = await interaction.editReply({ components: [row] });

            const collector = msg.createMessageComponentCollector({
                time: 30000, // 30s
                filter: i => i.user.id === interaction.user.id
            });

            collector.on("collect", async i => {
                if (i.customId != "musicSelect") return;

                queue.addTrack(results.tracks.find(x => x.id == i.values[0]));

                if (!queue.isPlaying()) {
                    await queue.node.play()
                        .catch((error) => {
                            console.log(error);
                            return interaction.reply({ content: `❌ Müzik çalınamıyor Lütfen daha sonra tekrar deneyiniz.`, allowedMentions: { repliedUser: false } });
                        });
                }

                i.deferUpdate();
                return interaction.editReply({ content: "✅ Şarkı eklendi", components: [] });
            });

            collector.on("end", (collected, reason) => {
                if (reason == "time" && collected.size == 0) {
                    if (!queue?.deleted && !queue.isPlaying()) queue?.delete();
                    return interaction.editReply({ content: "❌ Zaman Aşımı", components: [] });
                }
            });
        }
    },
};