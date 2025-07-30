const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const csurf = require("csurf");
const path = require("path");
require("dotenv").config();
const routes = require("./routes");
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60} // 1時間
}));
app.use(flash());
app.use(csurf());

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs");

app.use((request, response, next) => {
  response.locals.currentUser = request.session.userId || null;
  response.locals.flash = {
    success : request.flash("success"),
    error : request.flash("error")
  }
  next();
});

app.use("/", routes);

app.use((request, response) => {
    response.status(404).render("error", {message: "ページがありません。"})
})

app.use((error, request, response, next) => {
    response.status(500).render("error", {message: "サーバーでエラーが発生しました。"});
});

module.exports = app;
