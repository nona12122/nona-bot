import 'dotenv/config';
import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
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

 if (
  t === "قوانين" &&
  msg.channel.id === "1356618087448838186" &&
  msg.member.roles.cache.has("1530170505070645369")
) {

    const embed = new EmbedBuilder()
      .setColor("#b388ff")
      .setTitle("📜 قوانين سيرفر Nona Gaming")
      .setDescription(`
⚜️ احترام جميع الأعضاء والإدارة.

⚜️ يمنع السب أو الإهانة أو التنمر.

⚜️ يمنع السبام أو الإزعاج.

⚜️ يمنع نشر الروابط أو الإعلانات بدون إذن.

⚜️ يمنع المحتوى المخالف.

⚜️ يمنع انتحال شخصية أي عضو أو إداري.

⚜️ الالتزام بتعليمات الإدارة.

💜 نتمنى لكم وقتًا ممتعًا في السيرفر.
      `)
      .setImage("https://cdn.discordapp.com/attachments/1524872875419631797/1530176388517204131/7F737853-220F-47DD-9798-221E53AD9C06.gif")
      .setFooter({ text: "Nona Gaming" })
      .setTimestamp();

    await msg.channel.send({ embeds: [embed] });
  }
});

client.on("guildMemberUpdate", async (oldMember, newMember) => {
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
// ==========================
// Anti Spam Protection
// ==========================

const spamMap = new Map();

client.on("messageCreate", async (msg) => {
  if (msg.author.bot || !msg.guild) return;

  // استثناء الإدارة
  if (msg.member.roles.cache.has("1530170505070645369")) return;

  // استثناء رتبة Protection
  if (msg.member.roles.cache.has("1530179158494150779")) return;

  const userId = msg.author.id;
  const now = Date.now();

  if (!spamMap.has(userId)) {
    spamMap.set(userId, []);
  }

  const timestamps = spamMap.get(userId);

  // حذف الرسائل الأقدم من 5 ثواني
  while (timestamps.length && now - timestamps[0] > 5000) {
    timestamps.shift();
  }

  timestamps.push(now);

  // 8 رسائل خلال 5 ثواني
 if (timestamps.length >= 5) {

    spamMap.delete(userId);

    try {
      await msg.member.timeout(
        10 * 60 * 1000,
        "Spam Protection"
      );

      const logChannel = msg.guild.channels.cache.get("1356618087448838186");

      if (logChannel) {
        await logChannel.send(
          `🚨 | تم إعطاء ${msg.member} Timeout لمدة **10 دقائق** بسبب السبام.`
        );
      }

    } catch (err) {
      console.error(err);
    }
  }
});
client.login(process.env.TOKEN);
