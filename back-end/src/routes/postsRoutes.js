import express from "express";
import PostController from "../controllers/postController.js";

const routes = express.Router();

routes.post("/posts", PostController.criaPost);
routes.get("/posts", PostController.listarPosts);
routes.put("/posts/editaCurtida/:id", PostController.editarCurtida);
routes.delete("/posts/:id", PostController.deletarPost);

export default routes;