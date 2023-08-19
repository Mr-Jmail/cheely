const mysql = require("mysql");

module.exports = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "cheleebot",
    database: "chelee",
    connectionLimit : 7,
})