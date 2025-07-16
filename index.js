require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActivityType, REST, Routes } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
    presence: {
        activities: [{ name: 'with Anna', type: ActivityType.Watching }],
        status: 'dnd',
    },
});

const prefix = '!';
const prefixCommands = new Map();

// === Prefix ! Commands ===
// General / Fun 30
['ping', 'flip', 'roll', 'say', 'avatar', 'userinfo', 'serverinfo', 'uptime', 'help'].forEach(cmd => {
    prefixCommands.set(cmd, {
        execute: (msg, args) => {
            switch (cmd) {
                case 'ping':
                    msg.channel.send(`Pong! ${Date.now() - msg.createdTimestamp}ms`);
                    break;
                case 'flip':
                    msg.channel.send(Math.random() < 0.5 ? 'Heads' : 'Tails');
                    break;
                case 'roll':
                    msg.channel.send(`🎲 ${Math.floor(Math.random() * 6) + 1}`);
                    break;
                case 'say':
                    msg.channel.send(args.join(' ') || 'Nothing to say?');
                    break;
                case 'avatar':
                    msg.channel.send(msg.mentions.users.first()?.displayAvatarURL({ dynamic: true }) || msg.author.displayAvatarURL({ dynamic: true }));
                    break;
                case 'userinfo':
                    const user = msg.mentions.users.first() || msg.author;
                    msg.channel.send(`User: ${user.tag}\nID: ${user.id}`);
                    break;
                case 'serverinfo':
                    msg.channel.send(`Server: ${msg.guild.name}\nMembers: ${msg.guild.memberCount}`);
                    break;
                case 'uptime':
                    const uptime = Math.floor(process.uptime());
                    msg.channel.send(`Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`);
                    break;
                case 'help':
                    msg.channel.send([...prefixCommands.keys()].map(x => `!${x}`).join(', '));
                    break;
            }
        }
    });
});
for (let i = 1; i <= 21; i++) prefixCommands.set(`fun${i}`, {
    execute: (msg) => msg.channel.send(`Fun #${i}`)
});

// Moderation 25
['ban', 'kick', 'mute', 'purge'].forEach(cmd => {
    prefixCommands.set(cmd, {
        permissions: ['BanMembers', 'KickMembers', 'ModerateMembers', 'ManageMessages'],
        execute: async (msg, args) => {
            if (!msg.member.permissions.has(prefixCommands.get(cmd).permissions)) return msg.reply('No permissions.');
            const member = msg.mentions.members.first();
            if (!member && cmd !== 'purge') return msg.reply('Mention someone.');
            switch (cmd) {
                case 'ban': await member.ban(); msg.channel.send('Banned.'); break;
                case 'kick': await member.kick(); msg.channel.send('Kicked.'); break;
                case 'mute': await member.timeout(600000, 'Muted'); msg.channel.send('Muted 10m.'); break;
                case 'purge':
                    const amt = parseInt(args[0]);
                    if (!amt || amt < 1 || amt > 100) return msg.reply('1-100 only.');
                    await msg.channel.bulkDelete(amt + 1, true);
                    msg.channel.send(`Deleted ${amt}`).then(m => setTimeout(() => m.delete(), 3000));
                    break;
            }
        }
    });
});
for (let i = 1; i <= 21; i++) prefixCommands.set(`mod${i}`, {
    permissions: ['ManageMessages'],
    execute: (msg) => msg.channel.send(`Mod #${i}`)
});

// Prefix Command Handler
client.on('messageCreate', (msg) => {
    if (!msg.content.startsWith(prefix) || msg.author.bot) return;
    const [cmd, ...args] = msg.content.slice(prefix.length).trim().split(/ +/);
    const command = prefixCommands.get(cmd.toLowerCase());
    if (!command) return;
    if (command.permissions && !msg.member.permissions.has(command.permissions)) {
        return msg.reply('No permission.');
    }
    try { command.execute(msg, args); } catch { msg.reply('Error.'); }
});

// === Slash Commands ===
const rest = new REST({ version: '10' }).setToken(TOKEN);
const slashCommands = [
    { name: 'ping', description: 'Pong!' },
    { name: 'avatar', description: 'Show your avatar' },
    { name: 'roll', description: 'Roll a dice' },
    { name: 'flip', description: 'Flip coin' },
    { name: 'userinfo', description: 'User info' },
    { name: 'serverinfo', description: 'Server info' },
    { name: 'say', description: 'Bot says what you want', options: [{ name: 'text', type: 3, required: true, description: 'What to say' }] },
    { name: 'uptime', description: 'Uptime' },
    { name: 'help', description: 'List slash commands' },
];

client.once('ready', async () => {
    console.log(`${client.user.tag} ready`);
    await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), { body: slashCommands });
});

// Slash Command Handler
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    switch (interaction.commandName) {
        case 'ping': await interaction.reply('Pong!'); break;
        case 'avatar': await interaction.reply(interaction.user.displayAvatarURL({ dynamic: true })); break;
        case 'roll': await interaction.reply(`🎲 ${Math.floor(Math.random() * 6) + 1}`); break;
        case 'flip': await interaction.reply(Math.random() < 0.5 ? 'Heads' : 'Tails'); break;
        case 'userinfo': await interaction.reply(`User: ${interaction.user.tag}\nID: ${interaction.user.id}`); break;
        case 'serverinfo': await interaction.reply(`Server: ${interaction.guild.name}\nMembers: ${interaction.guild.memberCount}`); break;
        case 'say': await interaction.reply(interaction.options.getString('text')); break;
        case 'uptime': const s = Math.floor(process.uptime()); await interaction.reply(`${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`); break;
        case 'help': await interaction.reply(slashCommands.map(c => `/${c.name}`).join(', ')); break;
    }
});

client.login(TOKEN);
