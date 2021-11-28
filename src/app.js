const queue = new Map()
var commands = ["play", "stop", "next", "replay", "disconnect"]
var commandsDescription = [
  "Plays the song given by parameter",
  "Stops the current song",
  "Skip the next song",
  "Replays the song being played",
  "Disconnect the Muslum-bot from your discord server",
]

require("dotenv").config()

const { TOKEN, CLIENT_ID } = process.env
//var commandsFromJson=JSON.stringify(commands);
const Discord = require("discord.js")
const ytldCore = require("ytdl-core")

const client = new Discord.Client()

//ready
client.once("ready", () => {
  console.log("ready")
})

//reconnect
client.once("reconnecting", () => {
  console.log("reconnecting")
})
//disconnect
client.once("disconnect", () => {
  console.log("disconnect")
})

//EXECUTE
async function execute(message, serverQueue) {
  const args = message.content.split(" ")
  const voiceChannel = message.member.voice.channel
  if (!voiceChannel)
    return message.channel.send("You need to be in a voice channel to play music!")
  const permissions = voiceChannel.permissionsFor(message.client.user)
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    )
  }

  const songInfo = await ytldCore.getInfo(args[1])

  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  }

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 6,
      isPlaying: true,
    }

    queue.set(message.guild.id, queueContruct)

    queueContruct.songs.push(song)

    try {
      var connection = await voiceChannel.join()
    } catch (e) {
      return message.channel.send("Hata meydana geldi:")
    }
  }
}

client.on("message", async (message) => {
  const serverQueue = queue.get(message.guild.id)

  //Kutsal selamlaşma
  if (message.content === "Selam baba" || message.content === "selam baba") {
    message.channel.send("AS")
  }

  if (message.content === `${prefix}join`) {
    if (message.member.voice.channel) {
      const conn = await message.member.voice.channel.join()

      console.log("successfully connected to audio channel.", conn.getMaxListeners())
    }
  }

  if (message.content === `${prefix}disco`) {
    const voiceChannel = message.member.voice.channel

    voiceChannel.leave()
  }
  if (message.content === `${prefix}help`) {
    for (var i = 0; i < commands.length; i++) {
      message.channel.send(`Command: ${commands[i]}
     (${commandsDescription[i]})`)
    }
  }
  if (message.content.startsWith(prefix)) return

  if (message.content.startsWith(`${prefix}play`)) {
    songPlay(message, serverQueue)
    return
  } else if (message.content.startsWith(`${prefix}stop`)) {
    songStop(message, serverQueue)
    return
  } else if (message.content.startsWith(`${prefix}next`)) {
    songNext(message, serverQueue)
    message.channel.send("calling next")
    return
  } else if (message.content.startsWith(`${prefix}replay`)) {
    songReplay(message, serverQueue)
    message.channel.send("calling replay")
    return
  }
})

getMsg = (message) => console.log(message.content)

client.login(TOKEN)
