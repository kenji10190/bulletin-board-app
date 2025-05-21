const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");

const app = express();
const prisma = new PrismaClient();

app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false
    cookie: {maxAge: 1000 * 60 * 60} // 1時間
}));
app.use(flash());

app.use((request, response, next) => {
    response.locals.flash = {
        success: request.flash("success"),
        error: request.flash("error")
    };
    next();
});

app.use(express.static(path.join(__dirname, "public")));


app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs");


app.get("/", async (request, response, next) => {
    try {
        const posts = await prisma.post.findMany({
            orderBy: {createdAt: "desc"}
        });
        response.render("index", {
            posts,
            success: request.flash("success"),
            error: request.flash("error")
        })
    } catch (error) {
        next(error);
    }
});

app.post("/posts", [
    body("title").trim().isLength({min:1}).withMessage("タイトルは必須です。"),
    body("content").trim().isLength({min:1}).withMessage("内容は必須です。")
], async (request, response, next) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()){
        req.flash("error", errors.array().map(e => e.msg).join(", "));
        return response.redirect("/");
    }
    try {
        await prisma.post.create({
            data: {
                title: request.body.title,
                content: request.body.content,
                authorId: 1
            }
        });
        request.flash("success", "投稿が完了しました。");
        response.redirect("/");
    } catch (error) {
        next(error);
    }
});

app.get("/register", (request, response, next) => {
  response.render("register");
});

app.use((request, response) => {
    response.status(404).render("error", {message: "ページがありません。"})
})

app.use((error, request, response, next) => {
    response.status(500).render("error", {message: "サーバーでエラーが発生しました。"});
});
