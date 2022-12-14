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

    return result as UserParams[];
  }

  async register(param: UserParams) {
    if (!this.db) return;
    const [result] = await this.db?.query(
      `
        INSERT INTO users (username, password) VALUES ('${param.username}', '${param.password}')
    `
    );

    return result;
  }
}
