import "dotenv/config";
import conectaNaDatabase from "./src/config/dbConnect.js";
import Livro from "./src/models/Livro.js";
import Usuario from "./src/models/Usuario.js";
import Post from "./src/models/Post.js";
import AgenteLog from "./src/models/AgenteLog.js";
import mongoose from "mongoose";

const joaoId = new mongoose.Types.ObjectId();
const mariaId = new mongoose.Types.ObjectId();
const felipeId = new mongoose.Types.ObjectId();
const testadorId = new mongoose.Types.ObjectId();
const adminId = new mongoose.Types.ObjectId();

const capas = {
	aSombraDoVento: "https://m.media-amazon.com/images/I/91p3HUZop-L._UF1000,1000_QL80_.jpg",
	harryPotter: "https://m.media-amazon.com/images/I/81QnqHwRiUL._UF1000,1000_QL80_.jpg",
	1984: "https://m.media-amazon.com/images/I/61M9jDcsl2L._UF1000,1000_QL80_.jpg",
	oHobbit: "https://m.media-amazon.com/images/I/91M9xPIf10L.jpg",
	anneFrank: "https://m.media-amazon.com/images/I/61UWfPZuxJL._UF1000,1000_QL80_.jpg",
	dracula: "https://m.media-amazon.com/images/I/61MgodE1s0L._UF1000,1000_QL80_.jpg",
	pequenoPrincipe: "https://m.media-amazon.com/images/I/71LJ4k-k9hL.jpg",
	contoDuasCidades: "https://m.media-amazon.com/images/I/61fD+SMxHeL._UF1000,1000_QL80_.jpg",
	revolucaoBichos: "https://m.media-amazon.com/images/I/91BsZhxCRjL.jpg",
	mochileiro: "https://m.media-amazon.com/images/I/91NAJgaUlKL.jpg"
};

const usuariosData = [
	{
		_id: felipeId,
		nome: "Luis Felipe",
		email: "felipe@gmail.com",
		senha: "felipe123"
	},
	{
		_id: joaoId,
		nome: "Joao Victor",
		email: "joao@gmail.com",
		senha: "joao123"
	},
	{
		_id: mariaId,
		nome: "Maria Oliveira",
		email: "maria@gmail.com",
		senha: "maria123"
	},
	{
		_id: testadorId,
		nome: "Testador Oficial",
		email: "testador@gmail.com",
		senha: "testador123"
	},
	{
		_id: adminId,
		nome: "Administrador CLP",
		email: "admin@clp.com",
		senha: "admin123"
	}
];

function livroConcluido({ titulo, paginas, usuarioId, categoria, imagem, avaliacao, dataMeta }) {
	return {
		_id: new mongoose.Types.ObjectId(),
		titulo,
		paginas,
		usuarioId,
		categoria,
		imagem,
		paginaAtual: paginas,
		concluido: true,
		avaliacao,
		dataMeta
	};
}

const livrosData = [
	livroConcluido({
		titulo: "A Sombra do Vento",
		paginas: 400,
		usuarioId: joaoId,
		categoria: "Suspense",
		imagem: capas.aSombraDoVento,
		avaliacao: 5,
		dataMeta: "2025-09-22T00:39:00.000Z"
	}),
	livroConcluido({
		titulo: "A Sombra do Vento",
		paginas: 400,
		usuarioId: mariaId,
		categoria: "Suspense",
		imagem: capas.aSombraDoVento,
		avaliacao: 4,
		dataMeta: "2025-09-25T14:20:00.000Z"
	}),
	livroConcluido({
		titulo: "A Sombra do Vento",
		paginas: 400,
		usuarioId: felipeId,
		categoria: "Suspense",
		imagem: capas.aSombraDoVento,
		avaliacao: 5,
		dataMeta: "2025-09-26T19:10:00.000Z"
	}),
	livroConcluido({
		titulo: "Harry Potter e o Prisioneiro de Azkaban",
		paginas: 700,
		usuarioId: joaoId,
		categoria: "Fantasia",
		imagem: capas.harryPotter,
		avaliacao: 5,
		dataMeta: "2025-09-27T10:15:00.000Z"
	}),
	livroConcluido({
		titulo: "Harry Potter e o Prisioneiro de Azkaban",
		paginas: 700,
		usuarioId: mariaId,
		categoria: "Fantasia",
		imagem: capas.harryPotter,
		avaliacao: 4,
		dataMeta: "2025-09-28T17:45:00.000Z"
	}),
	livroConcluido({
		titulo: "Harry Potter e o Prisioneiro de Azkaban",
		paginas: 700,
		usuarioId: felipeId,
		categoria: "Fantasia",
		imagem: capas.harryPotter,
		avaliacao: 5,
		dataMeta: "2025-09-29T20:05:00.000Z"
	}),
	livroConcluido({
		titulo: "1984",
		paginas: 328,
		usuarioId: felipeId,
		categoria: "Drama",
		imagem: capas["1984"],
		avaliacao: 5,
		dataMeta: "2025-09-30T15:30:00.000Z"
	}),
	livroConcluido({
		titulo: "O Hobbit",
		paginas: 310,
		usuarioId: mariaId,
		categoria: "Fantasia",
		imagem: capas.oHobbit,
		avaliacao: 5,
		dataMeta: "2025-10-01T20:00:00.000Z"
	}),
	livroConcluido({
		titulo: "O Diario de Anne Frank",
		paginas: 350,
		usuarioId: felipeId,
		categoria: "Biografia",
		imagem: capas.anneFrank,
		avaliacao: 4,
		dataMeta: "2025-10-03T09:00:00.000Z"
	}),
	livroConcluido({
		titulo: "Dracula",
		paginas: 450,
		usuarioId: mariaId,
		categoria: "Terror",
		imagem: capas.dracula,
		avaliacao: 5,
		dataMeta: "2025-10-04T18:00:00.000Z"
	}),
	{
		_id: new mongoose.Types.ObjectId(),
		titulo: "A Revolucao dos Bichos",
		paginas: 152,
		usuarioId: joaoId,
		categoria: "Outro",
		imagem: capas.revolucaoBichos,
		paginaAtual: 0,
		concluido: false,
		avaliacao: 0
	},
	{
		_id: new mongoose.Types.ObjectId(),
		titulo: "O Pequeno Principe",
		paginas: 96,
		usuarioId: felipeId,
		categoria: "Infantil",
		imagem: capas.pequenoPrincipe,
		paginaAtual: 50,
		concluido: false,
		avaliacao: 0
	},
	{
		_id: new mongoose.Types.ObjectId(),
		titulo: "Um Conto de Duas Cidades",
		paginas: 489,
		usuarioId: mariaId,
		categoria: "Drama",
		imagem: capas.contoDuasCidades,
		paginaAtual: 120,
		concluido: false,
		avaliacao: 0
	},
	{
		_id: new mongoose.Types.ObjectId(),
		titulo: "O Guia do Mochileiro das Galaxias",
		paginas: 200,
		usuarioId: joaoId,
		categoria: "Outro",
		imagem: capas.mochileiro,
		paginaAtual: 90,
		concluido: false,
		avaliacao: 0
	}
];

const postsData = [
	{
		_id: new mongoose.Types.ObjectId(),
		autor: joaoId,
		nomeAutor: "Joao Victor",
		nomeLivro: "A Sombra do Vento",
		descricao: "Um suspense de tirar o folego. A ambientacao prende desde o comeco.",
		avaliacao: 5,
		curtidas: [felipeId, mariaId],
		imagem: capas.aSombraDoVento,
		data: "2025-09-24T00:40:00.000Z"
	},
	{
		_id: new mongoose.Types.ObjectId(),
		autor: mariaId,
		nomeAutor: "Maria Oliveira",
		nomeLivro: "A Sombra do Vento",
		descricao: "Gostei muito da atmosfera e da forma como o misterio cresce aos poucos.",
		avaliacao: 4,
		curtidas: [felipeId],
		imagem: capas.aSombraDoVento,
		data: "2025-09-25T14:20:00.000Z"
	},
	{
		_id: new mongoose.Types.ObjectId(),
		autor: felipeId,
		nomeAutor: "Luis Felipe",
		nomeLivro: "A Sombra do Vento",
		descricao: "Bem envolvente, principalmente para quem gosta de trama literaria e suspense.",
		avaliacao: 5,
		curtidas: [joaoId, mariaId],
		imagem: capas.aSombraDoVento,
		data: "2025-09-26T19:10:00.000Z"
	},
	{
		_id: new mongoose.Types.ObjectId(),
		autor: joaoId,
		nomeAutor: "Joao Victor",
		nomeLivro: "Harry Potter e o Prisioneiro de Azkaban",
		descricao: "A historia fica mais madura e o ritmo prende bastante. Um dos melhores da saga.",
		avaliacao: 5,
		curtidas: [felipeId, mariaId],
		imagem: capas.harryPotter,
		data: "2025-09-27T10:15:00.000Z"
	},
	{
		_id: new mongoose.Types.ObjectId(),
		autor: mariaId,
		nomeAutor: "Maria Oliveira",
		nomeLivro: "Harry Potter e o Prisioneiro de Azkaban",
		descricao: "Gostei dos personagens e do clima mais sombrio. A leitura passa rapido.",
		avaliacao: 4,
		curtidas: [joaoId],
		imagem: capas.harryPotter,
		data: "2025-09-28T17:45:00.000Z"
	},
	{
		_id: new mongoose.Types.ObjectId(),
		autor: felipeId,
		nomeAutor: "Luis Felipe",
		nomeLivro: "Harry Potter e o Prisioneiro de Azkaban",
		descricao: "Muito bom para revisitar a saga. Tem aventura, misterio e bons momentos de emocao.",
		avaliacao: 5,
		curtidas: [joaoId, mariaId],
		imagem: capas.harryPotter,
		data: "2025-09-29T20:05:00.000Z"
	},
	{
		_id: new mongoose.Types.ObjectId(),
		autor: felipeId,
		nomeAutor: "Luis Felipe",
		nomeLivro: "1984",
		descricao: "Um classico atemporal. Assustadoramente relevante.",
		avaliacao: 5,
		curtidas: [joaoId, mariaId],
		imagem: capas["1984"],
		data: "2025-08-30T15:35:00.000Z"
	},
	{
		_id: new mongoose.Types.ObjectId(),
		autor: mariaId,
		nomeAutor: "Maria Oliveira",
		nomeLivro: "O Hobbit",
		descricao: "Uma jornada epica. Recomendo para quem gosta de fantasia classica.",
		avaliacao: 5,
		curtidas: [joaoId, felipeId],
		imagem: capas.oHobbit,
		data: "2025-08-01T20:05:00.000Z"
	},
	{
		_id: new mongoose.Types.ObjectId(),
		autor: felipeId,
		nomeAutor: "Luis Felipe",
		nomeLivro: "O Diario de Anne Frank",
		descricao: "Uma leitura essencial e muito tocante.",
		avaliacao: 4,
		curtidas: [mariaId],
		imagem: capas.anneFrank,
		data: "2025-09-03T09:05:00.000Z"
	},
	{
		_id: new mongoose.Types.ObjectId(),
		autor: mariaId,
		nomeAutor: "Maria Oliveira",
		nomeLivro: "Dracula",
		descricao: "Um classico do terror que ainda assusta. Excelente.",
		avaliacao: 5,
		curtidas: [joaoId, felipeId],
		imagem: capas.dracula,
		data: "2025-09-04T18:05:00.000Z"
	}
];

async function seedDatabase() {
	console.log("Iniciando o povoamento do banco de dados com dados realistas...");
	let conexao;

	try {
		conexao = await conectaNaDatabase();

		await Livro.deleteMany({});
		await Usuario.deleteMany({});
		await Post.deleteMany({});
		await AgenteLog.deleteMany({});
		console.log("Colecoes limpas com sucesso.");

		await Usuario.insertMany(usuariosData);
		console.log("Usuarios inseridos com sucesso.");

		await Livro.insertMany(livrosData);
		console.log("Livros inseridos com sucesso.");

		await Post.insertMany(postsData);
		console.log("Posts inseridos com sucesso.");

		console.log("Historico de agentes limpo. Novos logs serao gerados apenas nos testes.");
		console.log("Povoamento finalizado com sucesso.");
	} catch (error) {
		console.error("Erro durante o povoamento:", error);
	} finally {
		if (conexao) {
			await mongoose.connection.close();
		}
	}
}

seedDatabase();
