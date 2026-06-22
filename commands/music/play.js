const { EmbedBuilder, SlashCommandBuilder, MessageFlags, Embed } = require('discord.js');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');
const { YtDlp } = require('ytdlp-nodejs')
const pathToFfmpeg = require('ffmpeg-static')

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
            let resource = createAudioResource(interaction.client.ytdlp.stream(query)
                //.type("opus")
                .filter("audioonly")
                .on('progress', (p) => console.log(p.percentage_str))
                .toBuffer());
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