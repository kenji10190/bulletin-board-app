const request = require("supertest");
const { expect } = require("chai");
const app = require("../app.js");

const testUser = {
  name: "testUser",
  email: `testuser${Date.now()}@mail.com`, 
  password: "password1234"
}

describe("掲示板アプリ基本テスト", () => {

  let agent;

  beforeEach(async () => {
    agent = request.agent(app);
  });

  describe("起動確認", () => {
    it("アプリが起動するか", async () => {
      const getResponse = await agent
        .get("/")
        .expect(getResponse.status).to.equal(200);
    })
  })

  describe("主要ページ表示確認", () => {
    it("トップページ表示確認", async () => {
      const getResponse = await agent
        .get("/")
        .expect(getResponse.status).to.equal(200);
    });

    it("ログインページ確認", async () => {
      const getResponse = await agent
        .get("/login")
        .expect(getResponse.status).to.equal(200);
    });

    it("ユーザー登録ページ確認", async () => {
      const getResponse = await agent
        .get("/register")
        .expect(getResponse.status).to.equal(200);
    });
  });

  it("正しい情報で登録可能か", async () => {
    const getResponse = await agent
      .get("/register")
      .expect(200);

    const csrfMatch = getResponse.text.match(/<input type="hidden" name="_csrf" value="([^"]+)"/);
    csrfToken = csrfMatch ? csrfMatch[1] : null;

    if (!csrfToken) throw new Error("csrfTokenが見つかりません。");

    const postResponse = await agent
      .post("/register")
      .type("form")
      .send({
        ...testUser,
        _csrf: csrfToken
      })
      .expect(302);

    expect(postResponse.status).to.equal(302);
    expect(postResponse.headers.location).to.equal("/login");
  })
})
