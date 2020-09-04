const { Message } = require("discord.js");
const MongoClient = require('mongodb').MongoClient;

module.exports = {
    name: "passcode",
    category: "moderation",
    description: "Validate the account with the passcode",
    run: (client, guilds, message, args) => {
        let userToAuth;
        const url = process.env.MONGO_URL;
        MongoClient.connect(url, async (err, db) => {
            if (err) return;
            let dbo = db.db(process.env.MONGO_DATABASE);

            let thisGuild = await dbo.collection(process.env.MONGO_GUILD_TABLE).findOne({guildid: message.guild.id});
            if (!thisGuild) return message.channel.send("Couldn't give you the verified user's role, ask an administrator to set the role using the appropriate command.");

            userToAuth = await dbo.collection(process.env.MONGO_USER_TABLE).findOne({userid: message.author.id});

            if (!userToAuth) return;
            let modified = false;
            args.forEach(arg => {
                if (arg == userToAuth.passcode) {
                    try {
                        let role = message.guild.roles.cache.get(thisGuild.valrole); 
                           
                        message.member.roles.add(role);
                        modified = true;
                        return message.channel.send("Your roles have been updated");
                    } catch (error) {
                        console.log(error);
                        return message.channel.send("Couldn't verify your account, please contact an admin.");
                    }
                }
            });
            if (!modified)
                return message.channel.send("Couldn't verify your account, please contact an admin.");
        });
    }
}