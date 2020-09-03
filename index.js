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

client.on("guildMemberAdd", member => {
    let roles = member.guild.roles;
    // Add new member role when a new member joins
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