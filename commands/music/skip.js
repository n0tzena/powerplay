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
        
        interaction.client.player.stop();
        
        // [${info.title}](${query})
        await interaction.editReply({ content: `Pulando música...`/*, flags: MessageFlags.Ephemeral*/});
    }
}