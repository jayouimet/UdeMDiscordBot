const { Client, RichEmbed, Collection } = require("discord.js");
const { config } = require("dotenv");

const client = new Client({
    disableEveryone: true
});

client.commands = new Collection();
client.aliases = new Collection();

let guilds = {};

config({
    path: __dirname + "/.env"
});

const prefix = process.env.PREFIX;

["command"].forEach(handler => {
    require(`./handler/${handler}`)(client);
});

client.on("ready", () => {
    console.log(`${client.user.username} online`);
    client.user.setPresence({
        status: "dnd",
        game: {
            name: "In developpement",
            type: "Watching"
        }
    })
});

client.on("message", async message => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(prefix)) return;
    if (!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if (cmd.length === 0) return;

    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    if (command)
        command.run(client, guilds, message, args);
});

client.login(process.env.TOKEN);

/*function isAuthChannel(channel) {
    // This is a test in a test server of mine, gotta change it so its pulled from the database Guild -> VerificationChannelID
    return channel.id == '706977013155495970' || channel.id == '751126987141021697';
}*/