const imagemPadrao = "https://placehold.co/300x450?text=Livro";

function montarUrlGoogleBooks(consulta) {
	const params = new URLSearchParams({
		q: consulta,
		maxResults: "10",
		printType: "books"
	});

	if (process.env.GOOGLE_BOOKS_API_KEY) {
		params.set("key", process.env.GOOGLE_BOOKS_API_KEY);
	}

	return `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;
}

function normalizarImagem(imagem) {
	return imagem?.replace("http://", "https://");
}

function escolherImagem(dados) {
	const itens = dados.items || [];
	const itemComImagem = itens.find((item) =>
		item.volumeInfo?.imageLinks?.thumbnail ||
		item.volumeInfo?.imageLinks?.smallThumbnail
	);

	const imagem =
		itemComImagem?.volumeInfo?.imageLinks?.thumbnail ||
		itemComImagem?.volumeInfo?.imageLinks?.smallThumbnail;

	return normalizarImagem(imagem);
}

export async function buscarImagemLivro(titulo) {
	if (!titulo) return imagemPadrao;

	const consultas = [
		`intitle:"${titulo}"`,
		`intitle:${titulo}`,
		titulo
	];

	try {
		for (const consulta of consultas) {
			const resposta = await fetch(montarUrlGoogleBooks(consulta));

			if (!resposta.ok) {
				console.error("[buscarImagemLivro] Google Books falhou", resposta.status);
				continue;
			}

			const dados = await resposta.json();
			const imagem = escolherImagem(dados);

			console.log("[buscarImagemLivro] Google Books", {
				titulo,
				consulta,
				totalItems: dados.totalItems,
				encontrouImagem: Boolean(imagem)
			});

			if (imagem) {
				return imagem;
			}
		}

		return imagemPadrao;
	} catch (error) {
		console.error("[buscarImagemLivro] Erro no Google Books", error.message);
		return imagemPadrao;
	}
}

export { imagemPadrao };
