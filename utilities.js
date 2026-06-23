const { spawn } = require("child_process");

function getAudioUrl(query) {
  return new Promise((resolve, reject) => {
    const yt = spawn("yt-dlp", [
      "-f", "bestaudio",
      "-g",
      "--no-playlist",
      "--quiet",
      query
    ]);

    let out = "";

    yt.stdout.on("data", d => out += d.toString());

    yt.on("close", code => {
      if (code !== 0) return reject("yt-dlp failed");
      resolve(out.trim());
    });
  });
}

function createStream(url) {
  const ffmpeg = spawn("ffmpeg", [
    "-reconnect", "1",
    "-reconnect_streamed", "1",
    "-reconnect_delay_max", "5",
    "-loglevel", "error",
    "-vn",
    "-i", url,
    "-f", "opus",
    "-ar", "48000",
    "-ac", "2",
    "pipe:1"
  ]);

  return ffmpeg.stdout;
}

module.exports = { createStream, getAudioUrl };

