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
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.listen("4002", async () => {
  await initDatabase();
  user = new User(db);
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!user) {
      throw new Error("User class found");
    }

    const result = await user.register({ username, password });
    res.json({ result });
  } catch (err) {
    res.status(403);
    res.json({ err });
  }
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

app.patch<UserParams & { oldPassword: string }>(
  "/user/change-password",
  async (req, res) => {
    if (!user) {
      throw new Error("User class found");
    }

    const { username, password, oldPassword } = req.body;
    try {
      await user.changePassword({
        username,
        password,
        oldPassword,
      });
      res.json({ success: true });
    } catch (error) {
      res.status(403);
      res.json(error);
    }
  }
);

app.delete<{ username: string }>("/user/delete/:username", async (req, res) => {
  const { username } = req.params;

  if (!user) {
    throw new Error("User class found");
  }
  await user.delete(username);
  res.json({ success: true });
});
