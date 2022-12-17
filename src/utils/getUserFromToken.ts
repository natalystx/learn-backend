import jwt from "jsonwebtoken";
import "dotenv";
import { UserParams } from "../User/user.db";

export const getUserFromToken = (token: string) => {
  const result = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
  return result as unknown as Omit<UserParams, "password">;
};
