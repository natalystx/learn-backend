import { first } from "lodash";
import Authentication from "../Authentication";
import UserDB from "./user.db";

export default class UserController {
  private userDB: UserDB;
  private authentication: Authentication;
  constructor(db: UserDB, auth: Authentication) {
    this.userDB = db;
    this.authentication = auth;
  }

  login = async (req: Record<string, any>, res: Record<string, any>) => {
    const { username, password } = req.body;
    try {
      const found = await this.userDB.findUser({
        username,
        password,
      });

      const userData = first(found);
      if (userData?.id) {
        res.json({
          accessToken: this.authentication.generateAccessToken(userData),
          refreshToken: this.authentication.generateRefreshToken(userData),
        });
      } else {
        res.status(404);
        res.send({ error: "User doesn't exist" });
      }
    } catch (error) {
      res.status(404);
      res.send({ error: "User doesn't exist" });
    }
  };

  register = async (req: Record<string, any>, res: Record<string, any>) => {
    try {
      const { username, password } = req.body;
      await this.userDB.register({ username, password });
      res.json({ success: true });
    } catch (err) {
      res.json({ err });
    }
  };

  changePassword = async (
    req: Record<string, any>,
    res: Record<string, any>
  ) => {
    const { username, password, oldPassword } = req.body;
    try {
      await this.userDB.changePassword({
        username,
        password,
        oldPassword,
      });
      res.json({ success: true });
    } catch (error) {
      res.status(403);
      res.json(error);
    }
  };

  deleteUser = async (req: Record<string, any>, res: Record<string, any>) => {
    const { username } = req.params;
    await this.userDB.delete(username);
    res.json({ success: true });
  };
}
