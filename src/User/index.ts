import { ResultSetHeader } from "mysql2";
import Database from "../Database";

export type UserParams = {
  id?: number;
  username: string;
  password: string;
};

export default class User {
  private db;
  private disconnect;

  constructor(db: Database) {
    this.db = db.getInstance();
    this.disconnect = () => db.disconnect();
    this.db.query<ResultSetHeader>(
      `CREATE TABLE IF NOT EXISTS users (
    id int NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (\`id\`),
    username VARCHAR(255),
    password VARCHAR(255),
    UNIQUE (\`username\`)
  )`
    );
  }

  findUser(param: UserParams) {
    const result = this.db.execute(
      `
        SELECT * FROM users WHERE username = '${param.username}' AND password = '${param.password}'
    `,
      (err, res) => {
        if (!err) this.db.emit("get-user", res);
      }
    );
    this.disconnect();
    return result;
  }

  register(param: UserParams) {
    const result = this.db.query(
      `
        INSERT INTO users (username, password) VALUES ('${param.username}', '${param.password}')
    `
    );
    this.disconnect();

    return result;
  }
}
