const mysql = require("mysql");

module.exports = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "12233393777",
    database: "chelee",
    connectionLimit : 7,
})