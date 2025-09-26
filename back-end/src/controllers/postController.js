import NaoEncontrado from "../erros/NaoEncontrado.js";
import { post } from "../models/index.js";

class PostController {

	static async criaPost(req, res, next) {
		try {
			const novoPost = await post.create(req.body);
			res.status(201).json({ message: "Post publicado com sucesso", post: novoPost });
		} catch (error) {
			next(error);
		}
	}

	static async listarPosts(req, res, next) {
		try {
			const listaPosts = await post.find({}).sort({ data: -1 }); // Ordena por data (mais recente primeiro)
			res.status(200).json(listaPosts);
		} catch (error) {
			next(error);
		}
	}

	static async editarCurtida(req, res, next) {
		try {
			const id = req.params.id;
			const { autor } = req.body; // Pegando o autor do corpo da requisição

			// Encontrar o post pelo ID
			const postEncontrado = await post.findById(id);

			if (!postEncontrado) {
				return next(new NaoEncontrado(`Post com ID ${id} não encontrado!`));
			}

			const index = postEncontrado.curtidas.indexOf(autor);

			if (index !== -1) {
				postEncontrado.curtidas.splice(index, 1);
			} else {
				postEncontrado.curtidas.push(autor);
			}

			await postEncontrado.save();

			res.status(200).json({ message: "Curtida atualizada com sucesso!", curtidas: postEncontrado.curtidas });
		} catch (error) {
			next(error);
		}
	}
	
	static async deletarPost(req, res, next) {
		try {
			const id = req.params.id;
			const postExcluido = await post.findByIdAndDelete(id);
			if (postExcluido !== null) {
				res.status(200).json({ message: "Post excluído com sucesso!" });
			} else {
				next(new NaoEncontrado(`Post com ID ${id} não encontrado!`));
			}

		} catch (error) {
			next(error);
		}
	}
		
}

export default PostController;