const Discord = require('Discord.js');
const config = require('./config.json');
const queue = new Map();
const {
    execute,
    skip,
    stop
} = require('./downloader.js');

const client = new Discord.Client();

const prefix = config.PREFIX;


client.once('ready', () => {
    console.log("Bot is ready");
});

client.once('reconnecting', () => {
    console.log('reconnecting');
});

client.once('disconnect', () => {
    console.log("disconnected");
});


client.on('message', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    if (message.member.roles.cache.some(role => role.name === 'ADM')) {
        if (command === "exit") process.exit();
    }


    if (command === 'ping') {
        const timeTaken = Date.now() - message.createdTimestamp;
        message.reply(`Pong! A latência foi de ${timeTaken}ms.`);
    }

    

    const serverQueue = queue.get(message.guild.id);
    if (command === 'play') {
        execute(message, serverQueue);
        return;
    } else if (command === 'skip') {
        skip(message, serverQueue);
        return;
    } else if (command === 'stop') {
        stop(message, serverQueue);
        return;
    } else {
        message.reply("O comando inserido está inválido!");
    }

});

client.login(config.BOT_TOKEN);