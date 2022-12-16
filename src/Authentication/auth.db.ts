import { Connection } from "mysql2/promise";

type Token = {
  id: string;
  token: string;
};

export default class AuthDB {
  private db: Connection;
  constructor(db: Connection) {
    this.db = db;
    this.db.query(`CREATE TABLE IF NOT EXISTS refresh_tokens (
    id int NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (\`id\`),
    token VARCHAR(255),    
    UNIQUE (\`token\`)
  )`);
  }

  hasThisRefreshToken = async (token: string) => {
    const [result] = await this.db.query(
      `SELECT * FROM refresh_tokens WHERE token='${token}'`
    );

    return (
      (result as Token[]).filter((item) => item.token === token).length === 1
    );
  };

  storeRefreshToken = async (token: string) => {
    const [result] = await this.db.execute(
      `INSERT INTO refresh_tokens (token) VALUES ('${token}')`
    );
  };

  deleteRefreshToken = async (token: string) => {
    await this.db.execute(`DELETE FROM refresh_tokens WHERE token='${token}'`);
  };
}
