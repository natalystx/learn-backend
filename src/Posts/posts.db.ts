import { Connection } from "mysql2/promise";

type Post = {
  content: string;
  title: string;
};

export default class PostDB {
  private db: Connection;
  constructor(db: Connection) {
    this.db = db;
    this.db.execute(`CREATE TABLE IF NOT EXISTS posts (
    id int NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (\`id\`),
    content VARCHAR(255),   
    title VARCHAR(255),
    userId int    
  )`);
  }

  createPost = async (post: Post, userId: number) => {
    const { content, title } = post;
    await this.db.execute(
      `INSERT INTO posts (content, title, userId) VALUES ('${content}','${title}','${userId}')`
    );
  };

  getPosts = async (userId: number) => {
    const posts = await this.db.query(
      `SELECT * FROM posts WHERE userId='${userId}'`
    );

    return posts[0] as unknown as Post & { id: number }[];
  };

  deletePostById = async (userId: number, postId: number) => {
    await this.db.execute(
      `DELETE FROM posts WHERE id='${postId}' AND userId='${userId}'`
    );
  };

  getPostById = async (userId: number, postId: number) => {
    const posts = await this.db.query(
      `SELECT * FROM posts WHERE userId='${userId}' AND id='${postId}'`
    );

    return posts[0] as unknown as Post & { id: number }[];
  };

  editPost = async (postId: number, post: Post) => {
    const { content, title } = post;
    await this.db.execute(
      `UPDATE posts SET content = '${content}', title = '${title}' WHERE id = '${postId}'`
    );
  };
}
