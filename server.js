const { Telegraf, Telegram } = require("telegraf");
const bot = new Telegraf("5589950553:AAHiC9FCN1Z-uh2GISlJbwFdijeTssKmC1M");
const express = require("express");
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");

app.use(cors());

const pool = require("./bd_config.js")

var channelId = -1001616084901;

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.json());

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

app.post("/getwinner", urlencodedParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);
    pool.getConnection(function(err, conn) {
        if(err) throw err
        conn.query("SELECT * FROM users", async (err, users) => {
            if (err) throw err;
            var winners = [];
            var usedUsernums = [];
            while (winners.length != 3) {
                var userNum = getRandomNumber(0, users.length);

                if(usedUsernums.includes(userNum)) continue
                else usedUsernums.push(userNum)
                
                var winner = await bot.telegram.getChatMember(channelId, users[userNum].chatId).catch(err => {});
                if (winner?.status != "member") continue
                isValidWinner = true;
                var formatedWinner = { username: winner.user.username, fullName: winner.user.first_name + (winner.user.last_name ?? "")}
                winners.push(formatedWinner);
            }
            console.log(winners);
            res.send(winners)
        })
    })
});


app.listen(3000)