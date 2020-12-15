const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const config = require('./config.json');
const Discord = require('Discord.js');
const queue = new Map();

async function execute(message, serverQueue) {

	const prefix = config.PREFIX;
	const commandBody = message.content.slice(prefix.length);
	const f_args = commandBody.split(' ');
	f_args.shift();
	console.log(f_args);

	const voiceChannel = message.member.voice.channel;
	const args = f_args.join(' ');


	

	if (!voiceChannel){
		return message.channel.send("Você precisa estar em um canal de voz para tocar música!");
	}
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
		return message.channel.send("Eu preciso das permissões para entrar e falar no canal de voz!");
	}

	const filters = await ytsr.getFilters(args);
    const filter = filters.get('Type').find(a => a.label === 'Video');
    const search = await ytsr(filter.query, {
        limit: 5
    });
    let musicItems = search.items;
    let infoArr = []
    for (let i = 0; i < musicItems.length; i++) {
        let info = {
            title: musicItems[i].title,
            duration: musicItems[i].duration,
            link: musicItems[i].link
        };
        infoArr.push(info);
    }

    let embed = new Discord.MessageEmbed()
        .setTitle("Escolha uma música: ")
        .setColor(0xFE8BFE);
    for (let i = 0; i < infoArr.length; i++) {
        embed.addField(`Opção ${i + 1}: `, infoArr[i].title);
    }
    let choose;
    try {
        message.channel.send(embed).then(async msg => {
            //   :three: :four: :five: 
            msg.react('1️⃣').then(
                async () => msg.react('2️⃣').then(
                    async () => msg.react('3️⃣').then(
                        async () => msg.react('4️⃣').then(
                            async () => msg.react('5️⃣').then(
                                async () => {
                                    const filter = (reaction, user) => {
                                        return ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'].includes(
                                            reaction.emoji.name) && user.id === message.author.id;
                                    };

                                    const collector = msg.createReactionCollector(filter, { max: 1,
                                        time: 15000
                                    });

                                    collector.on('collect', (reaction, user) => {
                                    	if (reaction.emoji.name === "1️⃣"){
                                    		console.log(infoArr[0].title + ": 1");
                                    		choose = 0;
                                    	} else if (reaction.emoji.name === "2️⃣"){
                                    		console.log(infoArr[1].title + ": 2");
                                    		choose = 1;
                                    	} else if (reaction.emoji.name === "3️⃣"){
                                    		console.log(infoArr[2].title + ": 3");
                                    		choose = 2;
                                    	} else if (reaction.emoji.name === "4️⃣"){
                                    		console.log(infoArr[3].title + ": 4");
                                    		choose = 3;
                                    	} else if (reaction.emoji.name === "5️⃣"){
                                    		console.log(infoArr[4].title + ": 5");
                                    		choose = 4;
                                    	}
                                        
                                    });

                                    collector.on('end', async collected => {
                                        msg.delete({ timeout: 1000 });
                                        const song = {
										title: infoArr[choose].title,
										url: infoArr[choose].link,
										};

										if (!serverQueue) {
											const queueConstruct = {
												textChannel: message.channel,
												voiceChannel: voiceChannel,
												connection: null,
												songs: [],
												volume: 5,
												playing: true,
											};

											queue.set(message.guild.id, queueConstruct);

											queueConstruct.songs.push(song);

											try {
												let connection = await voiceChannel.join();
												queueConstruct.connection = connection;

												play(message.guild, queueConstruct.songs[0]);
											} catch (err) {
												console.log(err);
												queue.delete(message.guild.id);
												return message.channel.send(err);
											}
										} else {
											serverQueue.songs.push(song);
											console.log(serverQueue.songs);
											message.channel.send(`${song.title} foi adicionada a playlist com sucesso!`);
										}
                                    });

                                })
                        )
                    )
                )
            )


        });

    } catch (err) {
        console.log(err);
        message.reply("Erro! Nenhum título de música foi enviado!");
    }
    

}


function play(guild, song) {
	const serverQueue = queue.get(guild.id);
	if (!song) {
		serverQueue;voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	const dispatcher = serverQueue.connection
	.play(ytdl(song.url))
	.on("finish", () => {
		serverQueue.songs.shift();
		play(guild, serverQueue.songs[0]);
	})
	.on("error", error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
	serverQueue.textChannel.send(`Tocando agora: ${song.title}`)
}


function skip(message, serverQueue) {
	console.log(`skip`);
	if (!message.member.voice.channel) {
		return message.channel.send("Você precisa estar em um canal de voz para pular a música!");
	}
	if (!serverQueue) {
		return message.channel.send("Não há músicas para pular!");
	};
	serverQueue.connection.dispatcher.end();
	message.channel.send("Tocando a próxima música...")
}


function stop(message, serverQueue) {
	console.log(`stop`);
	if (!message.member.voice.channel) {
		return message.channel.send("Você precisa estar em um canal de voz para parar a música!");
	}
	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
	message.channel.send("Musica parada!")
}


module.exports = {
	execute,
	skip,
	stop
};