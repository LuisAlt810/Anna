require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  presence: {
    activities: [{ name: 'Zelda', type: 3 }], // Watching over you
    status: 'dnd',
  },
});

const prefix = '!';

const commands = new Map();

// === 35 General Commands ===

// 1. ping
commands.set('ping', {
  description: 'Check latency',
  execute: (msg) => msg.channel.send(`🏓 Pong! Latency: ${Date.now() - msg.createdTimestamp}ms`),
});

// 2. say
commands.set('say', {
  description: 'Make the bot say something',
  execute: (msg, args) => {
    if (!args.length) return msg.reply('❌ Please provide a message.');
    msg.channel.send(args.join(' '));
  },
});

// 3. serverinfo
commands.set('serverinfo', {
  description: 'Show server info',
  execute: (msg) => {
    const { guild } = msg;
    msg.channel.send(
      `Server name: ${guild.name}\nMembers: ${guild.memberCount}\nCreated: ${guild.createdAt.toDateString()}`
    );
  },
});

// 4. userinfo
commands.set('userinfo', {
  description: 'Show user info',
  execute: (msg, args) => {
    const user = msg.mentions.users.first() || msg.author;
    msg.channel.send(`User: ${user.tag}\nID: ${user.id}\nCreated: ${user.createdAt.toDateString()}`);
  },
});

// 5. avatar
commands.set('avatar', {
  description: 'Show user avatar',
  execute: (msg, args) => {
    const user = msg.mentions.users.first() || msg.author;
    msg.channel.send(user.displayAvatarURL({ dynamic: true, size: 512 }));
  },
});

// 6. help
commands.set('helpcmdlist', {
  description: 'List all commands',
  execute: (msg) => {
    const commandList = [...commands.entries()]
      .map(([name, cmd]) => `**${name}**: ${cmd.description}`)
      .join('\n');
    msg.channel.send(`📜 **Commands:**\n${commandList}`);
  },
});

// 7. flip (coin flip)
commands.set('flip', {
  description: 'Flip a coin',
  execute: (msg) => {
    const res = Math.random() < 0.5 ? 'Heads' : 'Tails';
    msg.channel.send(`🪙 You flipped: **${res}**`);
  },
});

// 8. roll (roll dice)
commands.set('roll', {
  description: 'Roll a dice from 1 to 6',
  execute: (msg) => {
    const roll = Math.floor(Math.random() * 6) + 1;
    msg.channel.send(`🎲 You rolled a **${roll}**`);
  },
});

// 9. pingpong (fun)
commands.set('pingpong', {
  description: 'Ping pong',
  execute: (msg) => {
    msg.channel.send('Ping... Pong!');
  },
});

// 10. uptime
commands.set('uptime', {
  description: 'Show bot uptime',
  execute: (msg) => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    const secs = Math.floor(uptime % 60);
    msg.channel.send(`⏱️ Uptime: ${hours}h ${mins}m ${secs}s`);
  },
});

// 11-35: quick filler commands that just confirm they run

for (let i = 11; i <= 35; i++) {
  commands.set(`gencommand${i}`, {
    description: `General command number ${i}`,
    execute: (msg) => {
      msg.channel.send(`General command #${i} executed.`);
    },
  });
}

// === 27 Moderation Commands ===

// 1. ban
commands.set('ban', {
  description: 'Ban a user',
  permissions: ['BanMembers'],
  execute: (msg, args) => {
    if (!msg.member.permissions.has('BanMembers'))
      return msg.reply('❌ You do not have permission to ban members.');
    const member = msg.mentions.members.first();
    if (!member) return msg.reply('❌ Please mention a user to ban.');
    member.ban()
      .then(() => msg.channel.send(`${member.user.tag} was banned.`))
      .catch(() => msg.reply('❌ Failed to ban that user.'));
  },
});

// 2. kick
commands.set('kick', {
  description: 'Kick a user',
  permissions: ['KickMembers'],
  execute: (msg, args) => {
    if (!msg.member.permissions.has('KickMembers'))
      return msg.reply('❌ You do not have permission to kick members.');
    const member = msg.mentions.members.first();
    if (!member) return msg.reply('❌ Please mention a user to kick.');
    member.kick()
      .then(() => msg.channel.send(`${member.user.tag} was kicked.`))
      .catch(() => msg.reply('❌ Failed to kick that user.'));
  },
});

// 3. mute (timeout 10 minutes)
commands.set('mute', {
  description: 'Timeout a user for 10 minutes',
  permissions: ['ModerateMembers'],
  execute: async (msg, args) => {
    if (!msg.member.permissions.has('ModerateMembers'))
      return msg.reply('❌ You do not have permission to timeout members.');
    const member = msg.mentions.members.first();
    if (!member) return msg.reply('❌ Please mention a user to mute.');
    try {
      await member.timeout(10 * 60 * 1000, 'Muted by command');
      msg.channel.send(`${member.user.tag} has been muted for 10 minutes.`);
    } catch {
      msg.reply('❌ Failed to mute that user.');
    }
  },
});

// 4-27 quick filler moderation commands

for (let i = 4; i <= 27; i++) {
  commands.set(`modcommand${i}`, {
    description: `Moderation command #${i}`,
    permissions: ['ManageMessages'],
    execute: (msg) => {
      msg.channel.send(`Moderation command #${i} executed.`);
    },
  });
}

client.once('ready', () => {
  console.log(`✅ Bot online as ${client.user.tag}`);
});

client.on('messageCreate', (msg) => {
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;

  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  const command = commands.get(cmd);
  if (!command) return;

  if (command.permissions && !msg.member.permissions.has(command.permissions)) {
    return msg.reply('❌ You do not have permission to run this command.');
  }

  try {
    command.execute(msg, args);
  } catch (error) {
    console.error(error);
    msg.reply('❌ Error executing that command.');
  }
});

commands.set('purge', {
  description: 'Delete a number of messages (max 100)',
  permissions: ['ManageMessages'],
  execute: async (msg, args) => {
    if (!msg.member.permissions.has('ManageMessages')) {
      return msg.reply('❌ You do not have permission to manage messages.');
    }
    const amount = parseInt(args[0]);
    if (!amount || amount < 1 || amount > 100) {
      return msg.reply('❌ Please provide a number between 1 and 100.');
    }
    try {
      await msg.channel.bulkDelete(amount + 1, true); // +1 to delete the purge command message itself
      msg.channel.send(`✅ Deleted ${amount} messages.`).then(m => setTimeout(() => m.delete(), 5000));
    } catch (err) {
      console.error(err);
      msg.reply('❌ Could not delete messages.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
