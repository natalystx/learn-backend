import bodyParser from "body-parser";
import express from "express";
import Database from "./Database";
import UserDB, { UserParams } from "./User/user.db";
import Authentication from "./Authentication";
import UserController from "./User/user.controller";
import PostController from "./Posts/post.controller";
import PostDB from "./Posts/posts.db";
import cors from "cors";

const app = express();
const db = new Database();
const initDatabase = async () => {
  await db.init();
  await db.connect();
};

let authentication: Authentication;
let user: UserDB;
let userController!: UserController;
let postController!: PostController;
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.listen(process.env.PORT || "4002", async () => {
  await initDatabase();
  user = new UserDB(db);
  const dbInstance = db.getInstance();
  authentication = new Authentication(dbInstance);
  userController = new UserController(user!, authentication);
  postController = new PostController(new PostDB(dbInstance));

  app.post("/register", userController.register);
  app.post<UserParams>("/login", userController.login);
  app.post(
    "/refresh-token",
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
  app.post(
    "/post/create-post",
    authentication.authenticate,
    postController.createPost
  );
  app.get("/post", authentication.authenticate, postController.getPosts);
  app.get(
    "/post/:postId",
    authentication.authenticate,
    postController.getPostsById
  );
  app.patch(
    "/post/edit-post",
    authentication.authenticate,
    postController.editPost
  );
  app.delete(
    "/post/:postId",
    authentication.authenticate,
    postController.deletePostById
  );
});
