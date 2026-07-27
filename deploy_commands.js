import "dotenv/config";
import { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

const commands = [

new SlashCommandBuilder()
.setName("البنق")
.setDescription("يعرض سرعة البوت"),

new SlashCommandBuilder()
.setName("مسح")
.setDescription("حذف الرسائل")
.addIntegerOption(option =>
option
.setName("العدد")
.setDescription("عدد الرسائل")
.setRequired(true)
)
.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

new SlashCommandBuilder()
.setName("حظر")
.setDescription("حظر عضو")
.addUserOption(option =>
option
.setName("العضو")
.setDescription("اختر العضو")
.setRequired(true)
)
.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

new SlashCommandBuilder()
.setName("طرد")
.setDescription("طرد عضو")
.addUserOption(option =>
option
.setName("العضو")
.setDescription("اختر العضو")
.setRequired(true)
)
.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

new SlashCommandBuilder()
.setName("قفل")
.setDescription("قفل الروم")
.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

new SlashCommandBuilder()
.setName("فتح")
.setDescription("فتح الروم")
.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)

].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
try {
await rest.put(
Routes.applicationCommands(process.env.CLIENT_ID),
{ body: commands }
);

console.log("✅ تم تسجيل جميع الأوامر");
} catch (err) {
console.error(err);
}
})();