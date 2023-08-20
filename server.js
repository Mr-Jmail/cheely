const { Telegraf } = require("telegraf");
const bot = new Telegraf("5589950553:AAHiC9FCN1Z-uh2GISlJbwFdijeTssKmC1M");
const express = require("express");
const cors = require('cors');
const app = express();
var channelId = -1001616084901;
const bodyParser = require("body-parser");
const pool = require("./bd_config.js")
const jwt = require('jsonwebtoken');
var path = require("path")

const accessTokenSecret = 'youraccesstokensecret'

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.json());

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

app.use(express.static(path.join(__dirname, "FrontProject")))

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "FrontProject", "login.html"))
})

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "FrontProject", "index.html"))
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    var admin = await new Promise(async (resolve, reject) => {
        pool.getConnection(function (err, conn) {
            try {
                conn.query(`SELECT * FROM admins WHERE username LIKE '${username}' AND password LIKE '${password}'`, function(err, admins) {
                    if(err) reject(err);
                    conn.release()
                    resolve(admins[0] ?? undefined)
                })
            } 
            catch (error) {
                conn.release()
                console.log(error);    
            }
        })
    })
    console.log(admin);
    if(!admin) return res.send('Username or password incorrect');
    const accessToken = jwt.sign({ username: admin.username}, accessTokenSecret);
    if(accessToken) res.redirect("/")
});


function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];

    jwt.verify(token, accessTokenSecret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};


app.post("/genwinner", authenticateJWT, async function (req, res) {
    const user = req.user
    console.log(user);
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