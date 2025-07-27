const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const { prismaClient } = require("@prisma/client");
const prismaClient = new prismaClient();

exports.showRegister = (request, response, next) => {
  response.render("register", {csrfToken: request.csrfToken()});
});

exports.register = async (request, response, next) => {
  const errors = validationResult(request);
  if(!errors.isEmpty()){
    request.flash("error", errors.array().map(e => e.msg).join(" "));
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
    return response.redirect("/login");
  } catch (error) {
    next(error);
  }
});

exports.showLogin = (request, response, next) => {
  response.render("login", {csrfToken: request.csrfToken()});
});

exports.login = async (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()){
    request.flash("error", errors.array().map(e => e.msg).join(", "));
    return response.redirect("/login");
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
    return response.redirect("/");
  } catch (error){
    next(error);
  }
});

exports.logout = (request, response, next) => {
  request.session.destroy((err) => {
    if (err) return next(err);
    return response.redirect("/");
  })
});
