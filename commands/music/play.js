const { EmbedBuilder, SlashCommandBuilder, MessageFlags, Embed } = require('discord.js');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const pathToFfmpeg = require('ffmpeg-static')
const { spawn } = require("child_process");

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
            console.time("yt-dlp spawn");
            const yt = spawn(interaction.client.ytdl_path, [
                "-f", "ba",
                "-o", "-",
                "--ffmpeg-location", pathToFfmpeg,
                "-4",
                // "--extractor-args", "youtube:player_client=android",
                "--no-playlist",
                "--no-warnings",
                "--quiet",
                // "--js-runtimes", `node:${process.execPath}`,
                query
            ]);
            yt.stdout.once("data", () => {
                console.timeEnd("yt-dlp spawn");
            });

            interaction.client.yt = yt;

            yt.stderr.on("data", d => console.log(d.toString()));

            const resource = createAudioResource(yt.stdout, {
                inputType: StreamType.WebmOpus
            });
            
            interaction.client.player.play(resource);
        }
        else
        {
            interaction.client.queue.push(query);
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