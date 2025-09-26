import "dotenv/config";
import conectaNaDatabase from "./src/config/dbConnect.js";
import Livro from "./src/models/Livro.js";
import Usuario from "./src/models/Usuario.js";
import Post from "./src/models/Post.js";
import mongoose from "mongoose";

// CRIAÇÃO DOS IDs QUE SERÃO REUTILIZADOS
// Criamos ObjectIDs para os usuários, pois eles serão referenciados em outros documentos.
const joaoId = new mongoose.Types.ObjectId();
const mariaId = new mongoose.Types.ObjectId();
const felipeId = new mongoose.Types.ObjectId();
const testadorId = new mongoose.Types.ObjectId();

// DADOS DE USUÁRIOS
const usuariosData = [
	{
		_id: felipeId,
		nome: "Luis Felipe",
		email: "felipe@gmail.com",
		senha: "felipe123"
	},
	{
		_id: joaoId,
		nome: "João Victor",
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
	}
];

// DADOS DE LIVROS
const livrosData = [
	{
		_id: new mongoose.Types.ObjectId(),
		titulo: "A Sombra do Vento",
		paginas: 400,
		usuarioId: joaoId,
		categoria: "Suspense",
		imagem: "https://m.media-amazon.com/images/I/91p3HUZop-L._UF1000,1000_QL80_.jpg",
		paginaAtual: 400,
		concluido: true,
		avaliacao: 5,
		dataMeta: "2025-09-22T00:39:00.000Z"
	},
	{
		_id: new mongoose.Types.ObjectId(),
		titulo: "O Guia do Mochileiro das Galáxias",
		paginas: 200,
		usuarioId: joaoId,
		categoria: "Ficção científica",
		imagem: "https://m.media-amazon.com/images/I/91NAJgaUlKL.jpg",
		paginaAtual: 200,
		concluido: true,
		avaliacao: 4,
		dataMeta: "2025-09-29T10:00:00.000Z"
	},
	{
		_id: new mongoose.Types.ObjectId(),
		titulo: "1984",
		paginas: 328,
		usuarioId: felipeId,
		categoria: "Drama",
		imagem: "https://m.media-amazon.com/images/I/61M9jDcsl2L._UF1000,1000_QL80_.jpg",
		paginaAtual: 328,
		concluido: true,
		avaliacao: 5,
		dataMeta: "2025-09-30T15:30:00.000Z"
	},
	{
		_id: new mongoose.Types.ObjectId(),
		titulo: "O Hobbit",
		paginas: 310,
		usuarioId: mariaId,
		categoria: "Fantasia",
		imagem: "https://m.media-amazon.com/images/I/91M9xPIf10L.jpg",
		paginaAtual: 310,
		concluido: true,
		avaliacao: 5,
		dataMeta: "2025-10-01T20:00:00.000Z"
	},
	{
		_id: new mongoose.Types.ObjectId(),
		titulo: "Harry Potter e o Prisioneiro de Askabam",
		paginas: 700,
		usuarioId: joaoId,
		categoria: "Fantasia",
		imagem: "https://m.media-amazon.com/images/I/81QnqHwRiUL._UF1000,1000_QL80_.jpg",
		paginaAtual: 700,
		concluido: true,
		avaliacao: 5,
		dataMeta: "2025-10-02T12:00:00.000Z"
	},
	{
		_id: new mongoose.Types.ObjectId(),
		titulo: "O Diário de Anne Frank",
		paginas: 350,
		usuarioId: felipeId,
		categoria: "Biografia",
		imagem: "https://m.media-amazon.com/images/I/61UWfPZuxJL._UF1000,1000_QL80_.jpg",
		paginaAtual: 350,
		concluido: true,
		avaliacao: 4,
		dataMeta: "2025-10-03T09:00:00.000Z"
	},
	{
		_id: new mongoose.Types.ObjectId(),
		titulo: "Drácula",
		paginas: 450,
		usuarioId: mariaId,
		categoria: "Terror",
		imagem: "https://m.media-amazon.com/images/I/61MgodE1s0L._UF1000,1000_QL80_.jpg",
		paginaAtual: 450,
		concluido: true,
		avaliacao: 5,
		dataMeta: "2025-10-04T18:00:00.000Z"
	},
	{
		_id: new mongoose.Types.ObjectId(),
		titulo: "A Revolução dos Bichos",
		paginas: 152,
		usuarioId: joaoId,
		categoria: "Fábula",
		imagem: "https://m.media-amazon.com/images/I/91BsZhxCRjL.jpg",
		paginaAtual: 0,
		concluido: false,
		avaliacao: 0,
	},
	{
		_id: new mongoose.Types.ObjectId(),
		titulo: "O Pequeno Príncipe",
		paginas: 96,
		usuarioId: felipeId,
		categoria: "Infantil",
		imagem: "https://m.media-amazon.com/images/I/71LJ4k-k9hL.jpg",
		paginaAtual: 50,
		concluido: false,
		avaliacao: 0,
	},
	{
		_id: new mongoose.Types.ObjectId(),
		titulo: "Um Conto de Duas Cidades",
		paginas: 489,
		usuarioId: mariaId,
		categoria: "Drama",
		imagem: "https://m.media-amazon.com/images/I/61fD+SMxHeL._UF1000,1000_QL80_.jpg",
		paginaAtual: 120,
		concluido: false,
		avaliacao: 0,
	},
];

// DADOS DE POSTS
const postsData = [
	{
		_id: new mongoose.Types.ObjectId(),
		autor: joaoId,
		nomeAutor: "João Victor",
		nomeLivro: "A Sombra do Vento",
		descricao: "Um suspense de tirar o fôlego!",
		avaliacao: 5,
		curtidas: [felipeId, mariaId],
		imagem: "https://m.media-amazon.com/images/I/91p3HUZop-L._UF1000,1000_QL80_.jpg",
		data: "2025-09-24T00:40:00.000Z"
	},	
	{
		_id: new mongoose.Types.ObjectId(),
		autor: felipeId,
		nomeAutor: "Luis Felipe",
		nomeLivro: "1984",
		descricao: "Um clássico atemporal. Assustadoramente relevante.",
		avaliacao: 5,
		curtidas: [joaoId, mariaId],
		imagem: "https://m.media-amazon.com/images/I/61M9jDcsl2L._UF1000,1000_QL80_.jpg",
		data: "2025-08-30T15:35:00.000Z"
	},
	{
		_id: new mongoose.Types.ObjectId(),
		autor: mariaId,
		nomeAutor: "Maria Oliveira",
		nomeLivro: "O Hobbit",
		descricao: "Uma jornada épica! Recomendo a todos.",
		avaliacao: 5,
		curtidas: [joaoId, felipeId],
		imagem: "https://m.media-amazon.com/images/I/91M9xPIf10L.jpg",
		data: "2025-08-01T20:05:00.000Z"
	},	
	{
		_id: new mongoose.Types.ObjectId(),
		autor: felipeId,
		nomeAutor: "Luis Felipe",
		nomeLivro: "O Diário de Anne Frank",
		descricao: "Uma leitura essencial e muito tocante.",
		avaliacao: 4,
		curtidas: [mariaId],
		imagem: "https://m.media-amazon.com/images/I/61UWfPZuxJL._UF1000,1000_QL80_.jpg",
		data: "2025-09-03T09:05:00.000Z"
	},
	{
		_id: new mongoose.Types.ObjectId(),
		autor: mariaId,
		nomeAutor: "Maria Oliveira",
		nomeLivro: "Drácula",
		descricao: "Um clássico do terror que ainda assusta. Excelente!",
		avaliacao: 5,
		curtidas: [joaoId, felipeId],
		imagem: "https://m.media-amazon.com/images/I/61MgodE1s0L._UF1000,1000_QL80_.jpg",
		data: "2025-09-04T18:05:00.000Z"
	}
];

async function seedDatabase() {
	console.log("Iniciando o povoamento do banco de dados com dados realistas...");
	let conexao;
	try {
		conexao = await conectaNaDatabase();

		// Limpar coleções existentes
		await Livro.deleteMany({});
		await Usuario.deleteMany({});
		await Post.deleteMany({});
		console.log("Coleções limpas com sucesso.");

		// Inserir usuários primeiro
		await Usuario.insertMany(usuariosData);
		console.log("Usuários inseridos com sucesso.");

		// Inserir livros com referências aos usuários
		await Livro.insertMany(livrosData);
		console.log("Livros inseridos com sucesso.");

		// Inserir posts com referências aos usuários
		await Post.insertMany(postsData);
		console.log("Posts inseridos com sucesso.");


		console.log("Povoamento finalizado com sucesso!");

	} catch (error) {
		console.error("Erro durante o povoamento:", error);
	} finally {
		if (conexao) {
			await mongoose.connection.close();
		}
	}
}

seedDatabase();
