const { Events, MessageFlags } = require('discord.js');
const { execute } = require('./ready');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.log(`No matching Command ${interaction.commandName} found`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followup({
                    content: "there was an error executing the command",
                    flags: MessageFlags.Ephemeral
                })
            }
            else {
                await interaction.reply({
                    content: "there was an error executing the command",
                    flags: MessageFlags.Ephemeral
                })
            }
        }
    }
}