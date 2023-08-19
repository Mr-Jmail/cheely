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

app.post("/genwinner", urlencodedParser, async function (req, res) {
    var participants = await genWinner(3); // 0й индекс - победитель
    res.send(participants)
    await pushWinnersToBd(participants);
});

async function genWinner(numberOfParticipantToDisplay) {
    return await new Promise(function (resolve, reject) {
        pool.getConnection(function (err, conn) {
            if (err) reject(err);
            try {
                conn.query("SELECT * FROM users", async (err, users) => {
                    if (err) reject(err)
                    var usedUsernums = [];
                    var participants = [] // 0й индекс - победитель
                    while (participants.length != numberOfParticipantToDisplay) {
                        var userNum = getRandomNumber(0, users.length);

                        if (usedUsernums.includes(userNum)) continue
                        else usedUsernums.push(userNum)

                        var participant = await bot.telegram.getChatMember(channelId, users[userNum].chatId).catch(err => { });
                        if (participant?.status != "member") continue
                        var formatedParticipant = { username: participant.user.username, fullName: participant.user.first_name + (participant.user.last_name ?? "") }
                        participants.push(formatedParticipant);
                    }
                    conn.release();
                    resolve(participants)
                })
            }
            catch (error) {console.log(error); conn.release()}
        })
    }).catch(err => console.log(err))
}


async function pushWinnersToBd(winners) {
    return await new Promise(function (resolve, reject) {
        pool.getConnection(function (err, conn) {
            if (err) reject(err);
            try {
                var queryString = "INSERT INTO winners (username, fullName, isWinner) VALUES "
                for(var i = 0; i < winners.length; i++) {
                    queryString += `('${winners[i].username}', '${winners[i].fullName}', '${i == 0 ? "1" : "0"}') ${i == winners.length - 1 ? "" :  ", "}`
                }
                conn.query("DELETE FROM winners winners", async (err) => {if(err) reject(err)});
                conn.query(queryString, async (err) => {
                    if (err) reject(err)
                    conn.release();
                    resolve()
                })
            }
            catch (error) {console.log(error); conn.release()}
        })
    }).catch(err => console.log(err))
}


async function getWinners() {
    return await new Promise(function (resolve, reject) {
        pool.getConnection(function (err, conn) {
            if (err) reject(err);
            try {
                conn.query("SELECT * FROM winners ORDER by -isWinner", async (err, winners) => {
                    if (err) reject(err)
                    conn.release();
                    resolve(winners)
                })
            }
            catch (error) {console.log(error); conn.release()}
        })
    }).catch(err => console.log(err))
}


app.listen(3000)