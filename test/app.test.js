const request = require("supertest");
const { expect } = require("chai");
const app = require("../app.js");


describe("掲示板アプリ基本テスト", () => {

  let agent;

  beforeEach(() => {
    agent = request.agent(app);
  });

  describe("起動確認", () => {
    it("アプリが起動するか", async () => {
      const getResponse = await agent.get("/");
      expect(getResponse.status).to.equal(200);
    })
  })

  describe("主要ページ表示確認", () => {
    it("トップページ表示確認", async () => {
      const getResponse = await agent.get("/");
      expect(getResponse.status).to.equal(200);
    });

    it("ログインページ確認", async () => {
      const getResponse = await agent.get("/login");
      expect(getResponse.status).to.equal(200);
    });

    it("ユーザー登録ページ確認", async () => {
      const getResponse = await agent.get("/register");
      expect(getResponse.status).to.equal(200);
    });
  });

  describe("ユーザー登録基本テスト", () => {
    it("正しい情報で登録可能か", async () => {
      const testUser = {
        name: "testUser",
        email: `testuser${Date.now()}@mail.com`, 
        password: "password1234"
      }
      const getResponse = await agent.get("/register").expect(200);
      const csrfMatch = getResponse.text.match(/<input type="hidden" name="_csrf" value="([^"]+)"/);
      const csrfToken = csrfMatch ? csrfMatch[1] : null;

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
    });
  });

  describe("ログイン基本テスト", () => {
    const testEmail = `testUser${Date.now()}@mail.com`;
    const testPassword = "password1234";

    before(async () => {
      const getResponse = await agent.get("/register");
      const csrfMatch = getResponse.text.match(/<input type="hidden" name="_csrf" value="([^"]+)"/);
      const csrfToken = csrfMatch ? csrfMatch[1] : null;

      const postResponse = await agent.post("/register").type("form").send({
        name: "testuser",
        email: testEmail,
        password: testPassword,
        _csrf: csrfToken
      });
    });

    it("正常ログイン可能か", async () => {
      const loginPage = await agent.get("/login");
      const csrfMatch = loginPage.text.match(/<input type="hidden" name="_csrf" value="([^"]+)"/);
      const csrfToken = csrfMatch ? csrfMatch[1] : null;

      const response = await agent.post("/login").type("form").send({
        email: testEmail,
        password: testPassword,
        _csrf: csrfToken
      });

      expect(response.status).to.equal(302);
      expect(response.headers.location).to.equal("/");
    });
  });

  describe("投稿機能基本テスト", () => {
    beforeEach(async () => {
      const email = `testUser${Date.now()}@mail.com`;
      const password = "password1234";

      const getResponse = await agent.get("/register");
      let csrfMatch = getResponse.text.match(/<input type="hidden" name="_csrf" value="([^"]+)"/);

      const postResponse = await agent.post("/register").type("form").send({
        name: "testUser",
        email: email,
        password: password,
        _csrf: csrfMatch[1]
      });

      const loginPage = await agent.get("/login");
      csrfMatch = loginPage.text.match(/<input type="hidden" name="_csrf" value="([^"]+)"/);

      const loginResponse = await agent.post("/login").type("form").send({
        email: email,
        password: password,
        _csrf: csrfMatch[1]
      });
    });

    it("投稿一覧ページが表示されるか", async () => {
      const response = await agent.get("/");
      expect(response.status).to.equal(200);
    })
  });
});

describe("エラーハンドリング", () => {
  it("存在しないページ", async () => {
    const response = await request(app).get("/sonzaishinaiPage");
    expect(response.status).to.equal(404);
  })
})
