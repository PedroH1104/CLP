import mongoose from "mongoose";

async function conectaNaDatabase() {
	const username = process.env.USERNAME_STRING;
	const password = process.env.PASSWORD_STRING;

	// Use template literals (crases) para construir a string de conexão
	const connectionString = `mongodb+srv://${username}:${password}@cluster0.acm5m.mongodb.net/CLP?retryWrites=true&w=majority&appName=Cluster0`;

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