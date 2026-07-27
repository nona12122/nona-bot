import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ChannelType,
  PermissionFlagsBits,
  Events
} from "discord.js";

import { joinVoiceChannel } from '@discordjs/voice';
import fs from "fs";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const GUILD_ID = "1356618086635016292";
const VOICE_CHANNEL_ID = "1372931441821880382";
const RULES_CHANNEL = "1356618087448838186";
const BOOST_CHANNEL = "1530166492530868234";

const ADMIN_ROLE = "1531257074321981491";
const PROTECTION_ROLE = "1530179158494150779";
const LINK_ROLE = "1531256998065340621";
const TICKET_CHANNEL = "1395770753462308944";
const TICKET_CATEGORY = "1458644428162990263";
const TICKET_ADMIN_ROLE = "1473678075987230772";

const ticketTypes = {
  rank: {
    name: "🏅 تقديم رتبة",
    channel: "rank"
  },
  clan: {
    name: "🎮 تقديم للكلان",
    channel: "clan"
  },
  report: {
    name: "⚠️ الشكاوى",
    channel: "report"
  },
  management: {
    name: "👑 الإدارة",
    channel: "management"
  },
  question: {
    name: "❓ الاستفسارات",
    channel: "question"
  }
};

const spamMap = new Map();

client.once("ready", async () => {

  console.log(`Logged in as ${client.user.tag}`);

  const guild = client.guilds.cache.get(GUILD_ID);

  if (!guild) return;

  const channel = guild.channels.cache.get(VOICE_CHANNEL_ID);

  if (!channel) return;

  joinVoiceChannel({
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfMute: true,
    selfDeaf: false
  });

  console.log("✅ Joined Voice Channel");

  const ticketChannel = guild.channels.cache.get(TICKET_CHANNEL);

  if (ticketChannel) {

    const button = new ButtonBuilder()
      .setCustomId("open_ticket")
      .setLabel("🎫 فتح تذكرة")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await ticketChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#b388ff")
          .setTitle("🎫 نظام التذاكر")
          .setDescription("اضغط على الزر بالأسفل لفتح تذكرة.")
      ],
      components: [row]
    });

  }

});
// ==========================
// Message Create
// ==========================

client.on("messageCreate", async (msg) => {

  if (msg.author.bot || !msg.guild) return;

  const t = msg.content.trim();

  console.log("Message Event:", msg.id, msg.content);

  // رسالة نونا
  if (t === "نونا") {
  await msg.channel.send("<@744348080865935491>\n\nمتـل حـكايـات الخيـال، لـكن انتي حقيـقه💎");
  return await msg.channel.send(
    "https://i.imgur.com/h4YiTP8.gif"
  );
}

  // قوانين الإدارة
  if (
    t === "قوانين" &&
    msg.channel.id === RULES_CHANNEL &&
    msg.member.roles.cache.has(ADMIN_ROLE)
  ) {

    const embed = new EmbedBuilder()
      .setColor("#b388ff")
      .setTitle("📜 قوانين سيرفر Nona Gaming")
      .setDescription(`
⚜️ احترام جميع الأعضاء والإدارة.

⚜️ يمنع السب أو الإهانة أو التنمر.

⚜️ يمنع السبام أو الإزعاج.

⚜️ يمنع نشر الروابط أو الإعلانات.

⚜️ يمنع المحتوى المخالف.

⚜️ يمنع انتحال الشخصية.

⚜️ الالتزام بتعليمات الإدارة.

💜 نتمنى لكم وقتًا ممتعًا.
`)
      .setImage("https://cdn.discordapp.com/attachments/1524872875419631797/1530176388517204131/7F737853-220F-47DD-9798-221E53AD9C06.gif")
      .setFooter({ text: "Nona Gaming" })
      .setTimestamp();

    return msg.channel.send({ embeds: [embed] });
  }

 // استثناء الإدارة والحماية
if (
  msg.member.roles.cache.has(ADMIN_ROLE) ||
  msg.member.roles.cache.has(LINK_ROLE)
) return;

// Anti Link
const regex = /(https?:\/\/|discord\.gg|www\.)/i;

if (regex.test(msg.content)) {
  await msg.delete().catch(() => {});

  await msg.channel.send({
    content: `🚫 ${msg.author} يمنع إرسال الروابط داخل السيرفر.`
  });

  return msg.member.timeout(
    5 * 60 * 1000,
    "Links Protection"
  ).catch(() => {});
}

  // Anti Spam
  const id = msg.author.id;
  const now = Date.now();

  if (!spamMap.has(id))
    spamMap.set(id, []);

  const data = spamMap.get(id);

  while (data.length && now - data[0] > 5000)
    data.shift();

  data.push(now);
if (msg.member.roles.cache.has(PROTECTION_ROLE)) return;
  if (data.length >= 5) {

    spamMap.delete(id);

    await msg.member.timeout(
      10 * 60 * 1000,
      "Spam Protection"
    ).catch(() => {});

    const log = msg.guild.channels.cache.get(RULES_CHANNEL);

    if (log) {
      await log.send(
        `🚨 | تم إعطاء ${msg.member} Timeout لمدة 10 دقائق بسبب السبام.`
      );
    }

  }

});
// ==========================
// Boost Message
// ==========================

client.on("guildMemberUpdate", async (oldMember, newMember) => {

  if (!oldMember.premiumSince && newMember.premiumSince) {

    const channel = newMember.guild.channels.cache.get(BOOST_CHANNEL);

    if (!channel) return;

    await channel.send({
      content: `╭・💎・شكراً على الدعم
│
│ 👑 ${newMember}
│ شكراً لك على دعمك لسيرفر Nona Gaming.
│ وجودك ودعمك يعني لنا الكثير. 💜
│
╰・⚜️ استمتع بمميزات الداعم.`,
    files: ["./boost.gif"]
    });

  }

});

// ==========================
// Ticket System
// ==========================

client.on("interactionCreate", async (interaction) => {

  if (interaction.isButton()) {

    if (interaction.customId === "open_ticket") {

      const menu = new StringSelectMenuBuilder()
        .setCustomId("ticket_menu")
        .setPlaceholder("اختر نوع التذكرة")
        .addOptions([
          { label: "🏅 تقديم رتبة", value: "rank" },
          { label: "🎮 تقديم للكلان", value: "clan" },
          { label: "⚠️ الشكاوى", value: "report" },
          { label: "👑 الإدارة", value: "management" },
          { label: "❓ الاستفسارات", value: "question" }
        ]);

      return interaction.reply({
        content: "اختر نوع التذكرة:",
        components: [new ActionRowBuilder().addComponents(menu)],
        ephemeral: true
      });

    }
if (interaction.customId === "close_ticket") {

  await interaction.reply({
  content: "🔒 سيتم حذف التذكرة بعد 5 ثوانٍ...",
  ephemeral: true
});

const channel = interaction.channel;

setTimeout(async () => {
  if (!channel) return;

  await channel.delete().catch(console.error);
}, 5000);
  return;
}
  }

  if (interaction.isStringSelectMenu()) {

    if (interaction.customId !== "ticket_menu") return;

    const type = ticketTypes[interaction.values[0]];
// منع فتح أكثر من تذكرة
const existingTicket = interaction.guild.channels.cache.find(ch =>
  ch.parentId === TICKET_CATEGORY &&
  ch.topic === interaction.user.id
);

if (existingTicket) {
  return interaction.reply({
    content: `❌ لديك تذكرة مفتوحة بالفعل: ${existingTicket}`,
    ephemeral: true
  });
}
    const channel = await interaction.guild.channels.create({
      name: `${type.channel}-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: TICKET_CATEGORY,
topic: interaction.user.id,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages
          ]
        },
        {
          id: TICKET_ADMIN_ROLE,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages
          ]
        }
      ]
    });
let ticketMessage = "";

switch (interaction.values[0]) {
  case "rank":
    ticketMessage = `
## 🏅 تقديم رتبة

مرحبًا ${interaction.user} 💜

يرجى تعبئة النموذج التالي:

👤 **الاسم:**
🎂 **العمر:**
🌍 **الدولة:**
🎮 **الخبرة بالإدارة:**
⭐ **الرتبة المطلوبة:**
⏰ **عدد ساعات التواجد:**
📝 **لماذا ترى نفسك مناسبًا؟**

⚠️ يرجى انتظار الإدارة وعدم منشنها أكثر من مرة.
`;
    break;

  case "clan":
    ticketMessage = `
## 🎮 تقديم للكلان

مرحبًا ${interaction.user} 💜

يرجى تعبئة البيانات التالية:

🎮 **اسم PUBG:**
🆔 **ID:**
🏆 **الرانك:**
🎯 **KD:**
📱 **نوع الجهاز:**
🎙️ **هل لديك مايك؟**
⏰ **عدد ساعات اللعب يوميًا:**
`;
    break;

  case "report":
    ticketMessage = `
## 🚨 تقديم شكوى

مرحبًا ${interaction.user}

يرجى إرسال:

👤 **اسم الشخص:**
📄 **سبب الشكوى:**
📷 **الأدلة:**
📅 **وقت الحادثة:**

⚠️ الشكاوى بدون دليل قد يتم رفضها.
`;
    break;

  case "management":
    ticketMessage = `
## 👑 الإدارة

مرحبًا ${interaction.user} 💜

اكتب طلبك بالتفصيل، وسيتم الرد عليك من قبل الإدارة في أقرب وقت.

⚠️ يرجى عدم تكرار المنشن.
`;
    break;

  case "question":
    ticketMessage = `
## ❓ الاستفسارات

مرحبًا ${interaction.user} 💜

اكتب استفسارك بشكل واضح، وسيقوم أحد أعضاء الإدارة بالرد عليك بأقرب وقت.
`;
    break;
}
const closeButton = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("close_ticket")
    .setLabel("🔒 إغلاق التذكرة")
    .setStyle(ButtonStyle.Danger)
);
   await channel.send({
  content: `<@&${TICKET_ADMIN_ROLE}>`,
  embeds: [
    new EmbedBuilder()
      .setColor("#b388ff")
      .setTitle(`🎫 ${type.name}`)
      .setDescription(ticketMessage)
      .setFooter({ text: "Nona Gaming" })
      .setTimestamp()
  ],
  components: [closeButton]
});

    await interaction.update({
      content: `✅ تم إنشاء التذكرة: ${channel}`,
      components: []
    });

  }

});

client.on(Events.GuildMemberAdd, async (member) => {
  console.log("🔥 عضو جديد دخل:", member.user.tag);
  const channel = member.guild.channels.cache.get("1356618087448838186");

  if (!channel) return;

 await channel.send({
  content: `# 🌸 أهلاً ${member}

💛 نورت سيرفر نونا.

نتمنى لك إقامة سعيدة،
واستمتع بوقتك بيننا! ✨`,
 files: ["./commands/welcom.gif"]
});
});
client.login(process.env.TOKEN);