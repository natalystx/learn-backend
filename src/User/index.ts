import { ResultSetHeader } from "mysql2";
import Database from "../Database";

export type UserParams = {
  id?: number;
  username: string;
  password: string;
};

export default class User {
  private db;

  constructor(db: Database) {
    this.db = db.getInstance();

    this.db?.query<ResultSetHeader>(
      `CREATE TABLE IF NOT EXISTS users (
    id int NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (\`id\`),
    username VARCHAR(255),
    password VARCHAR(255),
    UNIQUE (\`username\`)
  )`
    );
  }

  async findUser(param: UserParams) {
    if (!this.db) return;
    const [result] = await this.db?.query(
      `
        SELECT * FROM users WHERE username = '${param.username}' AND password = '${param.password}'
    `
    );

    if (!(result as UserParams[]).length) {
      throw new Error("User doesn't exist");
    }
    return result as UserParams[];
  }

  async register(param: UserParams) {
    if (!this.db) return;
    await this.db?.query(
      `
        INSERT INTO users (username, password) VALUES ('${param.username}', '${param.password}')
    `
    );

    return this.findUser(param);
  }

  async changePassword(param: UserParams & { oldPassword: string }) {
    const { username, password, oldPassword } = param;
    const user = await this.findUser({ username, password: oldPassword });

    if (!user) {
      throw new Error("User doesn't exist");
    }

    const result = await this.db?.execute(
      `UPDATE users SET password='${password}' WHERE username='${username}'`
    );

    return result;
  }

  async delete(username: string) {
    const result = await this.db?.execute(
      `DELETE FROM users WHERE username='${username}'`
    );
    return result;
  }
}
