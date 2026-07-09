import mongoose from "mongoose";

const agenteLogSchema = new mongoose.Schema({
	usuarioId: {
		type: String,
		required: [true, "O id do usuario e obrigatorio"]
	},
	texto: {
		type: String,
		required: [true, "O texto do comando e obrigatorio"]
	},
	acao: {
		type: String,
		required: [true, "A acao do agente e obrigatoria"]
	},
	origemInterpretacao: {
		type: String,
		enum: ["openai"],
		default: "openai"
	},
	parametros: {
		type: Object,
		default: {}
	},
	sucesso: {
		type: Boolean,
		default: false
	},
	mensagem: {
		type: String,
		default: ""
	},
	precisaConfirmacao: {
		type: Boolean,
		default: false
	},
	traceBDI: {
		type: Object
	},
	pendencia: {
		type: Object
	},
	data: {
		type: Date,
		default: Date.now
	}
}, { versionKey: false });

const agenteLog = mongoose.model("agente_logs", agenteLogSchema);

export default agenteLog;
