const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

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

app.use((error, req, res, next) => {
    res.status(500).render("error", {message: "A server error occured."});
});

app.get("/", async (req, res, next) => {
    try {
        const posts = await prisma.post.findMany({
            orderBy: {createdAt: "desc"}
        });
        res.render("index", {
            post,
            success: req.flash("success"),
            error: req.flash("error")
        })
    } catch (error) {
        next(error);
    }
});

app.listen(3000, () => {
    console.log("server is started");
})