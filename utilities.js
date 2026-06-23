const { spawn } = require("child_process");

function getAudioUrl(query, ytdl_path) {

    const start = Date.now();

    return new Promise((resolve, reject) => {
        const yt = spawn(ytdl_path, [
            "-f", "bestaudio[ext=webm]/bestaudio/best",
            "-g",
            "--no-playlist",
            "--quiet",
            "--no-warnings",
            "--extractor-retries", "1",
            "--fragment-retries", "1",
            "--socket-timeout", "5",
            "--retries", "1",
            "--concurrent-fragments", "1",
            "--extractor-args", "youtube:player_client=android",
            query
        ]);

        let out = "";

        yt.stdout.on("data", d => out += d.toString());

        yt.on("close", code => {
            if (code !== 0) return reject("yt-dlp failed");

            const duration = Date.now() - start;
            console.log(`🎧 yt-dlp took ${duration}ms`);

            resolve({
                url: out.trim(),
                process: yt
            });
        });
    });
}

function createStream(url, ffmpeg_path) {
  console.log("FFMPEG PATH:", ffmpeg_path);

  const ffmpeg = spawn(ffmpeg_path, [
    "-version"
  ]);

  ffmpeg.stdout.on("data", d => console.log("STDOUT:", d.toString()));
  ffmpeg.stderr.on("data", d => console.log("STDERR:", d.toString()));

  ffmpeg.on("error", err => {
    console.log("FFMPEG SPAWN ERROR:", err);
  });

  ffmpeg.on("close", code => {
    console.log("FFMPEG EXIT:", code);
  });

  return null;
}

/*function createStream(url, ffmpeg_path) {

    const start = Date.now();

    const ffmpeg = spawn(ffmpeg_path, [
        "-loglevel", "quiet",

        "-reconnect", "1",
        "-reconnect_streamed", "1",
        "-reconnect_delay_max", "2",

        "-i", url,
        "-vn",

        "-fflags", "nobuffer",
        "-flags", "low_delay",
        "-probesize", "32",
        "-analyzeduration", "0",

        "-f", "s16le",
        "-ar", "48000",
        "-ac", "2",

        "pipe:1"
    ]);

    ffmpeg.stderr.on("data", d => {
    console.log("FFMPEG:", d.toString());
    });

    let started = false;

    ffmpeg.stdout.once("data", () => {
        if (!started) {
            const duration = Date.now() - start;
            console.log(`🎵 ffmpeg started in ${duration}ms`);
            started = true;
        }
    });

    return {
        stream: ffmpeg.stdout,
        process: ffmpeg
    }
}*/

module.exports = { createStream, getAudioUrl };

