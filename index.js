const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require("discord.js");
const { token } = require("./config.json");
const fs = require('node:fs');   // native file system module used to read commands directory and identify command files
const path = require('node:path');  //native path utitlity module
const { execute } = require("./commands/utility/ping");


const client = new Client({ intents: [GatewayIntentBits.Guilds] });





client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);


for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandsFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[Warning] The command at ${filePath} is missing required 'data' or 'execute' property.`);
        }
    }
}


const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath);

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    }
    else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.login(token);