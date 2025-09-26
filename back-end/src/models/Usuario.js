import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
	id: { type: mongoose.Schema.Types.ObjectId },
	nome: { 
		type: String, 
		required: [true, "O nome do(a) usuário(a) é obritório"] 
	},
	email: { 
		type: String, 
		required: [true, "O email do(a) usuário(a) é obritório"]  
	},
	senha: { 
		type: String, 
		required: [true, "O campo senha é obritório"] 
	},    
	imagem: { type: String },    
}, { versionKey: false});

const usuario = mongoose.model("usuarios", usuarioSchema);

export default usuario;