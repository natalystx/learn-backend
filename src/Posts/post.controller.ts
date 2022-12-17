import { json } from "body-parser";
import { last, toInteger } from "lodash";
import { getUserFromToken } from "../utils/getUserFromToken";
import PostDB from "./posts.db";

export default class PostController {
  private postDB: PostDB;
  constructor(postDB: PostDB) {
    this.postDB = postDB;
  }

  createPost = async (req: Record<string, any>, res: Record<string, any>) => {
    const token = req.headers["authorization"] as string;
    const user = getUserFromToken(last(token.split(" ")) || "");

    try {
      const { content, title } = req.body;
      await this.postDB.createPost({ content, title }, user.id || 0);
      res.json({ success: true });
    } catch (error) {
      res.status(403);
      res.json(error);
    }
  };

  getPosts = async (req: Record<string, any>, res: Record<string, any>) => {
    const token = req.headers["authorization"] as string;
    const user = getUserFromToken(last(token.split(" ")) || "");
    try {
      const post = await this.postDB.getPosts(user.id || 0);
      res.json(post);
    } catch (error) {
      res.status(403);
      res.json(error);
    }
  };

  getPostsById = async (req: Record<string, any>, res: Record<string, any>) => {
    const token = req.headers["authorization"] as string;
    const user = getUserFromToken(last(token.split(" ")) || "");
    const { postId } = req.params;
    try {
      const post = await this.postDB.getPostById(user.id || 0, postId);
      res.json(post);
    } catch (error) {
      res.status(403);
      res.json(error);
    }
  };

  deletePostById = async (
    req: Record<string, any>,
    res: Record<string, any>
  ) => {
    const token = req.headers["authorization"] as string;
    const user = getUserFromToken(last(token.split(" ")) || "");
    const { postId } = req.params;
    try {
      await this.postDB.deletePostById(user.id || 0, postId);
      res.json({ success: true });
    } catch (error) {
      res.status(403);
      res.json(error);
    }
  };

  editPost = async (req: Record<string, any>, res: Record<string, any>) => {
    const token = req.headers["authorization"] as string;
    const user = getUserFromToken(last(token.split(" ")) || "");
    const { postId, title, content } = req.body;
    try {
      const post = await this.postDB.getPosts(user.id || 0);
      if (
        post.filter((post) => post.id === toInteger(postId as string))
          .length !== 1
      ) {
        res.status(403);
        return;
      }

      await this.postDB.editPost(postId, { title, content });

      res.json({ success: true });
    } catch (error) {
      res.status(403);
      res.json(error);
    }
  };
}
