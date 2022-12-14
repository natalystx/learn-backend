import "dotenv/config";
import mysql from "mysql2/promise";

export default class Database {
  private db?: mysql.Connection;

  async init() {
    this.db = await mysql.createConnection(process.env.DATABASE_URL || "");
  }

  async connect() {
    await this.db?.connect();
  }

  getInstance() {
    return this.db;
  }

  async disconnect() {
    await this.db?.end();
  }
}
