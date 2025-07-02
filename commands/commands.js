const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

const prefix = "!";

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // PING
  if (command === "ping") {
    const sent = await message.channel.send("Pinging...");
    sent.edit(`🏓 Pong! Latency is ${sent.createdTimestamp - message.createdTimestamp}ms`);
  }

  // HELLO
  else if (command === "hello") {
    message.channel.send(`👋 Hello, ${message.author.username}! How are you?`);
  }

  // KICK
  else if (command === "kick") {
    if (!message.member.permissions.has("KickMembers")) {
      return message.reply("❌ You don't have permission to kick members.");
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply("❌ Please mention a member to kick.");

    if (!member.kickable) {
      return message.reply("❌ I cannot kick this member.");
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    try {
      await member.kick(reason);
      message.channel.send(`✅ ${member.user.tag} was kicked by ${message.author.tag} for: ${reason}`);
    } catch (error) {
      console.error(error);
      message.reply("❌ Failed to kick the member.");
    }
  }

  // BAN
  else if (command === "ban") {
    if (!message.member.permissions.has("BanMembers")) {
      return message.reply("❌ You don't have permission to ban members.");
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply("❌ Please mention a member to ban.");

    if (!member.bannable) {
      return message.reply("❌ I cannot ban this member.");
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    try {
      await member.ban({ reason });
      message.channel.send(`✅ ${member.user.tag} was banned by ${message.author.tag} for: ${reason}`);
    } catch (error) {
      console.error(error);
      message.reply("❌ Failed to ban the member.");
    }
  }

  // AVATAR
  else if (command === "avatar") {
    const user = message.mentions.users.first() || message.author;
    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Avatar`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 512 }))
      .setColor("Random");
    message.channel.send({ embeds: [embed] });
  }

  // USERINFO
  else if (command === "userinfo") {
    const member = message.mentions.members.first() || message.member;
    const embed = new EmbedBuilder()
      .setTitle(`👤 User Info: ${member.user.tag}`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "ID", value: member.id, inline: true },
        { name: "Joined Server", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: "Account Created", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
      )
      .setColor("Random");
    message.channel.send({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
