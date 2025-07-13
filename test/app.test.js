const request = require("supertest");
const { express } = require("chai");
const app = require("../app.js");

const testUser = {
  name: "testuser",
  email: `testuser${Date.now()@example.com}`,
  password: "password1234"
}

describe("ユーザー登録APIテスト", () => {
  it("正しい情報で登録できるか", (done) => {
    request(app)
      .post("/register")
      .send(testUser)
      .expect(302)
      .end((err, response) => {
        if(err) return done(err);
        
      })
  })
})
