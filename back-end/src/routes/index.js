import express from "express";
import livros from "./livrosRoutes.js";
import usuarios from "./usuarioRoutes.js";
import posts from "./postsRoutes.js";
import comentarios from "./comentariosRoutes.js";

const routes = (app) => {
	app.route("/").get((req, res) => res.status(200).send("Api do CLP"));

	app.use(express.json(), livros, usuarios, posts, comentarios);    
};

export default routes;