const { EmbedBuilder, SlashCommandBuilder, MessageFlags, Embed } = require('discord.js');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const pathToFfmpeg = require('ffmpeg-static')
const { spawn } = require("child_process");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Para de tocar.'),

    async execute(interaction)
    {
        await interaction.deferReply();

        if(interaction.client.queue.length > 0)
        {
            interaction.client.yt.kill();
            interaction.client.queue = [];
        }
        
        // [${info.title}](${query})
        await interaction.editReply({ content: `Fila limpa.`/*, flags: MessageFlags.Ephemeral*/});
    }
}