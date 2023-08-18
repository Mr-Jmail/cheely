const { Telegraf, Telegram } = require("telegraf");
const bot = new Telegraf("5589950553:AAHiC9FCN1Z-uh2GISlJbwFdijeTssKmC1M");
const express = require("express");
const app = express();
const mysql = require("mysql");
const bodyParser = require("body-parser");

var channelId = -1001616084901;

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.json());

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "cheleebot",
    database: "chelee"
});

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

app.post("/getwinner", urlencodedParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);
    con.connect(async function (err) {
        if (err) throw err;
        con.query("SELECT * FROM users", async function(err, users) {
            if (err) throw err;
            var isValidWinner = false
            while (!isValidWinner) {
                let userNum = getRandomNumber(0, users.length);
                let winner = await bot.telegram.getChatMember(channelId, users[userNum].chatId).catch(err => {throw err});
                if (winner?.status != "member") return
                isValidWinner = true;
                var formatedWinner = { username: winner.user.username, fullName: winner.user.first_name + (winner.user.last_name ?? "")}
                console.log(formatedWinner);
                res.send("lol");
                // con.end();
            }
        });
    });
});


bot.launch();
app.listen(3000)