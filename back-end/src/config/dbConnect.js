import mongoose from "mongoose";

async function conectaNaDatabase() {
	
	const connectionString = process.env.CONNECTION_STRING;

	try {
		await mongoose.connect(connectionString);
		console.log("Conexão com o MongoDB estabelecida com sucesso!");
	} catch (error) {
		console.error("Erro de conexão com o MongoDB:", error);
		throw error; // Lançar o erro para ser capturado em outro lugar
	}

	return mongoose.connection;
}

export default conectaNaDatabase;