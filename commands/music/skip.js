const { EmbedBuilder, SlashCommandBuilder, MessageFlags, Embed } = require('discord.js');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const pathToFfmpeg = require('ffmpeg-static')
const { spawn } = require("child_process");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Pula pra próxima música.'),

    async execute(interaction)
    {
        await interaction.deferReply();

        if(client.query.length > 0)
        {
            client.yt.kill()

            const yt = spawn(client.ytdl_path, [
                "-f", "ba",
                "-o", "-",
                "--ffmpeg-location", pathToFfmpeg,
                "-4",
                // "--extractor-args", "youtube:player_client=android",
                "--no-playlist",
                "--no-warnings",
                "--quiet",
                // "--js-runtimes", `node:${process.execPath}`,
                client.query.shift()
            ]);

            client.yt = yt;
            yt.stderr.on("data", d => console.log(d.toString()));

            const resource = createAudioResource(yt.stdout, {
                inputType: StreamType.WebmOpus
            });
        }
        
        // [${info.title}](${query})
        await interaction.editReply({ content: `Pulando música...`/*, flags: MessageFlags.Ephemeral*/});
    }
}