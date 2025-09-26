import NaoEncontrado from "../erros/NaoEncontrado.js";
import { usuario } from "../models/index.js";

class UsuarioController {

	static async cadastrarUsuario(req, res, next) {

		const email = req.body.email;

		try {
			const emailExistente = await usuario.findOne({ email: email });
			
			if (emailExistente) {
				return res.status(409).json({ mensagem: "Esse email já está vinculado a uma conta" });
			} else {
				const novoUsuario = await usuario.create(req.body);
				res.status(201).json({ mensagem: "criado com sucesso", usuario: novoUsuario });
			}
		} catch (error) {
			next(error);
		}
	}

	static async listarUsuarios(req, res, next) {
		try {
			const listaUsuarios = await usuario.find({});
			res.status(200).json(listaUsuarios);
		} catch (error) {
			next(error);
		}
	}

	static async verificaLogin(req, res, next) {
		try {
			const usuarioEncontrado = await usuario.findOne({ email: req.body.email });

			if (!usuarioEncontrado) {
				return res.status(404).json({ mensagem: "Email não cadastrado" });
			}

			if (usuarioEncontrado.senha !== req.body.senha) {
				return res.status(401).json({ mensagem: "Senha incorreta!" });
			}

			res.status(200).json({ usuario: usuarioEncontrado });

		} catch (error) {
			next(error);
		}
	}

	static async atualizarUsuario(req, res, next){
		try {
			const id = req.params.id;            
			const usuarioAtualizado = await usuario.findByIdAndUpdate(id, req.body);

			if (usuarioAtualizado !== null) {
				res.status(200).json({message: "Usuário atualizado com sucesso!"});
			} else {
				next(new NaoEncontrado(`Usuário com ID ${id} não encontrado!`));
			}			
		} catch (error) {
			next(error);
		}        
	}  	
}

export default UsuarioController;