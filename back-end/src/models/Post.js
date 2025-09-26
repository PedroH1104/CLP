import mongoose from "mongoose";
import { comentarioSchema } from "./Comentario.js";

const postSchema = new mongoose.Schema({
	id: { type: mongoose.Schema.Types.ObjectId },
	autor: {
		type: String,
		required: [true, "O id do autor é obrigatório."]
	},
	nomeAutor: {
		type: String,
		required: [true, "O nome do autor é obrigatório."]
	},
	nomeLivro: {
		type: String,
		required: [true, "O nome do livro é obrigatório."]
	},
	descricao: { type: String },
	avaliacao: {
		type: Number,
		required: [true, "A avalição é obrigatória."]
	},
	curtidas: {
		type: [String],
		default: []
	},
	comentarios: {
		type: [comentarioSchema],
		default: []
	},
	imagem: {
		type: String,
		required: [true, "A imagem do livro é obrigatória"]
	},
	data: {
		type: String || Date,	
		required: [true, "A data do post é obrigatória"]	
	},
}, { versionKey: false });

const post = mongoose.model("posts", postSchema);

export default post;