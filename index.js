const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const { PrismaClient } = require("./generated/prisma");

const app = express();
const prisma = new PrismaClient();

app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

app.use((req, res, next) => {
    res.locals.flash = {
        success: req.flash("success"),
        error: req.flash("error")
    };
    next();
});

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.send("keijiban");
})

app.listen(3000, () => {
    console.log("server is started");
})