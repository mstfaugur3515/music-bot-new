const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const embed = require(`${__dirname}/../embeds/embeds`);
const { settings } = require(`${__dirname}/../utils/player/settings`);
const { wait } = require(`${__dirname}/../utils/functions/wait`);
const { color, button } = require(`${__dirname}/../utils/constants`);


module.exports = async (client, int) => {

    if (int.isButton()) {
        if (!int.member.voice.channel)
            return int.reply({ content: `❌ Sohbet odasına bağlı değilsin.`, ephemeral: true, components: [] });

        if (int.guild.members.me.voice.channel && int.member.voice.channelId !== int.guild.members.me.voice.channelId)
            return int.reply({ content: `❌ Bot ile aynı sohbet odasında değilsin.`, ephemeral: true, components: [] });


        const queue = client.player.nodes.get(int.guildId);

        if (!queue || !queue.isPlaying())
            return int.reply({ content: `❌ Şu anda çalan şarkı yok.`, ephemeral: true, components: [] });


        let track = queue.currentTrack;
        const timestamp = queue.node.getTimestamp();
        const trackDuration = timestamp.progress == 'Forever' ? 'Endless (Live)' : track.duration;
        let description = `Author : **${track.author}**\nDuration **${trackDuration}**`;

        switch (int.customId) {
            case 'Save Song': {
                int.member.send({ embeds: [embed.Embed_save(track.title, track.url, track.thumbnail, description)] })
                    .then(() => {
                        return int.reply({ content: `✅ Şarkı özel mesaja gönderildi.`, ephemeral: true, components: [] });
                    })
                    .catch(error => {
                        console.log('error: ' + error);
                        return int.reply({ content: `❌ Özel mesaja mesaj gönderilemiyor`, ephemeral: true, components: [] });
                    });
            } break;

            case 'Playing-PlayPause': {
                let playing = !queue.node.isPaused();

                if (playing) queue.node.pause();
                else queue.node.resume();

                const playPauseButton = new ButtonBuilder().setCustomId('Playing-PlayPause').setEmoji(playing ? button.play : button.pause).setStyle(playing ? ButtonStyle.Success : ButtonStyle.Secondary);
                const skipButton = new ButtonBuilder().setCustomId('Playing-Skip').setEmoji(button.skip).setStyle(ButtonStyle.Secondary);
                const stopButton = new ButtonBuilder().setCustomId('Playing-Stop').setEmoji(button.stop).setStyle(ButtonStyle.Danger);
                const loopButton = new ButtonBuilder().setCustomId('Playing-Loop').setEmoji(button.loop).setStyle(ButtonStyle.Secondary);
                const shuffleButton = new ButtonBuilder().setCustomId('Playing-Shuffle').setEmoji(button.shuffle).setStyle(ButtonStyle.Secondary);
                //const row = new ActionRowBuilder().addComponents(playPauseButton, skipButton, stopButton, loopButton, shuffleButton);

                //await int.update({ components: [row] });
            } break;

            case 'Playing-Skip': {

                if (queue.repeatMode === 1) {
                    queue.setRepeatMode(0);
                    queue.node.skip();
                    await wait(500);
                    queue.setRepeatMode(1);
                }
                else {
                    queue.node.skip();
                    await wait(500);
                }

                let playing = queue.node.isPaused();
                track = queue.currentTrack;

                const playPauseButton = new ButtonBuilder().setCustomId('Playing-PlayPause').setEmoji(playing ? button.play : button.pause).setStyle(playing ? ButtonStyle.Success : ButtonStyle.Secondary);
                const skipButton = new ButtonBuilder().setCustomId('Playing-Skip').setEmoji(button.skip).setStyle(ButtonStyle.Secondary);
                const stopButton = new ButtonBuilder().setCustomId('Playing-Stop').setEmoji(button.stop).setStyle(ButtonStyle.Danger);
                const loopButton = new ButtonBuilder().setCustomId('Playing-Loop').setEmoji(button.loop).setStyle(ButtonStyle.Secondary);
                const shuffleButton = new ButtonBuilder().setCustomId('Playing-Shuffle').setEmoji(button.shuffle).setStyle(ButtonStyle.Secondary);
                //const row = new ActionRowBuilder().addComponents(playPauseButton, skipButton, stopButton, loopButton, shuffleButton);

                //await int.update({ components: [row] });
            } break;

            case 'Playing-Loop': {
                const methods = ['Off', 'Single', 'All', 'Autoplay'];
                let mode = 0;

                const select = new StringSelectMenuBuilder()
                    .setCustomId("Playing-Loop Select")
                    .setPlaceholder("Tekrarlama modunu seçin.")
                    .setOptions(methods.map(x => {
                        return {
                            label: x,
                            description: x,
                            value: x
                        }
                    }))

                const row = new ActionRowBuilder().addComponents(select);
                let msg = await int.reply({ content: `Tekrarlama modunu seçin.`, ephemeral: true, components: [row] });

                const collector = msg.createMessageComponentCollector({
                    time: 20000, // 20s
                    filter: i => i.user.id === int.user.id
                });

                collector.on("collect", async i => {
                    if (i.customId != "Playing-Loop Select") return;

                    switch (i.values[0]) {
                        case 'Off':
                            mode = 0;
                            break;
                        case 'Single':
                            mode = 1;
                            break;
                        case 'All':
                            mode = 2;
                            break;
                        case 'Autoplay':
                            mode = 3;
                            break;
                    }
                    queue.setRepeatMode(mode);

                    await i.deferUpdate();
                    await int.editReply({ content: `✅ Tekrarlama modunu şu şekilde değiştirin: \`${methods[mode]}\`.`, ephemeral: true, components: [] });


                    let playing = queue.node.isPaused();
                    track = queue.currentTrack;

                    const playPauseButton = new ButtonBuilder().setCustomId('Playing-PlayPause').setEmoji(playing ? button.play : button.pause).setStyle(playing ? ButtonStyle.Success : ButtonStyle.Secondary);
                    const skipButton = new ButtonBuilder().setCustomId('Playing-Skip').setEmoji(button.skip).setStyle(ButtonStyle.Secondary);
                    const stopButton = new ButtonBuilder().setCustomId('Playing-Stop').setEmoji(button.stop).setStyle(ButtonStyle.Danger);
                    const loopButton = new ButtonBuilder().setCustomId('Playing-Loop').setEmoji(button.loop).setStyle(ButtonStyle.Secondary);
                    const shuffleButton = new ButtonBuilder().setCustomId('Playing-Shuffle').setEmoji(button.shuffle).setStyle(ButtonStyle.Secondary);
                    //const row = new ActionRowBuilder().addComponents(playPauseButton, skipButton, stopButton, loopButton, shuffleButton);

                    return await queue.dashboard.edit({ embeds: [embed.Embed_dashboard('Dashboard', track.title, track.url, track.thumbnail, settings(queue))]/*, components: [row] */});
                });

                collector.on("end", (collected, reason) => {
                    if (reason == "time" && collected.size == 0) {
                        if (!queue?.deleted && !queue.isPlaying()) queue?.delete();
                        return int.editReply({ content: "❌ Süre doldu.", ephemeral: true, components: [] });
                    }
                });
            } break;

            case 'Playing-Stop': {
                if (!queue.deleted)
                    queue.delete();

                await int.reply({ content: '✅ Bot sohbet odasından ayrıldı.', ephemeral: true, components: [] });
            } break;

            case 'Playing-Shuffle': {
                queue.tracks.shuffle();
                await int.reply({ content: '✅ Sıradaki şarkılar artık rastgele sıralanıyor.', ephemeral: true, components: [] });
            } break;
        }
    }
    else {
        if (!int.isCommand() || !int.inGuild() || int.member.user.bot) return;


        const cmd = client.commands.get(int.commandName);

        if (cmd && cmd.voiceChannel) {
            if (!int.member.voice.channel)
                return int.reply({ content: `❌ Sohbet odasına bağlı değilsin.`, allowedMentions: { repliedUser: false } });

            if (int.guild.members.me.voice.channel && int.member.voice.channelId !== int.guild.members.me.voice.channelId)
                return int.reply({ content: `❌ Bot ile aynı sohbet odasında değilsin.`, allowedMentions: { repliedUser: false } });
        }

        if (cmd) {
            console.log(`(${color.grey}${int.member.guild.name}${color.white}) ${int.user.username} : /${int.commandName}`);
            cmd.slashExecute(client, int);
        }
    }
};