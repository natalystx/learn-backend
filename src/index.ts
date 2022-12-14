import express from "express";
import Database from "./Database";
import User, { UserParams } from "./User";

const app = express();
const db = new Database();
const user = new User(db);
const dbInstance = db.getInstance();
let isLoggedIn = false;

dbInstance.on("get-user", (res: UserParams[]) => {
  isLoggedIn = res?.length !== 0;
});

app.listen("4002");

app.post<UserParams>("/login", (req, res) => {
  user.findUser(req.params);
  res.json({ isLoggedIn });
});
app.get("/login", (req, res) => {
  res.json({ isLoggedIn });
});
