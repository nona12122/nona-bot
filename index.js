import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
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

client.login(process.env.TOKEN);
