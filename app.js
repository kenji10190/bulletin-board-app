const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");

const app = express();
const prisma = new PrismaClient();

app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
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
app.use((request, response, next) => {
  response.locals.currentUser = request.session.userId || null;
  response.locals.flash = {
    success : request.flash("success"),
    error : request.flash("error")
  }
  next();
});

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs");

function ensureAuth(request, response, next){
  if (!request.session.userId){
    request.flash("error", "ログインが必要です。");
    return response.redirect("/login");
  }
  next();
};

app.get("/", async (request, response, next) => {
    try {
        const posts = await prisma.post.findMany({
            orderBy: {createdAt: "desc"},
            include: {author: true}
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

app.post("/posts", ensureAuth, [
    body("title").trim().isLength({min:1}).withMessage("タイトルは必須です。"),
    body("content").trim().isLength({min:1}).withMessage("内容は必須です。")
], async (request, response, next) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()){
        request.flash("error", errors.array().map(e => e.msg).join(", "));
        return response.redirect("/");
    }
    try {
        await prisma.post.create({
            data: {
                title: request.body.title,
                content: request.body.content,
                authorId: request.session.userId 
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

app.post("/register", [
  body("name").trim().notEmpty().withMessage("名前は必須です。"),
  body("email").isEmail().withMessage("有効なメールアドレスを入力してください。"),
  body("password").isLength({min:6}).withMessage("パスワードは6文字以上です。")
], async (request, response, next) => {
  const errors = validationResult(request);
  if(!errors.isEmpty()){
    request.flash("error", errors.array().map(e => e.msg).join(", "));
    return response.redirect("/register");
  }
  try {
    const hashed = await bcrypt.hash(request.body.password, 12);
    await prisma.user.create({
      data: {
        name: request.body.name,
        email: request.body.email,
        password: hashed
      }
    });
    request.flash("success", "登録が完了しました。");
    response.redirect("/login");
  } catch (error) {
    next(error);
  }
})

app.get("/login", (request, response, next) => {
  response.render("login");
})

app.post("/login", [
  body("email").isEmail().withMessage("有効なメールアドレスを入力してください。"),
  body("password").notEmpty().withMessage("パスワードを入力してください。")
], async (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()){
    request.flash("error", errors.array().map(e => e.msg).join(", "));
    response.redirect("/login");
  }
  try {
    const user = await prisma.user.findUnique({where : {email : request.body.email}});
    if (!user){
      request.flash("error", "ユーザーが見つかりません。");
      return response.redirect("/login");
    }
    const ok = await bcrypt.compare(request.body.password, user.password);
    if (!ok){
      request.flash("error", "パスワードが違います。");
      return response.redirect("/login");
    }
    request.session.userId = user.id;
    request.flash("success", "ログインに成功しました。");
    response.redirect("/");
  } catch (error){
    next(error);
  }
});

app.get("/logout", (request, response, next) => {
  request.session.destroy((err) => {
    if (err) return next(err);
    response.redirect("/login");
  })
})

app.use((request, response) => {
    response.status(404).render("error", {message: "ページがありません。"})
})

app.use((error, request, response, next) => {
    response.status(500).render("error", {message: "サーバーでエラーが発生しました。"});
});

app.listen(3000, () => {
  console.log("start server");
} ) 
