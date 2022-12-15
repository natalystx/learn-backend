import jwt from "jsonwebtoken";
import "dotenv";
import { last } from "lodash";
import { UserParams } from "../User/user.db";

export default class Authentication {
  private refreshTokens: string[] = [];
  private blocksAccessTokenList: string[] = [];

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

    this.refreshTokens.push(refreshToken);

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
    if (!token || this.blocksAccessTokenList.includes(token)) {
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

  refreshToken = (req: Record<string, any>, res: Record<string, any>) => {
    const { refreshToken, user } = req.body;

    if (!this.refreshTokens.includes(refreshToken)) {
      res.status(403);
      res.json("Unauthorized");
      return;
    }

    const accessToken = this.generateAccessToken(user);

    res.json({ accessToken });
  };

  signOut = (req: Record<string, any>, res: Record<string, any>) => {
    const { refreshToken } = req.body;
    const accessToken = last(req.headers["authorization"].split(" ")) as string;
    if (!refreshToken) {
      res.status(403);
      return;
    }
    this.refreshTokens = this.refreshTokens.filter(
      (token) => token !== (refreshToken as string)
    );

    this.blocksAccessTokenList.push(accessToken as string);
    res.json({ success: true });
  };
}
