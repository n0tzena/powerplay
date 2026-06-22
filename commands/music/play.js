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

        embed = new EmbedBuilder()
            .setTitle("a")

        if(interaction.client.player.state.status == AudioPlayerStatus.Idle)
        {
            console.time("yt-dlp spawn");
            const yt = spawn(interaction.client.ytdl_path, [
                "-f", "251",
                "-o", "-",
                "--ffmpeg-location", pathToFfmpeg,
                "-4",
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
            /*
            let resource = await createAudioResource(interaction.client.ytdlp.stream(query, 
                {
                    debugPrintCommandLine: true,
                    verbose: true,
                    postprocessorArgs: {ffmpeg: ["-preset", "ultrafast", "-c:a", "copy"]}
                })
                .filter("audioonly")
                .on('progress', (p) => console.log(p.percentage_str))
                .on("error", console.error)
                .on("end", () => {
                    console.log("stream terminou");
                })
                .on("close", () => {
                    console.log("stream fechou");
                }), { inputType: StreamType.WebmOpus });*/
            interaction.client.player.play(resource);
        }
        else
        {
            interaction.client.query.push(query);
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