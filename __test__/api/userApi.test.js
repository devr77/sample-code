const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../../app");
const User = require("../../models/userModel");

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany;
  }
});

describe("User Authentication", () => {
  test("/api/signup return 201 & User Created", async () => {
    const res = await request(app)
      .post("/api/signup")
      .set("content-type", "application/json")
      .send({
        firstName: "Dev",
        lastName: "Raj",
        medium: "draj56699@gmail.com",
        password: "12345678",
      });
    expect(res.status).toBe(201);
  });

  test("/api/login return 201 & User Created", async () => {
    const res = await request(app)
      .post("/api/login")
      .set("content-type", "application/json")
      .send({
        email: "draj56699@gmail.com",
        password: "12345678",
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});

describe.skip("User Update", () => {
  let task;
  beforeEach(async () => {
    task = await User.create({
      firstName: "Dev",
    });
  });

  it("should return 404 if user  doesn't exist", async () => {
    const taskId = "639c80ef98284bfdf111ad09";
    const response = await request(app).patch(`/api/v1/tasks/${taskId}`);

    expect(response.status).toBe(404);
    expect(response.body.msg).toEqual("this task does not exist");
  });
});
