import bodyParser from "body-parser";
import express from "express";
import Database from "./Database";
import User, { UserParams } from "./User";

const app = express();
const db = new Database();
const initDatabase = async () => {
  await db.init();
  await db.connect();
};

let user: User;

let isLoggedIn = false;
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

app.listen("4002", async () => {
  await initDatabase();
  user = new User(db);
  const res = await user.findUser({
    username: "admin",
    password: "12345",
  });
});

app.post<UserParams>("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!user) {
    throw new Error("User class found");
  }
  const found = await user.findUser({
    username,
    password,
  });

  if (found?.[0]?.id) {
    res.json({
      accessToken: Date.now(),
    });
  } else {
    res.status(404);
    res.send({ error: "User doesn't exist" });
  }
});
