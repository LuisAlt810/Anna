const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verification-setup')
    .setDescription('Sets up verification system and locks all channels.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guild = interaction.guild;
    if (!guild) return interaction.reply({ content: 'Use this in a server.', ephemeral: true });

    let verifiedRole = guild.roles.cache.find(r => r.name === 'Verified');
    if (!verifiedRole) {
      verifiedRole = await guild.roles.create({
        name: 'Verified',
        color: 'Green',
        reason: 'Verification role',
      });
    }

    let unverifiedRole = guild.roles.cache.find(r => r.name === 'Unverified');
    if (!unverifiedRole) {
      unverifiedRole = await guild.roles.create({
        name: 'Unverified',
        color: 'Grey',
        reason: 'Unverified role',
      });
    }

    await Promise.all(
      guild.channels.cache.map(async (channel) => {
        if (channel.name === 'verification') return;

        await channel.permissionOverwrites.set([
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: verifiedRole.id,
            allow: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: unverifiedRole.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
        ]);
      })
    );

    let verificationChannel = guild.channels.cache.find(ch => ch.name === 'verification');
    if (!verificationChannel) {
      verificationChannel = await guild.channels.create({
        name: 'verification',
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: verifiedRole.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: unverifiedRole.id,
            allow: [PermissionFlagsBits.ViewChannel],
          },
        ],
      });
    } else {
      await verificationChannel.permissionOverwrites.set([
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: verifiedRole.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: unverifiedRole.id,
          allow: [PermissionFlagsBits.ViewChannel],
        },
      ]);
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_button')
        .setLabel('✅ Verify Me')
        .setStyle(ButtonStyle.Success)
    );

    await verificationChannel.send({
      content: 'Click the button below to verify yourself and gain access to the server!',
      components: [row],
    });

    await interaction.reply({ content: '✅ Verification system set up successfully!', ephemeral: true });
  },

  async handleButton(interaction) {
    if (interaction.customId !== 'verify_button') return;

    const guild = interaction.guild;
    const member = interaction.member;

    const verifiedRole = guild.roles.cache.find(r => r.name === 'Verified');
    const unverifiedRole = guild.roles.cache.find(r => r.name === 'Unverified');

    if (verifiedRole) await member.roles.add(verifiedRole).catch(console.error);
    if (unverifiedRole && member.roles.cache.has(unverifiedRole.id)) {
      await member.roles.remove(unverifiedRole).catch(console.error);
    }

    await interaction.reply({ content: '✅ You are now verified and have access to all channels!', ephemeral: true });
  },
};
