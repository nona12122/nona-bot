import 'dotenv/config';
import {Client,GatewayIntentBits} from 'discord.js';
const client=new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent]});

const replies={
  "ليبا":"https://i.imgur.com/h4YiTP8.gif",
  "قوانين":"https://example.com/rules.png"
};

client.on("messageCreate",msg=>{
 if(msg.author.bot) return;
 const t=msg.content.trim();
 if(replies[t]) msg.channel.send(replies[t]);
});
client.login(process.env.TOKEN);
