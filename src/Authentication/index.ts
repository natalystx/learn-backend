import jwt from "jsonwebtoken";
import "dotenv";
import { last } from "lodash";
import { UserParams } from "../User/user.db";
import { Connection } from "mysql2/promise";
import AuthDB from "./auth.db";

export default class Authentication {
  private authDB: AuthDB;

  constructor(db: Connection) {
    this.authDB = new AuthDB(db);
  }

  generateAccessToken = (user: UserParams) => {
    const accessToken = jwt.sign(
      user,
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    return accessToken;
  };

  generateRefreshToken = (user: UserParams) => {
    const refreshToken = jwt.sign(
      user,
      process.env.REFRESH_TOKEN_SECRET as string
    );
    this.authDB.storeRefreshToken(refreshToken);

    return refreshToken;
  };

  private unauthorizedUser = (res: Record<string, any>) => {
    res.status(401);
    res.json({
      error: "Unauthorized",
    });

    return;
  };

  authenticate = (
    req: Record<string, any>,
    res: Record<string, any>,
    next: () => void
  ) => {
    const token = last(req.headers["authorization"]?.split(" ")) as string;
    if (!token) {
      this.unauthorizedUser(res);

      return;
    }

    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
      (err, user) => {
        if (err) this.unauthorizedUser(res);
        req.user = user;
        next();
      }
    );
  };

  refreshToken = async (req: Record<string, any>, res: Record<string, any>) => {
    const { refreshToken, user } = req.body;
    const hasRefreshTokenInDB = await this.authDB.hasThisRefreshToken(
      refreshToken
    );

    if (!hasRefreshTokenInDB) {
      res.status(403);
      res.json("Unauthorized");
      return;
    }

    await this.authDB.deleteRefreshToken("refreshToken");

    const accessToken = this.generateAccessToken(user);

    res.json({ accessToken });
  };

  signOut = (req: Record<string, any>, res: Record<string, any>) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(403);
      return;
    }
    this.authDB.deleteRefreshToken(refreshToken);
    res.json({ success: true });
  };
}
