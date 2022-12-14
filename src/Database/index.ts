import "dotenv/config";
import mysql from "mysql2";

export default class Database {
  private db = mysql.createConnection(process.env.DATABASE_URL || "");

  connect() {
    this.db.connect();
  }

  getInstance() {
    return this.db;
  }

  disconnect() {
    this.db.end();
  }
}
