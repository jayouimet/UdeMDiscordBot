const { Message } = require("discord.js");
const MongoClient = require('mongodb').MongoClient;

module.exports = {
    name: "setrole",
    category: "moderation",
    description: "Sets the validated member's role",
    run: (client, guilds, message, args) => {
        if (!message.member.permissions.has("MANAGE_ROLES")) return message.channel.send("You do not have the permission to manage roles.");

        if (message.mentions.roles.size == 0) return message.channel.send("Please mention a role to set as a validated user's role.");

        let role = message.mentions.roles.entries().next().value[1];
        const url = process.env.MONGO_URL;
        MongoClient.connect(url, async (err, db) => {
            if (err) return;
            let dbo = db.db("BacInfoDiscordDB");

            let thisGuild = await dbo.collection("guilds").findOne({guildid: message.guild.id});
            if (!thisGuild) {
                let newGuild = {
                    guildid: message.guild.id,
                    valrole: role.id
                };

                await dbo.collection("guilds").insertOne(newGuild, (err, res) => {
                    if (err) return;
                    db.close();

                    return message.channel.send(`The validated user's role has been updated to \`${role.name}\``);
                });
            } else {
                await dbo.collection("guilds").updateOne({guildid: message.guild.id}, { $set: {valrole: role.id} }, (err, res) => {
                    if (err) return;
                    db.close();
            
                    return message.channel.send(`The validated user's role has been updated to \`${role.name}\``);
                });
            }
        });
    }
}