const { SlashCommandBuilder } = require('discord.js');
const { execute } = require('./ping');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('get user details'),
    async execute(interaction) {
        await interaction.reply(`You are ${interaction.user.username}, you joined this server ${interaction.member.joinedAt}.`);
    },

};