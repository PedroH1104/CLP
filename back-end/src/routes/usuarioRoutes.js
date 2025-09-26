import express from "express";
import UsuarioController from "../controllers/usuarioController.js";

const routes = express.Router();

routes.post("/usuarios", UsuarioController.cadastrarUsuario);
routes.get("/usuarios", UsuarioController.listarUsuarios);
routes.post("/usuarios/verificaLogin", UsuarioController.verificaLogin);
routes.put("/usuarios/:id", UsuarioController.atualizarUsuario);

export default routes;