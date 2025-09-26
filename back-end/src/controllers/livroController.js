import NaoEncontrado from "../erros/NaoEncontrado.js";
import { livro } from "../models/index.js";

class LivroController {

	static async listarLivros(req, res, next){
		try {			
			const listaLivros = await livro.find({});
			res.status(200).json(listaLivros);
		} catch (error) {
			next(error);
		}        
	}   

	static async listarLivroPorId(req, res, next){
		try {
			const id = req.params.id;
			const livroEncontrado = await livro.findById(id);

			if (livroEncontrado !== null) {
				res.status(200).json(livroEncontrado);
			} else {
				next(new NaoEncontrado(`Livro com ID: ${id} não encontrado.`));
			}
		} catch (error) {
			next(error);
		}        
	}   

	static async cadastrarLivro(req, res, next){
		try {
			const novoLivro = await livro.create(req.body);
			res.status(201).json({ message: "Livro criado com sucesso", livro: novoLivro});
		} catch (error) {
			next(error);
		}
	}

	static async atualizarLivro(req, res, next){
		try {
			const id = req.params.id;            
			const livroAtualizado = await livro.findByIdAndUpdate(id, req.body);

			if (livroAtualizado !== null) {
				res.status(200).json({message: "Livro atualizado com sucesso!"});
			} else {
				next(new NaoEncontrado(`Livro com ID ${id} não encontrado!`));
			}			
		} catch (error) {
			next(error);
		}        
	}     
    
	static async excluirLivro(req, res, next){
		try {
			const id = req.params.id;            
			const livroExcluido = await livro.findByIdAndDelete(id);
			if (livroExcluido !== null) {
				res.status(200).json({message: "Livro excluído com sucesso!"});
			} else {
				next(new NaoEncontrado(`Livro com ID ${id} não encontrado!`));
			}
			
		} catch (error) {
			next(error);
		}        
	}
    
	static async buscarLivrosPorUsuario(req, res, next){
		const usuarioId = req.query.usuario;
		try {
			const livrosDoUsuario = await livro.find({ usuarioId: usuarioId});
			res.status(200).json(livrosDoUsuario);
		} catch (error) {
			next(error);
		}
	}

}

export default LivroController;