import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  const guild = client.guilds.cache.get("1356618086635016292");
  if (!guild) return;

  const channel = guild.channels.cache.get("1372931441821880382");
  if (!channel) return;

  joinVoiceChannel({
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: false,
    selfMute: true
  });

  console.log("Joined voice channel!");
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  const t = msg.content.trim();

  if (t === "نونا") {
    await msg.channel.send("أثري في الغياب يفوق حضور الكثيرين.");
    await msg.channel.send("https://i.imgur.com/h4YiTP8.gif");
  }

  if (t === "قوانين") {
    await msg.channel.send("https://example.com/rules.png");
  }
});

client.on("guildMemberUpdate", async (oldMember, newMember) => {
  // إذا العضو عمل Boost جديد
  if (!oldMember.premiumSince && newMember.premiumSince) {

    const channel = newMember.guild.channels.cache.get("1530166492530868234");
    if (!channel) return;

    await channel.send({
      content: `⚜️ شكراً على البوستر يا كبيرها ${newMember} ⚜️`,
      files: [
        "https://cdn.discordapp.com/attachments/1524872875419631797/1530165667733442611/7E3F96DC-3FCA-41D2-958F-9599ED2E9BE3.gif"
      ]
    });
  }
});

client.login(process.env.TOKEN);
