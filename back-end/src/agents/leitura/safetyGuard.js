// Guarda de seguranca: bloqueia acoes sensiveis ate o usuario confirmar.
const acoesComConfirmacao = new Set(["excluir_livro"]);

export function avaliarSegurança(intencao, confirmar = false) {
	const precisaConfirmacao = acoesComConfirmacao.has(intencao.acao);

	if (!precisaConfirmacao) {
		return {
			permitido: true,
			precisaConfirmacao: false
		};
	}

	return {
		permitido: Boolean(confirmar),
		precisaConfirmacao: !confirmar,
		mensagem: "Esta acao altera dados de forma sensivel e precisa de confirmacao."
	};
}
