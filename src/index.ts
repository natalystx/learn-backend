import bodyParser from "body-parser";
import express from "express";
import Database from "./Database";
import UserDB, { UserParams } from "./User/user.db";
import Authentication from "./Authentication";
import UserController from "./User/user.controller";

const app = express();
const db = new Database();
const initDatabase = async () => {
  await db.init();
  await db.connect();
};

const authentication = new Authentication();
let user: UserDB;
let userController!: UserController;
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.listen(process.env.PORT || "4002", async () => {
  await initDatabase();
  user = new UserDB(db);
  userController = new UserController(user!, authentication);

  app.post("/register", userController.register);
  app.post<UserParams>("/login", userController.login);
  app.post(
    "/refreshToken",
    authentication.authenticate,
    authentication.refreshToken
  );
  app.post("/logout", authentication.authenticate, authentication.signOut);
  app.patch<UserParams & { oldPassword: string }>(
    "/user/change-password",
    authentication.authenticate,
    userController.changePassword
  );
  app.delete<{ username: string }>(
    "/user/delete/:username",
    authentication.authenticate,
    userController.deleteUser
  );
});
