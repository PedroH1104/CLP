import { comentario } from "../models/Comentario.js";

class ComentarioController {
	static async criaComentario(req, res, next){
		try {
			const novoComentario = await comentario.create(req.body);
			res.status(201).json({ message: "Comentário criado com sucesso", comentario: novoComentario});
		} catch (error) {
			next(error);
		}
	}
}

export default ComentarioController;