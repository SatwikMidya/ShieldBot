const { Client, GatewayIntentBits } = require("discord.js");
const perspective = require('./perspective.js');
const { token, KICK_THRESHOLD } = require('./config.json');

const emojiMap = {
    'FLIRTATION': '💋',
    'TOXICITY': '🧨',
    'INSULT': '👊',
    'INCOHERENT': '🤪',
    'SPAM': '🐟',
};

const User = {};

async function kick(user, guild) {
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;
    try {
        await member.kick('Was being a jerk');
    } catch (err) {
        console.log(`Could not kick user ${user.username}: ${err}`);
    }
}

async function evaluateMessage(message) {
    let scores;
    try {
        scores = await perspective.analyzeText(message.content);
    } catch (err) {
        console.log(err);
        return false;
    }

    const userid = message.author.id;
    if (!User[userid]) {
        User[userid] = {};
    }

    for (const attribute in emojiMap) {
        if (scores[attribute]) {
            try {
                await message.react(emojiMap[attribute]);
            } catch (err) {
                console.log(`Failed to react: ${err.message}`);
            }

            User[userid][attribute] =
                User[userid][attribute] ? User[userid][attribute] + 1 : 1;
        }
    }

    return (User[userid]['TOXICITY'] || 0) > KICK_THRESHOLD;
}

function getKarma() {
    const scores = [];
    for (const user in User) {
        if (!Object.keys(User[user]).length) continue;
        let score = `<@${user}> - `;
        for (const attr in User[user]) {
            score += `${emojiMap[attr]}: ${User[user][attr]}\t`;
        }
        scores.push(score);
    }
    return scores.length ? scores.join('\n') : '';
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.on('ready', () => {
    console.log('✅ I am ready!');
});

client.on('messageCreate', async (message) => {
    console.log(message);
    if (!message.guild || message.author.bot) return;

    const userid = message.author.id;
    if (!User[userid]) {
        User[userid] = {};
    }

    if (message.content.startsWith('!karma')) {
        const karma = getKarma();
        await message.channel.send(karma || 'No karma yet!');
        return;
    }

    let shouldKick = false;

    try {
        shouldKick = await evaluateMessage(message);
    } catch (err) {
        console.log(err);
    }

    if (shouldKick) {
        await kick(message.author, message.guild);
        delete User[userid];
        await message.channel.send(`🚫 ${message.author.username} was kicked for repeated violations.`);
    }
});

client.login(token);
