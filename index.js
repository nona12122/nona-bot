import 'dotenv/config';
import {Client,GatewayIntentBits} from 'discord.js';
const client=new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent]});

const replies = {
  "نونا": "<:C1_:1510998417428582472>     أثري في الغياب يفوق حضور الكثيرين     <:5f319c37b0704b398aef627fbdfee90f:1471948383747834070>\n\nhttps://i.imgur.com/h4YiTP8.gif",
  "قوانين": "https://example.com/rules.png"
};

client.on("messageCreate",msg=>{
 if(msg.author.bot) return;
 const t=msg.content.trim();
 if(replies[t]) msg.channel.send(replies[t]);
});
client.login(process.env.TOKEN);
