const { EmbedBuilder, SlashCommandBuilder, MessageFlags, Embed } = require('discord.js');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const pathToFfmpeg = require('ffmpeg-static')
const { spawn } = require("child_process");
const { createStream, getAudioUrl } = require("../../utilities.js")

module.exports = {
    data: new SlashCommandBuilder()
    .setName('p')
    .setDescription('Põe uma música pra tocar.')
    .addStringOption(option =>
        option.setName("query")
        .setDescription("link")
        .setRequired(true)
    ),

    async execute(interaction)
    {
        await interaction.deferReply();
        const query = interaction.options.getString('query');

        const channelId = interaction.member.voice.channel.id;
        const guildId = interaction.member.voice.guild.id;
        const adapterCreator = interaction.member.voice.guild.voiceAdapterCreator;

        // let info = await interaction.client.ytdlp.getInfoAsync(query)

        if(interaction.client.player.state.status == AudioPlayerStatus.Idle)
        {
            const urlObject = await getAudioUrl(query, interaction.client.ytdl_path);
            // console.log(`URL: ${urlObject.url}`)
            const streamObject = createStream(urlObject.url, pathToFfmpeg);

            interaction.client.current.yt = urlObject.process;
            interaction.client.current.ffmpeg = streamObject.process;

            const resource = createAudioResource(streamObject.stream, {
                inputType: StreamType.Raw
            });
            
            interaction.client.player.play(resource);
        }
        else
        {
            interaction.client.queue.push(query);
            if(!interaction.client.next?.stream)
            {
                const nextUrlObject = await getAudioUrl(interaction.client.queue.shift(), interaction.client.ytdl_path);
                // console.log(`URL: ${urlObject.url}`)
                // const nextStreamObject = createStream(nextUrlObject.url, pathToFfmpeg);

                interaction.client.next.url = nextUrlObject.url;
                nextUrlObject.process.kill("SIGKILL");
            }
        }

        const connection = joinVoiceChannel({
            channelId: channelId,
            guildId: guildId,
            adapterCreator: adapterCreator
        });

        connection.subscribe(interaction.client.player);
        
        // [${info.title}](${query})
        await interaction.editReply({ content: `Adicionado à fila: ${query}`/*, flags: MessageFlags.Ephemeral*/});
    }
}