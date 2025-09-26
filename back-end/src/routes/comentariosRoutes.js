import express from "express";
import ComentarioController from "../controllers/comentarioController.js";

const routes = express.Router();

routes.post("/comentarios", ComentarioController.criaComentario);

export default routes;