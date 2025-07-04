const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();

// Load command files
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'Verification System' }],
    status: 'online',
  });
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      if (!interaction.replied) await interaction.reply({ content: 'Error running command.', ephemeral: true });
    }
  } else if (interaction.isButton()) {
    const command = client.commands.get('verification-setup');
    if (command && command.handleButton) {
      try {
        await command.handleButton(interaction);
      } catch (err) {
        console.error(err);
        if (!interaction.replied) await interaction.reply({ content: 'Error handling button.', ephemeral: true });
      }
    }
  }
});
// index.js — Anna the Guardian Discord Bot
require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const prefix = "!";

client.once("ready", () => {
  console.log(`✅ Anna the Guardian is online as ${client.user.tag}`);
  client.user.setPresence({
    status: "online",
    activities: [{ name: "your server 👀", type: 3 }], // Watching
  });
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Ping
  if (command === "ping") {
    return message.reply(`🏓 Pong! Latency: ${Date.now() - message.createdTimestamp}ms`);
  }

  // Hello
  if (command === "hello") {
    return message.reply(`Hello ${message.author.username}. How are you?`);
  }

  // Userinfo
  if (command === "userinfo") {
    const embed = new EmbedBuilder()
      .setTitle("User Information")
      .setColor("Blue")
      .setThumbnail(message.author.displayAvatarURL())
      .addFields(
        { name: "Username", value: message.author.tag },
        { name: "ID", value: message.author.id },
        { name: "Created At", value: `<t:${Math.floor(message.author.createdTimestamp / 1000)}>` }
      );
    return message.reply({ embeds: [embed] });
  }

  // Kick
  if (command === "kick") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply("❌ You don't have permission to kick members.");
    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention a member to kick.");
    await member.kick();
    return message.reply(`✅ Kicked ${member.user.tag}`);
  }

  // Ban
  if (command === "ban") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("❌ You don't have permission to ban members.");
    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention a member to ban.");
    await member.ban();
    return message.reply(`✅ Banned ${member.user.tag}`);
  }

  // Timeout
  if (command === "timeout") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply("❌ You don't have permission to timeout members.");
    const member = message.mentions.members.first();
    const duration = args[1];
    if (!member || !duration) return message.reply("Usage: `!timeout @user <ms>`");
    await member.timeout(parseInt(duration));
    return message.reply(`✅ Timed out ${member.user.tag} for ${duration}ms`);
  }

  // Purge
  if (command === "purge") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return message.reply("❌ You don't have permission to delete messages.");
    const count = parseInt(args[0]);
    if (!count || count < 1 || count > 100) return message.reply("Enter a number between 1 and 100.");
    await message.channel.bulkDelete(count, true);
    return message.channel.send(`✅ Deleted ${count} messages.`);
  }

  // Reaction Role
  if (command === "reactionrole") {
    const roleName = args.join(" ");
    const role = message.guild.roles.cache.find((r) => r.name === roleName);
    if (!role) return message.reply("Role not found.");
    const reactionMessage = await message.channel.send(`React ✅ to get the **${role.name}** role!`);
    await reactionMessage.react("✅");

    const filter = (reaction, user) => reaction.emoji.name === "✅" && !user.bot;
    const collector = reactionMessage.createReactionCollector({ filter, dispose: true });

    collector.on("collect", (reaction, user) => {
      const member = message.guild.members.cache.get(user.id);
      member.roles.add(role).catch(console.error);
    });

    collector.on("remove", (reaction, user) => {
      const member = message.guild.members.cache.get(user.id);
      member.roles.remove(role).catch(console.error);
    });
  }
});


client.login(process.env.DISCORD_TOKEN);
