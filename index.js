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
import { joinVoiceChannel } from "@discordjs/voice";
import { db, initDatabase } from "./database.js";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
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
    name: ":medal: تقديم للاداره",
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
const voiceJoin = new Map();
async function ensureUser(userId) {
  await db.query(
    `INSERT INTO stats (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
}
client.once("ready", async () => {

  console.log(`Logged in as ${client.user.tag}`);
await initDatabase();
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
    if (!msg.inGuild()) return;
    if (!msg.member) return;
    if (msg.author.bot) return;

    // -------------------------
    // فاصل روم الخواطر
    // -------------------------

if (
  msg.member &&
  msg.channel.id === "1531895771656359996" &&
  msg.member.roles.cache.has("1532396497818091640")
) {
  await msg.channel.send({
    files: ["./images/خواطر.png"]
  });
}
  const t = msg.content.trim();
  if (t === "ليدر") {
  await msg.channel.send({
    content: `<@997261412881662064>

ليشهد التاريخ أننا لم نعش سعداء .... بل عشنا رجال🖤`,
    files: [
      "./assets/تومااس شلبي.mp4"
    ]
  });

  return;
}
// ==========================
// عداد الرسائل
// ==========================

await ensureUser(msg.author.id);

await db.query(
  `UPDATE stats
   SET messages = messages + 1
   WHERE user_id = $1`,
  [msg.author.id]
);
  console.log("Message Event:", msg.id, msg.content);
  const adminCommands = [
  "تسكير",
  "فتح",
  "مسح",
  "حظر",
  "طرد",
  "كتم",
  "فك",
  "تحذير",
  "إعلان",
  "رول",
  "سحبرول"
];

if (
  adminCommands.some(cmd => t.startsWith(cmd)) &&
  !msg.member.roles.cache.has(ADMIN_ROLE)
) {
  return msg.reply("❌ هذا الأمر للإدارة فقط.");
}
// ==========================
// أوامر الإدارة
// ==========================

// تسكير
if (t === "تسكير") {
    console.log(msg.channel.permissionOverwrites.cache.map(x => x.id));

    await msg.channel.permissionOverwrites.edit(
        msg.guild.id,
        {
            SendMessages: false
        }
    );

    return msg.reply("تم");
}
// فتح
if (t === "فتح") {
  

  await msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone, {
    SendMessages: true,
  });

  return msg.reply("🔓 تم فتح الروم.");
}

// مسح
if (t.startsWith("مسح ")) {

   

    const amount = parseInt(t.split(" ")[1]);

    if (isNaN(amount) || amount < 1 || amount > 100)
        return msg.reply("استخدم: مسح 10");

    await msg.delete().catch(() => {}); // حذف رسالة الأمر

    const deleted = await msg.channel.bulkDelete(amount, true);

    const m = await msg.channel.send(`✅ تم حذف ${deleted.size} رسالة.`);
    setTimeout(() => m.delete().catch(() => {}), 2000);
}
if (t.startsWith("حظر ")) {

    if (!msg.member.roles.cache.has(ADMIN_ROLE))
        return msg.reply("❌ هذا الأمر للإدارة فقط.");

    const member = msg.mentions.members.first();

    if (!member)
        return msg.reply("استخدم: حظر @العضو");

    if (!member.bannable)
        return msg.reply("❌ لا أستطيع حظر هذا العضو.");

    await member.ban({ reason: `تم الحظر بواسطة ${msg.author.tag}` });

    return msg.reply(`✅ تم حظر ${member.user.tag}`);
}
if (t.startsWith("طرد ")) {

    if (!msg.member.roles.cache.has(ADMIN_ROLE))
        return msg.reply("❌ هذا الأمر للإدارة فقط.");

    const member = msg.mentions.members.first();

    if (!member)
        return msg.reply("استخدم: طرد @العضو");

    if (!member.kickable)
        return msg.reply("❌ لا أستطيع طرد هذا العضو.");

    await member.kick(`تم الطرد بواسطة ${msg.author.tag}`);

    return msg.reply(`✅ تم طرد ${member.user.tag}`);
}
if (t.startsWith("كتم ")) {

    if (!msg.member.roles.cache.has(ADMIN_ROLE))
        return msg.reply("❌ هذا الأمر للإدارة فقط.");

    const member = msg.mentions.members.first();

    if (!member)
        return msg.reply("استخدم: كتم @العضو");

    if (!member.moderatable)
        return msg.reply("❌ لا أستطيع كتم هذا العضو.");

    await member.timeout(10 * 60 * 1000, `تم الكتم بواسطة ${msg.author.tag}`);

    return msg.reply(`🔇 تم كتم ${member.user.tag} لمدة 10 دقائق.`);
}
if (t.startsWith("فككتم ")) {

    if (!msg.member.roles.cache.has(ADMIN_ROLE))
        return msg.reply("❌ هذا الأمر للإدارة فقط.");

    const member = msg.mentions.members.first();

    if (!member)
        return msg.reply("استخدم: فككتم @العضو");

    if (!member.moderatable)
        return msg.reply("❌ لا أستطيع فك كتم هذا العضو.");

    await member.timeout(null, `تم فك الكتم بواسطة ${msg.author.tag}`);

    return msg.reply(`🔊 تم فك كتم ${member.user.tag}`);
}
if (t.startsWith("تحذير ")) {

    if (!msg.member.roles.cache.has(ADMIN_ROLE))
        return msg.reply("❌ هذا الأمر للإدارة فقط.");

    const member = msg.mentions.members.first();

    if (!member)
        return msg.reply("استخدم: تحذير @العضو السبب");

    const args = t.split(" ");
    args.shift(); // تحذير
    args.shift(); // المنشن

    const reason = args.join(" ") || "بدون سبب";

    return msg.channel.send(
        `⚠️ ${member}\nتم إعطاؤك تحذيراً.\n**السبب:** ${reason}`
    );
}
if (t.startsWith("رول ")) {

    if (!msg.member.roles.cache.has(ADMIN_ROLE))
        return msg.reply("❌ هذا الأمر للإدارة فقط.");

    const member = msg.mentions.members.first();
    const role = msg.mentions.roles.first();

    if (!member || !role)
        return msg.reply("استخدم: رول @العضو @الرتبة");

    if (member.roles.cache.has(role.id))
        return msg.reply("❌ العضو يملك هذه الرتبة بالفعل.");

    try {
        await member.roles.add(role);
        return msg.reply(`✅ تم إعطاء ${member.user.tag} رتبة ${role.name}`);
    } catch {
        return msg.reply("❌ لم أستطع إعطاء الرتبة.");
    }
}
if (t.startsWith("سحبرول ")) {

    if (!msg.member.roles.cache.has(ADMIN_ROLE))
        return msg.reply("❌ هذا الأمر للإدارة فقط.");

    const member = msg.mentions.members.first();
    const role = msg.mentions.roles.first();

    if (!member || !role)
        return msg.reply("استخدم: سحبرول @العضو @الرتبة");

    if (!member.roles.cache.has(role.id))
        return msg.reply("❌ العضو لا يملك هذه الرتبة.");

    try {
        await member.roles.remove(role);
        return msg.reply(`✅ تم سحب رتبة ${role.name} من ${member.user.tag}`);
    } catch {
        return msg.reply("❌ لم أستطع سحب الرتبة.");
    }
}
if (t === "توب") {
  if (!msg.member.roles.cache.has(ADMIN_ROLE)) {
    return msg.reply("❌ هذا الأمر للإدارة فقط.");
  }

  const topMessages = await db.query(`
    SELECT user_id, messages
    FROM stats
    ORDER BY messages DESC
    LIMIT 10
  `);

  const topVoice = await db.query(`
    SELECT user_id, voice
    FROM stats
    ORDER BY voice DESC
    LIMIT 10
  `);

  let text = "🏆 **توب الرسائل**\n\n";

  topMessages.rows.forEach((user, i) => {
    text += `${i + 1}. <@${user.user_id}> — ${user.messages} رسالة\n`;
  });

  text += "\n🎤 **توب الصوت**\n\n";

  topVoice.rows.forEach((user, i) => {
    text += `${i + 1}. <@${user.user_id}> — ${user.voice} دقيقة\n`;
  });

  return msg.channel.send(text);
}
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
  msg.member.roles.cache.has(ADMIN_ROLE)
) {

    const embed = new EmbedBuilder()
      .setColor("#b388ff")
      .setTitle("📜 قوانين سيرفر 𝒯𝒽𝑒 𝐿𝑜𝓈𝓉 𝒯𝑜𝓌𝓃")
      .setDescription(`
 ╔════════════════════════════╗
 📜 **قوانين 𝒯𝒽𝑒 𝐿𝑜𝓈𝓉 𝒯𝑜𝓌𝓃**
 ╚════════════════════════════╝

⚜️ **1.** الاحترام أساس السيرفر، ويمنع الإساءة أو الشتم أو التقليل من أي عضو.

⚜️ **2.** يمنع السبام بجميع أنواعه (رسائل، منشن، إيموجيات، صور).

⚜️ **3.** يمنع نشر أي روابط أو إعلانات أو دعوات لسيرفرات أخرى دون إذن.

⚜️ **4.** يمنع نشر أي محتوى مخالف أو غير لائق أو مسيء.

⚜️ **5.** يمنع انتحال شخصية أي عضو أو إداري أو استخدام أسماء وصور مضللة.

⚜️ **6.** يمنع إثارة الفتن أو المشاكل أو التحريض بين الأعضاء.

⚜️ **7.** يمنع استغلال أي ثغرة أو محاولة تخريب السيرفر بأي شكل.

⚜️ **8.** يمنع مشاركة المعلومات الشخصية لك أو لغيرك حفاظًا على الخصوصية.

⚜️ **9.** يمنع طلب الرتب أو الصلاحيات أو الإلحاح على الإدارة.

⚜️ **10.** يجب استخدام كل روم للغرض المخصص له فقط.

⚜️ **11.** يمنع النقاشات السياسية أو الدينية أو أي مواضيع تسبب الخلاف.

⚜️ **12.** يمنع استخدام برامج الغش أو التهكير أو نشرها.

⚜️ **13.** احترام قرارات الإدارة واجب، وأي اعتراض يكون عبر التذاكر أو الخاص باحترام.

⚜️ **14.** أي محاولة للتحايل على العقوبات أو استخدام حسابات بديلة قد تؤدي إلى حظر دائم.

━━━━━━━━━━━━━━━━━━━━━━

🚨 **العقوبات تعتمد على نوع المخالفة وقد تشمل:**

🟡 تحذير أول.
🟠 كتم مؤقت.
🔴 طرد من السيرفر.
⛔ حظر دائم بدون إنذار في المخالفات الجسيمة.

━━━━━━━━━━━━━━━━━━━━━━

🖤 **بدخولك السيرفر فأنت توافق على جميع القوانين أعلاه.**

✨ نتمنى لك إقامة ممتعة في **𝒯𝒽𝑒 𝐿𝑜𝓈𝓉 𝒯𝑜𝓌𝓃**.
`)
      .setImage("attachment://rules.png")
      .setFooter({ text: "𝒯𝒽𝑒 𝐿𝑜𝓈𝓉 𝒯𝑜𝓌𝓃" })
      .setTimestamp();

  return msg.channel.send({
  embeds: [embed],
  files: ["./images/rules.png"]
});
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
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "البنق") {
   await interaction.reply({
  content: `🏓 ${client.ws.ping}ms`,
  ephemeral: true
});
  }
if (interaction.commandName === "حظر") {
  const member = interaction.options.getMember("العضو");

  if (!member) {
    return interaction.reply({
      content: "❌ العضو غير موجود.",
      ephemeral: true
    });
  }

  await member.ban();

  return interaction.reply(`🔨 تم حظر ${member.user.tag}`);
}

if (interaction.commandName === "طرد") {
  const member = interaction.options.getMember("العضو");

  if (!member) {
    return interaction.reply({
      content: "❌ العضو غير موجود.",
      ephemeral: true
    });
  }

  await member.kick();

  return interaction.reply(`👢 تم طرد ${member.user.tag}`);
}

if (interaction.commandName === "قفل") {
  await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
    SendMessages: false
  });

  return interaction.reply("🔒 تم قفل الروم.");
}

if (interaction.commandName === "فتح") {
  await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
    SendMessages: true
  });

  return interaction.reply("🔓 تم فتح الروم.");
}
  if (interaction.commandName === "مسح") {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: "❌ ليس لديك صلاحية.",
        ephemeral: true
      });
    }

    const amount = interaction.options.getInteger("العدد");

    await interaction.channel.bulkDelete(amount, true);

    return interaction.reply({
      content: `✅ تم حذف ${amount} رسالة.`,
      ephemeral: true
    });
  }
});
// ==========================
// Voice Counter
// ==========================

client.on("voiceStateUpdate", async (oldState, newState) => {
    const member = newState.member || oldState.member;
    if (!member || member.user.bot) return;

    if (!oldState.channelId && newState.channelId) {
        voiceJoin.set(member.id, true);
    }

    if (oldState.channelId && !newState.channelId) {
        voiceJoin.delete(member.id);
    }
});

// كل دقيقة
setInterval(async () => {
    for (const [userId] of voiceJoin) {

        await ensureUser(userId);

        await db.query(
            `UPDATE stats
             SET voice = voice + 1
             WHERE user_id = $1`,
            [userId]
        );
    }
}, 60000);
client.login(process.env.TOKEN);