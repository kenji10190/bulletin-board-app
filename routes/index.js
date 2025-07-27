const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController.js");
const postController = require("../controllers/postConstroller.js");

function ensureAuth(request, response, next) {
  if (!request.session.id) {
    request.flash("error", "ログインしてください。");
    return response.redirect("/login");
  }
  next();
}

const registerValidation = [
  body("name").trim().notEmpty().withMessage("名前は必須です。"),
  body("email").isEmail().withMessage("有効なメールアドレスを入力してください。"),
  body("password").isLength({min:6}).withMessage("パスワードは6文字以上です。")
];

const loginValidation = [
  body("email").isEmail().withMessage("有効なメールアドレスを入力してください。"),
  body("password").notEmpty().withMessage("パスワードを入力してください。")
];

const postValidation = [ 
  body("title").trim().isLength({min:1}).withMessage("タイトルは必須です。"),
  body("content").trim().isLength({min:1}).withMessage("内容は必須です。")
];

router.get("/", postController);
