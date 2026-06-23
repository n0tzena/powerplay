const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os')
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const pathToFfmpeg = require('ffmpeg-static')
const { spawn } = require("child_process");
const { createStream, getAudioUrl, stopProcess } = require("./utilities.js")
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
client.commands = new Collection(); 

console.log("platform: " + os.platform())

if (os.platform() === "win32") {
    client.ytdl_path = path.join(__dirname, "bin", "win32", "yt-dlp.exe");
}
else if (os.platform() === "linux") {
    client.ytdl_path = path.join(__dirname, "bin", "linux", "yt-dlp_linux");
}
else if (os.platform() === "darwin") {
    client.ytdl_path = path.join(__dirname, "bin", "darwin", "yt-dlp_macos");
}

console.log(client.ytdl_path);

client.player = createAudioPlayer({behaviors: {noSubscriber: NoSubscriberBehavior.Play}});
client.queue = [];
client.current = {};
client.next = {};

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		} else {
			await interaction.reply({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		}
	}
});

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.player.on(AudioPlayerStatus.Playing, () => {
    console.log("PLAYING");
});

client.player.on(AudioPlayerStatus.Buffering, () => {
    console.log("BUFFERING");
});

client.player.on(AudioPlayerStatus.Idle, () => {
    console.log("IDLE");
});

client.player.on(AudioPlayerStatus.Idle, async () => {
	stopProcess(client);
	if(client.next?.url)
	{	
		const streamObject = createStream(client.next.url, pathToFfmpeg);

		// client.next = {};
		
		const resource = createAudioResource(streamObject.stream, {
            inputType: StreamType.Raw
        });            
        client.player.play(resource);
	}
	// fallback
	else if(client.queue.length > 0)
	{

		const urlObject = await getAudioUrl(client.queue.shift(), client.ytdl_path);
        const streamObject = createStream(urlObject.url, pathToFfmpeg);

        client.current.yt = urlObject.process;
        client.current.ffmpeg = streamObject.process;

        const resource = createAudioResource(streamObject.stream, {
            inputType: StreamType.Raw
        });            
        client.player.play(resource);

	}
})
client.player.on("error", console.error);

client.login(process.env.TOKEN);