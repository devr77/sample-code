const request = require("supertest");
const app = require("../../app");

describe("Frontend 200 Status ", () => {
  test("/", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
  });
});
