require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  client.user.setPresence({
    activities: [{ name: 'Moderating with care 🌸 | 2', type: ActivityType.Playing }],
    status: 'dnd'
  });
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === '!ping') {
    message.reply('Pong! 🛡️');
  }
});

client.login(process.env.DISCORD_TOKEN);
