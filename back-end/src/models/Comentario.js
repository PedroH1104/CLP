import mongoose from "mongoose";

const comentarioSchema = new mongoose.Schema({
	id: { type: mongoose.Schema.Types.ObjectId },
	usuarioId: {
		type: String,
		required: [true, "O id do usuário é obrigatório"]
	},
	nomeUsuario: {
		type: String,
		required: [true, "O nome do usuário é obrigatório"]
	},
	postId: {
		type: String,
		required: [true, "O id do post é obrigatório"]
	},
	comentario: {
		type: String,
		required: [true, "O comentário não pode ser vazio"]
	},
	curtidas: {
		type: [String],
		default: []
	},
	data: {
		type: String || Date,	
		required: [true, "A data do post é obrigatória"]	
	},
}, { versionKey: false });

const comentario = mongoose.model("comentarios", comentarioSchema);

export {comentario, comentarioSchema};