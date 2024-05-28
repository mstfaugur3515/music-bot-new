module.exports = {
    name: 'volume',
    aliases: ['v'],
    description: `Ses seviyesi`,
    usage: 'v <0-200>',
    voiceChannel: true,
    options: [
        {
            name: "volume",
            description: "Ses Seviyesi (0-200)",
            type: 4,
            required: true,
            min_value: 1
        }
    ],


    async execute(client, message, args) {
        const maxVolume = client.config.maxVolume;
        const queue = client.player.nodes.get(message.guild.id);

        if (!queue || !queue.isPlaying())
            return message.reply({ content: `❌ Şu anda çalan şarkı yok.`, allowedMentions: { repliedUser: false } });


        await message.react('👍');
        const vol = parseInt(args[0], 10);

        if (!vol)
            return interaction.reply({ content: `Ses Seviyesi: **${queue.node.volume}** 🔊\n**Ses seviyesini değiştirmek için \`1\` ile \`${maxVolume}\`  arasında bir sayı yazın.**`, allowedMentions: { repliedUser: false } });
        if (queue.volume === vol)
            return message.reply({ content: `❌ Değiştirmek istediğiniz ses seviyesi`, allowedMentions: { repliedUser: false } });

        if (vol < 0 || vol > maxVolume)
            return message.reply({ content: `❌ **Ses seviyesini değiştirmek için \`1\` ile \`${maxVolume}\`  arasında bir sayı yazın.**`, allowedMentions: { repliedUser: false } });


        const success = queue.node.setVolume(vol);
        const replymsg = success ? `Ses seviyesini şu şekilde ayarladın: 🔊 **${vol}**/**${maxVolume}**%` : `❌ Bir şeyler ters gitti.`;
        return message.reply({ content: replymsg, allowedMentions: { repliedUser: false } });
    },

    async slashExecute(client, interaction) {
        const maxVolume = client.config.maxVolume;
        const queue = client.player.nodes.get(interaction.guild.id);

        if (!queue || !queue.isPlaying())
            return interaction.reply({ content: `❌ Şu anda çalan şarkı yok.`, allowedMentions: { repliedUser: false } });

        const vol = parseInt(interaction.options.getInteger("volume"), 10);

        if (!vol)
            return interaction.reply({ content: `Ses Seviyesi: **${queue.node.volume}** 🔊\n**Ses seviyesini değiştirmek için \`1\` ile \`${maxVolume}\`  arasında bir sayı yazın.**`, allowedMentions: { repliedUser: false } });

        if (queue.volume === vol)
            return interaction.reply({ content: `❌ Değiştirmek istediğiniz ses seviyesi`, allowedMentions: { repliedUser: false } });

        if (vol < 0 || vol > maxVolume)
            return interaction.reply({ content: `❌ **Ses seviyesini değiştirmek için \`1\` ile \`${maxVolume}\`  arasında bir sayı yazın.**`, allowedMentions: { repliedUser: false } });


        const success = queue.node.setVolume(vol);
        const replymsg = success ? `Ses seviyesini şu şekilde ayarladın: 🔊 **${vol}**/**${maxVolume}**%` : `❌ Bir şeyler ters gitti.`;
        return interaction.reply({ content: replymsg, allowedMentions: { repliedUser: false } });
    },
};