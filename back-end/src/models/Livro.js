import mongoose from "mongoose";

const livroSchema = new mongoose.Schema({
	id: { type: mongoose.Schema.Types.ObjectId },
	titulo: {
		type: String,
		required: [true, "O título do livro é obritório"]
	},
	paginas: {
		type: Number,
		min: [10, "O número de páginas deve estar entre 10 e 5000"],
		max: [5000, "O número de páginas deve estar entre 10 e 5000"]		
	},
	usuarioId: {
		type: String,
		required: [true, "O id do usuário é obrigatório"]
	},
	categoria: {
		type: String,
		required: [true, "A categoria do livro é obrigatória"],
		enum: {
			values: ["Romance", "Ficção científica", "Fantasia", "Terror", "Suspense", "Drama", "Comédia", "Biografia", "Autobiografia", "Fábula", "Aventura", "Infantil", "Outro"],
			message: "A categoria '{VALUE}' não é válida!"
		}
	},
	imagem: {
		type: String,
		required: [true, "A imagem do livro é obrigatória"]
	},
	paginaAtual: {
		type: Number,
		default: 0,
	},
	concluido: {
		type: Boolean,
		default: false,
	},
	dataMeta: {
		type: String || Date,		
	},
	avaliacao: {
		type: Number,
		default: 0,
	}
}, { versionKey: false });

const livro = mongoose.model("livros", livroSchema);

export default livro;