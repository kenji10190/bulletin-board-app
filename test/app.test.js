const request = require("supertest");
const { expect } = require("chai");
const app = require("../app.js");

const testUser = {
  name: "testUser",
  email: `testuser${Date.now()}@mail.com`,
  password: "password1234"
}

describe("ユーザー登録APIテスト", () => {

  let agent;
  let csrfToken;

  beforeEach(async () => {
    agent = request.agent(app);
  });

  it("正しい情報で登録可能か", async () => {
    const getResponse = await agent
      .get("/register")
      .expect(200);

    const csrfMatch = getResponse.text.match(/<input type="hidden" name="_csrf" value="([^"]+)"/);
    csrfToken = csrfMatch ? csrfMatch[0] : null;

    if (!csrfToken) throw new Error("csrfTokenが見つかりません。");

    const postResponse = await agent
      .post("/register")
      .send({
        ...testUser,
        _csrf: csrfToken
      })
      .expect(302);

    expect(postResponse.headers.location).to.exist;
  })
})
