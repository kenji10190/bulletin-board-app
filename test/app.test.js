const request = require("supertest");
const app = require("../app.js");
const { expect }= require("chai");

describe("認証APIテスト", () => {
  it("ログイン画面が表示される", (done) => {
    request(app)
      .get("/login")
      .expect(200)
      .end((err, response) => {
        expect(response.text).to.include("ログイン");
        done(err)
      });
  }); 
});
