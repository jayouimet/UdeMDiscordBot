const { Message } = require("discord.js");
const nodemailer = require('nodemailer');
const MongoClient = require('mongodb').MongoClient;

module.exports = {
    name: "authenticate",
    category: "moderation",
    description: "Verify a user by email",
    run: async (client, guilds, message, args) => {
        let isValid = false;
        let messageTo;

        args.forEach(arg => {
            if (emailIsValid(arg)) {
                isValid = true;
                messageTo = arg;
                return;
            }
        });

        if (!isValid)
            return message.channel.send("The email you used was invalid");

        let randomCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        const url = process.env.MONGO_URL;
        MongoClient.connect(url, async (err, db) => {
            if (err) return;
            let dbo = db.db("BacInfoDiscordDB");
            let quote = message.content.slice(process.env.PREFIX.length + 3).trim();

            let userInDB = await dbo.collection("users").findOne({email: messageTo});
            console.log(userInDB);
            if (userInDB && userInDB.userid != message.author.id) return message.channel.send("You already have a discord account linked to that email. Contact an administrator for help.");

            let newUser = await dbo.collection("users").findOne({userid: message.author.id});

            if (newUser) {
                newUser.email = messageTo;
                newUser.passcode = randomCode;

                await dbo.collection("users").updateOne({userid: newUser.userid}, { $set: {email: messageTo, passcode: randomCode} }, (err, res) => {
                    if (err) return;
                    db.close();
    
                    let transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,
                        auth: {
                            user: process.env.GMAIL_USER,
                            pass: process.env.GMAIL_PASS 
                        }
                    });
    
                    transporter.sendMail({
                        from: process.env.GMAIL_USER,
                        to: messageTo,
                        subject: "Confirmation de votre inscription au Discord UdeM Bac Info",
                        text: `Votre code d'accès est: ${randomCode}`
                    });
            
                    return message.channel.send("A message has been sent to your email address with a passcode in it, copy the passcode in this channel to confirm it is your email address.");
                });
            }
            else {
                newUser = { 
                    userid: message.author.id, 
                    email: messageTo,
                    passcode: randomCode
                };

                await dbo.collection("users").insertOne(newUser, (err, res) => {
                    if (err) return;
                    db.close();
    
                    let transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,
                        auth: {
                            user: process.env.GMAIL_USER,
                            pass: process.env.GMAIL_PASS 
                        }
                    });
    
                    transporter.sendMail({
                        from: process.env.GMAIL_USER,
                        to: messageTo,
                        subject: "Confirmation de votre inscription au Discord UdeM Bac Info",
                        text: `Votre code d'accès est: ${randomCode}`
                    });
            
                    return message.channel.send("A message has been sent to your email address with a passcode in it, copy the passcode in this channel to confirm it is your email address.");
                });
            }
        });
    }
}

function emailIsValid(arg) {
    let split = arg.split('@');
    return split[0] 
        && split[0].length > 0 
        && split[0].includes('.') 
        && arg.endsWith('@umontreal.ca');
}